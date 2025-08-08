#!/usr/bin/env python3
"""
New World Scraper
Uses similar techniques to Countdown but adapts to New World's API structure
"""

import asyncio
import json
import random
import time
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
import aiohttp
from bs4 import BeautifulSoup
import asyncpg
import os
import argparse
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

class NewWorldScraper:
    def __init__(self):
        self.base_url = "https://shop.newworld.co.nz"
        self.session = None
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ]
        
        # New World departments
        self.departments = [
            'fresh-foods',
            'pantry',
            'frozen',
            'drinks',
            'household',
            'health-beauty',
            'baby',
            'pet'
        ]
    
    async def create_session(self):
        """Create session with New World-specific headers"""
        timeout = aiohttp.ClientTimeout(total=30)
        connector = aiohttp.TCPConnector(limit=10)
        
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
    
    async def scrape_department(self, department: str, max_pages: int = 10) -> List[ScrapedPrice]:
        """Scrape a New World department"""
        scraped_prices = []
        
        try:
            await self.create_session()
            
            for page in range(1, max_pages + 1):
                # New World uses different URL structure
                url = f"{self.base_url}/shop/browse/{department}?page={page}"
                
                logger.info(f"Scraping New World {department} page {page}")
                
                try:
                    async with self.session.get(url) as response:
                        if response.status == 200:
                            html_content = await response.text()
                            prices = self._extract_prices_from_html(html_content, url)
                            scraped_prices.extend(prices)
                            
                            logger.info(f"Found {len(prices)} products on page {page}")
                            
                            # If no products found, we've reached the end
                            if not prices:
                                break
                        else:
                            logger.warning(f"HTTP {response.status} for {url}")
                            break
                            
                except Exception as e:
                    logger.error(f"Error scraping page {page}: {e}")
                    break
                
                # Random delay between pages
                await asyncio.sleep(random.uniform(2, 4))
            
        except Exception as e:
            logger.error(f"Error scraping New World {department}: {e}")
        finally:
            await self.close_session()
        
        return scraped_prices
    
    def _extract_prices_from_html(self, html_content: str, page_url: str) -> List[ScrapedPrice]:
        """Extract product prices from New World HTML"""
        prices = []
        
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # New World product selectors (these may need adjustment based on actual HTML structure)
            product_selectors = [
                '.product-tile',
                '.product-item',
                '[data-testid="product"]',
                '.product-card'
            ]
            
            products = []
            for selector in product_selectors:
                products = soup.select(selector)
                if products:
                    logger.info(f"Found {len(products)} products using selector: {selector}")
                    break
            
            if not products:
                logger.warning("No products found with any selector")
                return prices
            
            for product in products:
                try:
                    price_data = self._extract_product_data(product, page_url)
                    if price_data:
                        prices.append(price_data)
                except Exception as e:
                    logger.error(f"Error extracting product data: {e}")
                    continue
            
        except Exception as e:
            logger.error(f"Error parsing HTML: {e}")
        
        return prices
    
    def _extract_product_data(self, product_element, page_url: str) -> Optional[ScrapedPrice]:
        """Extract product data from a product element"""
        try:
            # Try different price selectors
            price_selectors = [
                '.price',
                '.product-price',
                '[data-testid="price"]',
                '.price-value'
            ]
            
            price_text = None
            for selector in price_selectors:
                price_elem = product_element.select_one(selector)
                if price_elem:
                    price_text = price_elem.get_text(strip=True)
                    break
            
            if not price_text:
                return None
            
            # Extract price value
            price = self._extract_price_from_text(price_text)
            if not price:
                return None
            
            # Try different name selectors
            name_selectors = [
                '.product-name',
                '.product-title',
                '[data-testid="product-name"]',
                'h3',
                'h4'
            ]
            
            product_name = None
            for selector in name_selectors:
                name_elem = product_element.select_one(selector)
                if name_elem:
                    product_name = name_elem.get_text(strip=True)
                    break
            
            if not product_name:
                return None
            
            # Extract image URL
            img_elem = product_element.select_one('img')
            image_url = img_elem.get('src') or img_elem.get('data-src') if img_elem else None
            
            # Extract volume/size (if available)
            volume_size = None
            volume_selectors = ['.size', '.volume', '.weight']
            for selector in volume_selectors:
                vol_elem = product_element.select_one(selector)
                if vol_elem:
                    volume_size = vol_elem.get_text(strip=True)
                    break
            
            return ScrapedPrice(
                store_id="new_world_001",
                item_name=product_name,
                price=price,
                date=datetime.now(),
                url=page_url,
                confidence=0.85,
                volume_size=volume_size,
                image_url=image_url
            )
            
        except Exception as e:
            logger.error(f"Error extracting product data: {e}")
            return None
    
    def _extract_price_from_text(self, text: str) -> Optional[Decimal]:
        """Extract price from text"""
        import re
        
        # Remove currency symbols and extract number
        price_match = re.search(r'[\$£€]?\s*(\d+\.?\d*)', text)
        if price_match:
            try:
                return Decimal(price_match.group(1))
            except:
                return None
        return None
    
    async def scrape_all_departments(self, max_pages_per_dept: int = 5) -> List[ScrapedPrice]:
        """Scrape all New World departments"""
        all_prices = []
        
        for department in self.departments:
            logger.info(f"Scraping New World department: {department}")
            prices = await self.scrape_department(department, max_pages_per_dept)
            all_prices.extend(prices)
            
            # Delay between departments
            await asyncio.sleep(random.uniform(3, 6))
        
        logger.info(f"Total New World prices scraped: {len(all_prices)}")
        return all_prices

    async def store_scraped_prices(self, db_url: str, prices: List[ScrapedPrice]) -> int:
        """Upsert scraped prices into price_history using code→UUID mapping for stores."""
        if not prices:
            return 0

        conn = await asyncpg.connect(db_url)
        try:
            # Resolve external codes like 'new_world_001' → stores.id (UUID)
            unique_codes = list({p.store_id for p in prices})

            def code_to_name(code: str) -> str:
                lc = (code or "").lower()
                if lc.startswith("countdown"):
                    return "Countdown"
                if lc.startswith("paknsave"):
                    return "Pak'nSave"
                if lc.startswith("new_world"):
                    return "New World"
                if lc.startswith("fresh_choice"):
                    return "Fresh Choice"
                if lc.startswith("super_value"):
                    return "Super Value"
                return code

            code_to_uuid: Dict[str, str] = {}
            if unique_codes:
                has_code_col = await conn.fetchval(
                    "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stores' AND column_name='code')"
                )

                if has_code_col:
                    rows = await conn.fetch(
                        "SELECT code, id FROM stores WHERE code = ANY($1::text[])", unique_codes
                    )
                    for r in rows:
                        if r["code"]:
                            code_to_uuid[r["code"]] = r["id"]

                for code in unique_codes:
                    if code in code_to_uuid:
                        continue
                    name = code_to_name(code)
                    row = await conn.fetchrow(
                        "SELECT id FROM stores WHERE lower(name) = lower($1) LIMIT 1", name
                    )
                    if row:
                        if has_code_col:
                            await conn.execute(
                                "UPDATE stores SET code = $1 WHERE id = $2", code, row["id"]
                            )
                        code_to_uuid[code] = row["id"]

                for code in unique_codes:
                    if code in code_to_uuid:
                        continue
                    name = code_to_name(code)
                    if has_code_col:
                        row = await conn.fetchrow(
                            "INSERT INTO stores(name, location, code) VALUES($1, $2, $3) RETURNING id",
                            name,
                            "New Zealand",
                            code,
                        )
                    else:
                        row = await conn.fetchrow(
                            "INSERT INTO stores(name, location) VALUES($1, $2) RETURNING id",
                            name,
                            "New Zealand",
                        )
                    code_to_uuid[code] = row["id"]

            # Upsert price history
            await conn.executemany(
                """
                INSERT INTO price_history (store_id, item_name, price, date, source, confidence_score, volume_size, image_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (store_id, item_name, date, source)
                DO UPDATE SET
                    price = EXCLUDED.price,
                    confidence_score = EXCLUDED.confidence_score,
                    volume_size = EXCLUDED.volume_size,
                    image_url = EXCLUDED.image_url
                """,
                [
                    (
                        code_to_uuid.get(p.store_id, p.store_id),
                        p.item_name,
                        p.price,
                        p.date.date(),
                        "enhanced_scraper",
                        p.confidence,
                        p.volume_size,
                        p.image_url,
                    )
                    for p in prices
                ],
            )
            return len(prices)
        finally:
            await conn.close()

