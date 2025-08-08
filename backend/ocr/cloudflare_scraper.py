#!/usr/bin/env python3
"""
Cloudflare-aware scraper for Pak'nSave
Handles Cloudflare protection that blocks regular requests
"""

import asyncio
import json
import time
import random
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
import aiohttp
import os
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

@dataclass
class ScrapedPrice:
    store_id: str
    item_name: str
    price: Decimal
    date: datetime
    url: str
    confidence: float = 1.0
    volume_size: Optional[str] = None
    image_url: Optional[str] = None

class CloudflareScraper:
    def __init__(self):
        self.session = None
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ]
    
    def _get_proxies(self) -> List[str]:
        http_proxies = os.getenv("HTTP_PROXIES", "").strip()
        scraper_proxies = os.getenv("SCRAPER_PROXIES", "").strip()
        parts: List[str] = []
        if http_proxies:
            parts.extend([p.strip() for p in http_proxies.split(",") if p.strip()])
        if scraper_proxies:
            parts.extend([p.strip() for p in scraper_proxies.split(",") if p.strip()])
        return parts

    async def create_session(self):
        """Create session with Cloudflare-friendly settings"""
        timeout = aiohttp.ClientTimeout(total=30)
        connector = aiohttp.TCPConnector(
            limit=10,
            ttl_dns_cache=300,
            use_dns_cache=True,
        )
        
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            connector=connector,
            headers={
                'User-Agent': random.choice(self.user_agents),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0',
            }
        )
    
    async def close_session(self):
        """Close the session"""
        if self.session:
            await self.session.close()
    
    async def get_with_retry(self, url: str, max_retries: int = 3) -> Optional[str]:
        """Get URL with retry logic for Cloudflare challenges"""
        if not self.session:
            await self.create_session()
        proxies = self._get_proxies()
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempting to fetch {url} (attempt {attempt + 1})")
                proxy = None
                if proxies:
                    proxy = random.choice(proxies)
                async with self.session.get(url, proxy=proxy) as response:
                    if response.status == 200:
                        content = await response.text()
                        
                        # Check if we got a Cloudflare challenge page
                        if "Just a moment" in content or "cf-mitigated" in response.headers:
                            logger.warning(f"Cloudflare challenge detected on attempt {attempt + 1}")
                            if attempt < max_retries - 1:
                                # Wait longer for Cloudflare to process
                                wait_time = (attempt + 1) * 10
                                logger.info(f"Waiting {wait_time} seconds before retry...")
                                await asyncio.sleep(wait_time)
                                continue
                            else:
                                logger.error("Max retries reached for Cloudflare challenge")
                                return None
                        
                        return content
                    
                    elif response.status == 403:
                        logger.warning(f"403 Forbidden on attempt {attempt + 1}")
                        if attempt < max_retries - 1:
                            wait_time = (attempt + 1) * 5
                            await asyncio.sleep(wait_time)
                            continue
                    
                    else:
                        logger.error(f"HTTP {response.status} for {url}")
                        return None
                        
            except Exception as e:
                logger.error(f"Error fetching {url} on attempt {attempt + 1}: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2)
                    continue
        
        return None
    
    async def scrape_paknsave_department(self, department: str, max_pages: int = 5) -> List[ScrapedPrice]:
        """Scrape Pak'nSave department with Cloudflare handling"""
        scraped_prices = []
        
        try:
            await self.create_session()
            
            for page in range(1, max_pages + 1):
                url = f"https://www.paknsaveonline.co.nz/category/{department}?pg={page}"
                
                logger.info(f"Scraping Pak'nSave {department} page {page}")
                
                html_content = await self.get_with_retry(url)
                if not html_content:
                    logger.error(f"Failed to fetch page {page} for {department}")
                    break
                
                soup = BeautifulSoup(html_content, 'html.parser')
                
                # Check for product containers
                containers = soup.find_all("div", {'class': 'fs-product-card'})
                logger.info(f"Found {len(containers)} products on page {page}")
                
                if not containers:
                    logger.info(f"No products found on page {page}, stopping")
                    break
                
                for container in containers:
                    try:
                        price = self._extract_paknsave_product(container, url)
                        if price:
                            scraped_prices.append(price)
                    except Exception as e:
                        logger.error(f"Error extracting product: {e}")
                        continue
                
                # Random delay between pages
                await asyncio.sleep(random.uniform(2, 4))
            
        except Exception as e:
            logger.error(f"Error scraping Pak'nSave {department}: {e}")
        finally:
            await self.close_session()
        
        return scraped_prices
    
    def _extract_paknsave_product(self, container, page_url: str) -> Optional[ScrapedPrice]:
        """Extract product data from Pak'nSave container"""
        try:
            # Find footer with product data
            footer = container.find("div", {"class": "js-product-card-footer fs-product-card__footer-container"})
            if not footer:
                return None
            
            data_options = footer.get("data-options")
            if not data_options:
                return None
            
            data = json.loads(data_options)
            
            product_name = data.get("productName", "")
            if not product_name:
                return None
            
            # Extract price
            product_details = data.get('ProductDetails', {})
            price_value = product_details.get('PricePerItem')
            
            if not price_value:
                return None
            
            # Convert price to Decimal
            if isinstance(price_value, (int, float)):
                price = Decimal(str(price_value))
            elif isinstance(price_value, str):
                import re
                price_match = re.search(r'[\$£€]?\s*(\d+\.?\d*)', price_value)
                if price_match:
                    price = Decimal(price_match.group(1))
                else:
                    return None
            else:
                return None
            
            # Extract volume/size
            volume_size_elem = container.find("p", {"class": "u-color-half-dark-grey u-p3"})
            volume_size = volume_size_elem.text if volume_size_elem else None
            
            # Extract image URL
            img_elem = container.find("div", {"class": "fs-product-card__product-image"})
            image_url = img_elem.get('data-src-s') if img_elem else None
            
            return ScrapedPrice(
                store_id="paknsave_001",
                item_name=product_name,
                price=price,
                date=datetime.now(),
                url=page_url,
                confidence=0.9,
                volume_size=volume_size,
                image_url=image_url
            )
            
        except Exception as e:
            logger.error(f"Error extracting Pak'nSave product: {e}")
            return None

async def test_cloudflare_scraper():
    """Test the Cloudflare-aware scraper"""
    print("Testing Cloudflare-aware Pak'nSave scraper...")
    
    scraper = CloudflareScraper()
    
    try:
        # Test with just one department and limited pages
        prices = await scraper.scrape_paknsave_department('pantry', max_pages=2)
        
        print(f"Successfully scraped {len(prices)} prices from Pak'nSave")
        
        if prices:
            print("\nSample results:")
            for i, price in enumerate(prices[:5]):
                print(f"  {i+1}. {price.item_name}: ${price.price} ({price.volume_size or 'N/A'})")
        
        return len(prices)
        
    except Exception as e:
        print(f"Error testing Cloudflare scraper: {e}")
        return 0

if __name__ == "__main__":
    asyncio.run(test_cloudflare_scraper()) 