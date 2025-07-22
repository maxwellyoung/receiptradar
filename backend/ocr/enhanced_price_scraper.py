"""
Enhanced Price Scraper Service
Based on successful techniques from grocer repository
Web scraping infrastructure for building price history database
"""

from dotenv import load_dotenv
load_dotenv()

import asyncio
import logging
import json
import math
import random
import time
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
import os
import argparse
import requests
from bs4 import BeautifulSoup
import aiohttp
from fake_useragent import UserAgent
from proxy_manager import ProxyManager
import asyncpg


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

@dataclass
class ScrapingTask:
    store_id: str
    store_name: str
    base_url: str
    departments: List[str]
    api_endpoints: Dict[str, str]
    headers: Dict[str, str]
    proxy: Optional[str] = None

class EnhancedPriceScraperService:
    def __init__(self, db_url: str, max_concurrent: int = 3):
        self.db_url = db_url
        self.max_concurrent = max_concurrent
        self.ua = UserAgent()
        self.proxy_manager = ProxyManager()
        
    async def initialize_proxies(self):
        """Initialize and test proxies"""
        if self.proxy_manager.proxies:
            logger.info("Testing proxies...")
            await self.proxy_manager.test_all_proxies()
            working_count = len(self.proxy_manager.get_working_proxies())
            logger.info(f"Found {working_count} working proxies")
        else:
            logger.warning("No proxies configured - scraping without proxies")
    
    def get_countdown_config(self) -> ScrapingTask:
        """Get Countdown scraping configuration based on grocer repository"""
        departments = [
            'meat-seafood', 'fruit-veg', 'fridge-deli', 'bakery', 
            'frozen', 'pantry', 'beer-wine', 'drinks', 
            'health-beauty', 'household', 'baby-child', 'pet'
        ]
        
        headers = {
            'authority': 'shop.countdown.co.nz',
            'pragma': 'no-cache',
            'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Mobile Safari/537.36',
            'content-type': 'application/json',
            'accept': 'application/json, text/plain, */*',
            'cache-control': 'no-cache',
            'x-requested-with': 'OnlineShopping.WebApp',
            'request-id': '|d99a667157664139bb2435b190eda682.c30ccf4caa5e4c86',
            'expires': 'Sat, 01 Jan 2000 00:00:00 GMT',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://shop.countdown.co.nz/shop/browse/pantry',
            'accept-language': 'en-US,en;q=0.9',
        }
        
        return ScrapingTask(
            store_id="countdown_001",
            store_name="Countdown",
            base_url="https://shop.countdown.co.nz",
            departments=departments,
            api_endpoints={
                "products": "/api/v1/products"
            },
            headers=headers
        )
    
    def get_paknsave_config(self) -> ScrapingTask:
        """Get Pak'nSave scraping configuration based on grocer repository"""
        departments = [
            'pantry', 'fresh-foods-and-bakery', 'baby-toddler-and-kids', 
            'beer-cider-and-wine', 'chilled-frozen-and-desserts', 
            'drinks', 'personal-care', 'kitchen-dining-and-household'
        ]
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        return ScrapingTask(
            store_id="paknsave_001",
            store_name="Pak'nSave",
            base_url="https://www.paknsaveonline.co.nz",
            departments=departments,
            api_endpoints={},
            headers=headers
        )
    
    async def scrape_countdown_department(self, session: aiohttp.ClientSession, task: ScrapingTask, department: str, proxy: Optional[str] = None) -> List[ScrapedPrice]:
        """Scrape Countdown department using their API"""
        scraped_prices = []
        page = 1
        page_num = 10  # Start with 10, will be updated after first request
        
        while page <= page_num:
            try:
                params = {
                    'dasFilter': f'Department;;{department};false',
                    'target': 'browse',
                    'page': page
                }
                
                url = f"{task.base_url}{task.api_endpoints['products']}"
                
                async with session.get(url, params=params, headers=task.headers, proxy=proxy) as response:
                    if response.status != 200:
                        logger.error(f"Countdown API error: {response.status}")
                        break
                    
                    raw_data = await response.json()
                    
                    # Update total pages on first request
                    if page == 1:
                        total_items = raw_data.get('products', {}).get('totalItems', 0)
                        page_num = math.ceil(total_items / 48) + 1
                        logger.info(f"Countdown {department}: {total_items} items, {page_num} pages")
                    
                    # Extract products
                    products = raw_data.get('products', {}).get('items', [])
                    
                    for product in products:
                        try:
                            price = self._extract_countdown_price(product)
                            if price:
                                scraped_prices.append(ScrapedPrice(
                                    store_id=task.store_id,
                                    item_name=product.get('name', ''),
                                    price=price,
                                    date=datetime.now(),
                                    url=f"{task.base_url}/shop/productdetails?stockcode={product.get('stockcode', '')}",
                                    confidence=0.95,
                                    volume_size=product.get('volumeSize'),
                                    image_url=product.get('imageUrl')
                                ))
                        except Exception as e:
                            logger.error(f"Error processing Countdown product: {e}")
                            continue
                    
                    # Random delay to avoid detection
                    await asyncio.sleep(random.uniform(1, 3))
                    page += 1
                    
            except Exception as e:
                logger.error(f"Error scraping Countdown {department} page {page}: {e}")
                break
        
        return scraped_prices
    
    async def scrape_paknsave_department(self, session: aiohttp.ClientSession, task: ScrapingTask, department: str, proxy: Optional[str] = None) -> List[ScrapedPrice]:
        """Scrape Pak'nSave department using BeautifulSoup"""
        scraped_prices = []
        page = 1
        page_num = 2  # Start with 2, will be updated after first request
        
        while page <= page_num:
            try:
                url = f"{task.base_url}/category/{department}?pg={page}"
                
                async with session.get(url, headers=task.headers, proxy=proxy) as response:
                    if response.status != 200:
                        logger.error(f"Pak'nSave error: {response.status}")
                        break
                    
                    html_content = await response.text()
                    soup = BeautifulSoup(html_content, 'html.parser')
                    
                    # Update total pages on first request
                    if page == 1:
                        page_num_container = soup.find("div", {"class": "fs-product-filter__item u-color-half-dark-grey u-hide-down-l"})
                        if page_num_container:
                            page_num_text = page_num_container.text
                            split = page_num_text.split(" ")
                            if len(split) > 5:
                                products_num = split[5]
                                page_num = math.ceil(int(products_num) / 20)
                                logger.info(f"Pak'nSave {department}: {products_num} items, {page_num} pages")
                    
                    # Extract products
                    containers = soup.find_all("div", {'class': 'fs-product-card'})
                    
                    for container in containers:
                        try:
                            footer = container.find("div", {"class": "js-product-card-footer fs-product-card__footer-container"})
                            if not footer:
                                continue
                            
                            data_options = footer.get("data-options")
                            if not data_options:
                                continue
                            
                            data = json.loads(data_options)
                            
                            product_name = data.get("productName", "")
                            price = self._extract_paknsave_price(data)
                            
                            if price and product_name:
                                volume_size_elem = container.find("p", {"class": "u-color-half-dark-grey u-p3"})
                                volume_size = volume_size_elem.text if volume_size_elem else None
                                
                                img_elem = container.find("div", {"class": "fs-product-card__product-image"})
                                image_url = img_elem.get('data-src-s') if img_elem else None
                                
                                scraped_prices.append(ScrapedPrice(
                                    store_id=task.store_id,
                                    item_name=product_name,
                                    price=price,
                                    date=datetime.now(),
                                    url=url,
                                    confidence=0.9,
                                    volume_size=volume_size,
                                    image_url=image_url
                                ))
                                
                        except Exception as e:
                            logger.error(f"Error processing Pak'nSave product: {e}")
                            continue
                    
                    # Random delay to avoid detection
                    await asyncio.sleep(random.uniform(2, 4))
                    page += 1
                    
            except Exception as e:
                logger.error(f"Error scraping Pak'nSave {department} page {page}: {e}")
                break
        
        return scraped_prices
    
    def _extract_countdown_price(self, product: Dict) -> Optional[Decimal]:
        """Extract price from Countdown product data"""
        try:
            # Countdown returns a complex price object, not a simple number
            price_obj = product.get('price', {})
            
            if isinstance(price_obj, dict):
                # Try sale price first, then original price
                price_value = price_obj.get('salePrice') or price_obj.get('originalPrice')
                if price_value:
                    return Decimal(str(price_value))
            
            # Fallback to direct price field
            price_value = product.get('price')
            if price_value:
                if isinstance(price_value, (int, float)):
                    return Decimal(str(price_value))
                elif isinstance(price_value, str):
                    # Remove currency symbols and extract number
                    import re
                    price_match = re.search(r'[\$£€]?\s*(\d+\.?\d*)', price_value)
                    if price_match:
                        return Decimal(price_match.group(1))
            
            return None
        except Exception as e:
            logger.error(f"Error extracting Countdown price: {e}")
            return None
    
    def _extract_paknsave_price(self, data: Dict) -> Optional[Decimal]:
        """Extract price from Pak'nSave product data"""
        try:
            product_details = data.get('ProductDetails', {})
            price = product_details.get('PricePerItem')
            
            if price:
                if isinstance(price, (int, float)):
                    return Decimal(str(price))
                elif isinstance(price, str):
                    # Remove currency symbols and extract number
                    import re
                    price_match = re.search(r'[\$£€]?\s*(\d+\.?\d*)', price)
                    if price_match:
                        return Decimal(price_match.group(1))
            
            return None
        except Exception as e:
            logger.error(f"Error extracting Pak'nSave price: {e}")
            return None
    
    async def scrape_store_prices(self, task: ScrapingTask) -> List[ScrapedPrice]:
        """Scrape prices for a specific store across all departments"""
        all_prices = []
        
        # Get proxy for this task
        proxy = task.proxy or self.proxy_manager.get_round_robin_proxy()
        
        # Create session with proxy if available
        connector = aiohttp.TCPConnector(limit=10)
        timeout = aiohttp.ClientTimeout(total=30)
        
        session_headers = task.headers.copy()
        if proxy:
            session_headers['User-Agent'] = self.ua.random
        
        async with aiohttp.ClientSession(
            connector=connector, 
            timeout=timeout,
            headers=session_headers
        ) as session:
            
            for department in task.departments:
                try:
                    logger.info(f"Scraping {task.store_name} - {department}")
                    
                    if task.store_name == "Countdown":
                        prices = await self.scrape_countdown_department(session, task, department, proxy)
                    elif task.store_name == "Pak'nSave":
                        prices = await self.scrape_paknsave_department(session, task, department, proxy)
                    else:
                        logger.warning(f"Unknown store: {task.store_name}")
                        continue
                    
                    all_prices.extend(prices)
                    logger.info(f"Scraped {len(prices)} prices from {task.store_name} - {department}")
                    
                    # Delay between departments
                    await asyncio.sleep(random.uniform(3, 6))
                    
                except Exception as e:
                    logger.error(f"Error scraping {task.store_name} - {department}: {e}")
                    continue
        
        return all_prices
    
    async def store_scraped_prices(self, prices: List[ScrapedPrice]) -> bool:
        """Store scraped prices in database using asyncpg."""
        if not prices:
            return True
        try:
            logger.info(f"Connecting to DB with URL: {self.db_url}")
            conn = await asyncpg.connect(self.db_url)
            await conn.executemany(
                """
                INSERT INTO price_history (store_id, item_name, price, date, source, confidence_score, volume_size, image_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                """,
                [(
                    p.store_id,
                    p.item_name,
                    p.price,
                    p.date.date(),
                    'enhanced_scraper',
                    p.confidence,
                    p.volume_size,
                    p.image_url
                ) for p in prices]
            )
            await conn.close()
            logger.info(f"Stored {len(prices)} scraped prices")
            return True
        except Exception as e:
            logger.error(f"Error storing scraped prices: {e}")
            return False
    
    async def run_scraping_job(self, store_names: List[str] = None) -> Dict[str, int]:
        """Run scraping job for specified stores"""
        results = {}
        
        # Get store configurations
        store_configs = []
        if not store_names or "countdown" in store_names:
            store_configs.append(self.get_countdown_config())
        if not store_names or "paknsave" in store_names:
            store_configs.append(self.get_paknsave_config())
        
        # Initialize proxies first
        await self.initialize_proxies()
        
        # Run scraping with concurrency limit
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def scrape_with_semaphore(task):
            async with semaphore:
                return await self.scrape_store_prices(task)
        
        # Execute all tasks
        scraping_tasks = [scrape_with_semaphore(task) for task in store_configs]
        all_results = await asyncio.gather(*scraping_tasks, return_exceptions=True)
        
        # Process results
        total_prices = 0
        for i, result in enumerate(all_results):
            if isinstance(result, Exception):
                logger.error(f"Scraping failed for {store_configs[i].store_name}: {result}")
                results[store_configs[i].store_name] = 0
            else:
                prices = result
                await self.store_scraped_prices(prices)
                results[store_configs[i].store_name] = len(prices)
                total_prices += len(prices)
        
        logger.info(f"Scraping job completed. Total prices scraped: {total_prices}")
        return results

async def main():
    """Main function to run enhanced scraping job"""
    parser = argparse.ArgumentParser(description="Run the enhanced price scraper for NZ supermarkets.")
    parser.add_argument("--store", help="Run scraper for specific stores (countdown, paknsave)")
    parser.add_argument("--concurrent", type=int, default=3, help="Maximum concurrent scraping tasks")
    args = parser.parse_args()

    db_url = "postgresql://postgres:bvu_zdw1VEC%40mkq_vgk@db.cihuylmusthumxpuexrl.supabase.co:5432/postgres"
    print(f">>> main() is using db_url: {db_url}")
    scraper = EnhancedPriceScraperService(db_url, max_concurrent=args.concurrent)
    
    store_names = None
    if args.store:
        store_names = [args.store.lower()]
        print(f"Running enhanced scraper for: {args.store}")
    else:
        print("Running enhanced scraper for all configured stores.")
    
    # Run scraping
    results = await scraper.run_scraping_job(store_names)
    
    print("Enhanced Scraping Results:")
    for store, count in results.items():
        print(f"{store}: {count} prices scraped")

if __name__ == "__main__":
    asyncio.run(main()) 