async def test_new_world_scraper():
    """Test the New World scraper"""
    print("Testing New World Scraper")
    print("=" * 40)
    
    scraper = NewWorldScraper()
    
    try:
        # Test with just one department
        prices = await scraper.scrape_department('pantry', max_pages=2)
        
        print(f"Successfully scraped {len(prices)} prices from New World")
        
        if prices:
            print("\nSample results:")
            for i, price in enumerate(prices[:5]):
                print(f"  {i+1}. {price.item_name}: ${price.price} ({price.volume_size or 'N/A'})")
        
        return len(prices)
        
    except Exception as e:
        print(f"Error testing New World scraper: {e}")
        return 0

async def main():
    parser = argparse.ArgumentParser(description="Run the New World scraper and store to DB.")
    parser.add_argument("--concurrent", type=int, default=3)
    parser.add_argument("--max-pages", type=int, default=3)
    args = parser.parse_args()

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not set; running in test mode only (no DB writes)")
        count = await test_new_world_scraper()
        print(f"Scraped {count} items in test mode")
        return

    scraper = NewWorldScraper()
    prices = await scraper.scrape_all_departments(max_pages_per_dept=args.max_pages)
    stored = await scraper.store_scraped_prices(db_url, prices)
    print(f"Stored {stored} New World prices")

if __name__ == "__main__":
    asyncio.run(main())