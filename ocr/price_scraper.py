"""
Price Scraper Service
Web scraping infrastructure for building price history database
"""

import asyncio
import logging
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import random
import time
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import argparse
from playwright.async_api import async_playwright, Browser, Page
import aiohttp
from fake_useragent import UserAgent

logger = logging.getLogger(__name__)

@dataclass
class ScrapedPrice:
    store_id: str
    item_name: str
    price: Decimal
    date: datetime
    url: str
    confidence: float = 1.0

@dataclass
class ScrapingTask:
    store_id: str
    store_name: str
    base_url: str
    items: List[str]
    selectors: Dict[str, str]
    proxy: Optional[str] = None

class PriceScraperService:
    def __init__(self, db_url: str, max_concurrent: int = 5):
        self.db_url = db_url
        self.max_concurrent = max_concurrent
        self.ua = UserAgent()
        self.proxy_list = self._load_proxy_list()
        self.browser_pool = []
        
    def _load_proxy_list(self) -> List[str]:
        """Load proxy list from environment or file"""
        proxies = os.getenv('SCRAPER_PROXIES', '')
        if proxies:
            return [p.strip() for p in proxies.split(',') if p.strip()]
        
        logger.warning("No SCRAPER_PROXIES environment variable found. Scraping without proxies.")
        return []
    
    async def get_browser(self) -> Browser:
        """Get browser from pool or create new one"""
        if self.browser_pool:
            return self.browser_pool.pop()
        
        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        )
        return browser
    
    async def return_browser(self, browser: Browser):
        """Return browser to pool"""
        if len(self.browser_pool) < self.max_concurrent:
            self.browser_pool.append(browser)
        else:
            await browser.close()
    
    async def scrape_store_prices(self, task: ScrapingTask) -> List[ScrapedPrice]:
        """Scrape prices for a specific store"""
        browser = None
        try:
            browser = await self.get_browser()
            
            # Create context with proxy if available
            context_options = {
                'user_agent': self.ua.random,
                'viewport': {'width': 1920, 'height': 1080},
                'extra_http_headers': {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                }
            }
            
            if task.proxy:
                context_options['proxy'] = {'server': task.proxy}
            
            context = await browser.new_context(**context_options)
            page = await context.new_page()
            
            scraped_prices = []
            
            for item in task.items:
                try:
                    price = await self._scrape_item_price(page, task, item)
                    if price:
                        scraped_prices.append(price)
                    
                    # Random delay to avoid detection
                    await asyncio.sleep(random.uniform(1, 3))
                    
                except Exception as e:
                    logger.error(f"Error scraping item {item} from {task.store_name}: {e}")
                    continue
            
            await context.close()
            return scraped_prices
            
        except Exception as e:
            logger.error(f"Error scraping store {task.store_name}: {e}")
            return []
        finally:
            if browser:
                await self.return_browser(browser)
    
    async def _scrape_item_price(self, page: Page, task: ScrapingTask, item_name: str) -> Optional[ScrapedPrice]:
        """Scrape price for a specific item"""
        try:
            # Search for item
            search_url = f"{task.base_url}/search?q={item_name.replace(' ', '+')}"
            await page.goto(search_url, wait_until='networkidle')
            
            # Wait for results to load
            await page.wait_for_selector(task.selectors.get('product_container', '[data-testid="product"]'), timeout=10000)
            
            # Extract price using selector
            price_selector = task.selectors.get('price', '[data-testid="price"]')
            price_element = await page.query_selector(price_selector)
            
            if not price_element:
                return None
            
            price_text = await price_element.text_content()
            price = self._extract_price_from_text(price_text)
            
            if not price or not (0 < price < 500):
                logger.warning(f"Invalid price found for {item_name}: {price_text}")
                return None
            
            return ScrapedPrice(
                store_id=task.store_id,
                item_name=item_name,
                price=price,
                date=datetime.now(),
                url=page.url,
                confidence=0.9
            )
            
        except Exception as e:
            logger.error(f"Error scraping price for {item_name}: {e}")
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
    
    async def store_scraped_prices(self, prices: List[ScrapedPrice]) -> bool:
        """Store scraped prices in database"""
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            for price in prices:
                cursor.execute("""
                    INSERT INTO price_history (store_id, item_name, price, date, source, confidence_score)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (store_id, item_name, date, source) 
                    DO UPDATE SET 
                        price = EXCLUDED.price,
                        confidence_score = EXCLUDED.confidence_score
                """, (
                    price.store_id,
                    price.item_name,
                    price.price,
                    price.date.date(),
                    'scraper',
                    price.confidence
                ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            logger.info(f"Stored {len(prices)} scraped prices")
            return True
            
        except Exception as e:
            logger.error(f"Error storing scraped prices: {e}")
            return False
    
    async def run_scraping_job(self, store_configs: List[Dict]) -> Dict[str, int]:
        """Run scraping job for multiple stores"""
        results = {}
        
        # Create scraping tasks
        tasks = []
        for config in store_configs:
            task = ScrapingTask(
                store_id=config['store_id'],
                store_name=config['store_name'],
                base_url=config['base_url'],
                items=config['items'],
                selectors=config['selectors'],
                proxy=random.choice(self.proxy_list) if self.proxy_list else None
            )
            tasks.append(task)
        
        # Run scraping with concurrency limit
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def scrape_with_semaphore(task):
            async with semaphore:
                return await self.scrape_store_prices(task)
        
        # Execute all tasks
        scraping_tasks = [scrape_with_semaphore(task) for task in tasks]
        all_results = await asyncio.gather(*scraping_tasks, return_exceptions=True)
        
        # Process results
        total_prices = 0
        for i, result in enumerate(all_results):
            if isinstance(result, Exception):
                logger.error(f"Scraping failed for {tasks[i].store_name}: {result}")
                results[tasks[i].store_name] = 0
            else:
                prices = result
                await self.store_scraped_prices(prices)
                results[tasks[i].store_name] = len(prices)
                total_prices += len(prices)
        
        logger.info(f"Scraping job completed. Total prices scraped: {total_prices}")
        return results

def load_store_configs():
    """Load store configurations from JSON file"""
    config_path = os.path.join(os.path.dirname(__file__), 'scraper_config.json')
    with open(config_path, 'r') as f:
        return json.load(f)

async def main():
    """Main function to run scraping job"""
    parser = argparse.ArgumentParser(description="Run the price scraper for specified stores.")
    parser.add_argument("--store", help="Run scraper for a single specified store key (e.g., 'countdown').")
    args = parser.parse_args()

    db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/receiptradar')
    scraper = PriceScraperService(db_url)
    
    store_configs = load_store_configs()

    if args.store:
        if args.store in store_configs:
            run_configs = {args.store: store_configs[args.store]}
            print(f"Running scraper for specified store: {args.store}")
        else:
            print(f"Error: Store key '{args.store}' not found in configuration.")
            return
    else:
        run_configs = store_configs
        print("Running scraper for all configured stores.")
    
    # Run scraping for all configured stores
    results = await scraper.run_scraping_job(list(run_configs.values()))
    
    print("Scraping Results:")
    for store, count in results.items():
        print(f"{store}: {count} prices scraped")

if __name__ == "__main__":
    asyncio.run(main()) 