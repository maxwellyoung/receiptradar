#!/usr/bin/env python3
"""
Production Scraper for ReceiptRadar
Handles all NZ supermarkets with scheduling, proxy management, and database integration
"""

import asyncio
import logging
import json
import os
import sys
import argparse
import schedule
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

# Import our scrapers
from enhanced_price_scraper import EnhancedPriceScraperService
from new_world_scraper import NewWorldScraper
from cloudflare_scraper import CloudflareScraper
from free_proxy_manager import FreeProxyManager

logger = logging.getLogger(__name__)

@dataclass
class ScrapingJob:
    store_name: str
    scraper: any
    enabled: bool = True
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    success_count: int = 0
    failure_count: int = 0

class ProductionScraper:
    def __init__(self, db_url: str, max_concurrent: int = 3):
        self.db_url = db_url
        self.max_concurrent = max_concurrent
        self.proxy_manager = FreeProxyManager()
        
        # Initialize scrapers
        self.jobs = {
            'countdown': ScrapingJob(
                store_name='Countdown',
                scraper=EnhancedPriceScraperService(db_url, max_concurrent)
            ),
            'new_world': ScrapingJob(
                store_name='New World',
                scraper=NewWorldScraper()
            ),
            'paknsave': ScrapingJob(
                store_name='Pak\'nSave',
                scraper=CloudflareScraper()
            )
        }
        
        # Scraping schedule (in hours)
        self.schedule_hours = {
            'countdown': 6,    # Every 6 hours
            'new_world': 8,    # Every 8 hours  
            'paknsave': 12,    # Every 12 hours (due to Cloudflare)
        }
    
    async def initialize(self):
        """Initialize the production scraper"""
        logger.info("Initializing Production Scraper...")
        
        # Test database connection
        await self.test_database_connection()
        
        # Initialize free proxy manager
        await self.proxy_manager.initialize()
        
        # Set up initial schedules
        for store_name, job in self.jobs.items():
            job.next_run = datetime.now() + timedelta(hours=self.schedule_hours[store_name])
        
        logger.info("Production Scraper initialized successfully")
    
    async def test_database_connection(self):
        """Test database connection and create tables if needed"""
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            # Test basic connection
            cursor.execute("SELECT 1")
            logger.info("Database connection successful")
            
            # Check if enhanced tables exist
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'price_history' 
                AND column_name IN ('volume_size', 'image_url')
            """)
            
            existing_columns = [row[0] for row in cursor.fetchall()]
            
            if 'volume_size' not in existing_columns or 'image_url' not in existing_columns:
                logger.info("Running database migration...")
                await self.run_database_migration(cursor)
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    async def run_database_migration(self, cursor):
        """Run database migration to add missing columns"""
        try:
            # Add missing columns
            cursor.execute("ALTER TABLE price_history ADD COLUMN IF NOT EXISTS volume_size TEXT")
            cursor.execute("ALTER TABLE price_history ADD COLUMN IF NOT EXISTS image_url TEXT")
            
            # Create stores table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS stores (
                    id SERIAL PRIMARY KEY,
                    store_id VARCHAR(50) UNIQUE NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    location VARCHAR(200),
                    base_url TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            
            # Insert NZ supermarket stores
            cursor.execute("""
                INSERT INTO stores (store_id, name, location, base_url) VALUES
                    ('countdown_001', 'Countdown', 'New Zealand', 'https://shop.countdown.co.nz'),
                    ('paknsave_001', 'Pak''nSave', 'New Zealand', 'https://www.paknsaveonline.co.nz'),
                    ('new_world_001', 'New World', 'New Zealand', 'https://shop.newworld.co.nz'),
                    ('fresh_choice_001', 'Fresh Choice', 'New Zealand', 'https://nelsoncity.store.freshchoice.co.nz'),
                    ('super_value_001', 'Super Value', 'New Zealand', 'https://stanmore.store.supervalue.co.nz')
                ON CONFLICT (store_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    location = EXCLUDED.location,
                    base_url = EXCLUDED.base_url,
                    updated_at = NOW()
            """)
            
            logger.info("Database migration completed successfully")
            
        except Exception as e:
            logger.error(f"Database migration failed: {e}")
            raise
    
    async def run_scraping_job(self, store_name: str) -> Dict:
        """Run a single scraping job"""
        job = self.jobs[store_name]
        job.last_run = datetime.now()
        
        logger.info(f"Starting scraping job for {store_name}")
        
        try:
            if store_name == 'countdown':
                result = await self._run_countdown_job()
            elif store_name == 'new_world':
                result = await self._run_new_world_job()
            elif store_name == 'paknsave':
                result = await self._run_paknsave_job()
            else:
                raise ValueError(f"Unknown store: {store_name}")
            
            job.success_count += 1
            job.next_run = datetime.now() + timedelta(hours=self.schedule_hours[store_name])
            
            logger.info(f"Scraping job for {store_name} completed: {result}")
            return result
            
        except Exception as e:
            job.failure_count += 1
            logger.error(f"Scraping job for {store_name} failed: {e}")
            return {'error': str(e), 'prices_scraped': 0}
    
    async def _run_countdown_job(self) -> Dict:
        """Run Countdown scraping job"""
        scraper = self.jobs['countdown'].scraper
        
        # Get proxy for this job
        proxy = self.proxy_manager.get_round_robin_proxy()
        
        # Run scraping for Countdown
        results = await scraper.run_scraping_job(['countdown'])
        
        total_prices = sum(results.values())
        return {
            'store': 'countdown',
            'prices_scraped': total_prices,
            'results': results
        }
    
    async def _run_new_world_job(self) -> Dict:
        """Run New World scraping job"""
        scraper = self.jobs['new_world'].scraper
        
        # Scrape all departments
        prices = await scraper.scrape_all_departments(max_pages_per_dept=5)
        
        # Store prices in database
        stored_count = await self.store_prices(prices)
        
        return {
            'store': 'new_world',
            'prices_scraped': len(prices),
            'prices_stored': stored_count
        }
    
    async def _run_paknsave_job(self) -> Dict:
        """Run Pak'nSave scraping job"""
        scraper = self.jobs['paknsave'].scraper
        
        # Scrape pantry department (most reliable)
        prices = await scraper.scrape_paknsave_department('pantry', max_pages=3)
        
        # Store prices in database
        stored_count = await self.store_prices(prices)
        
        return {
            'store': 'paknsave',
            'prices_scraped': len(prices),
            'prices_stored': stored_count
        }
    
    async def store_prices(self, prices: List) -> int:
        """Store scraped prices in database"""
        if not prices:
            return 0
        
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor()
            
            stored_count = 0
            for price in prices:
                cursor.execute("""
                    INSERT INTO price_history (store_id, item_name, price, date, source, confidence_score, volume_size, image_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (store_id, item_name, date, source) 
                    DO UPDATE SET 
                        price = EXCLUDED.price,
                        confidence_score = EXCLUDED.confidence_score,
                        volume_size = EXCLUDED.volume_size,
                        image_url = EXCLUDED.image_url
                """, (
                    price.store_id,
                    price.item_name,
                    price.price,
                    price.date.date(),
                    'production_scraper',
                    price.confidence,
                    price.volume_size,
                    price.image_url
                ))
                stored_count += 1
            
            conn.commit()
            cursor.close()
            conn.close()
            
            logger.info(f"Stored {stored_count} prices in database")
            return stored_count
            
        except Exception as e:
            logger.error(f"Error storing prices: {e}")
            return 0
    
    async def run_all_jobs(self) -> Dict:
        """Run all scraping jobs"""
        logger.info("Running all scraping jobs...")
        
        results = {}
        
        # Run jobs concurrently with limit
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def run_job_with_semaphore(store_name):
            async with semaphore:
                return store_name, await self.run_scraping_job(store_name)
        
        # Execute all jobs
        tasks = [run_job_with_semaphore(store_name) for store_name in self.jobs.keys()]
        all_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        total_prices = 0
        for result in all_results:
            if isinstance(result, Exception):
                logger.error(f"Job failed: {result}")
            else:
                store_name, job_result = result
                results[store_name] = job_result
                if 'prices_scraped' in job_result:
                    total_prices += job_result['prices_scraped']
        
        logger.info(f"All jobs completed. Total prices scraped: {total_prices}")
        return results
    
    async def run_scheduled_jobs(self):
        """Run jobs that are due"""
        now = datetime.now()
        due_jobs = []
        
        for store_name, job in self.jobs.items():
            if job.next_run and now >= job.next_run:
                due_jobs.append(store_name)
        
        if due_jobs:
            logger.info(f"Running due jobs: {due_jobs}")
            for store_name in due_jobs:
                await self.run_scraping_job(store_name)
        else:
            logger.debug("No jobs due")
    
    async def start_scheduler(self, run_interval: int = 60):
        """Start the scheduler loop"""
        logger.info(f"Starting scheduler (checking every {run_interval} seconds)")
        
        while True:
            try:
                await self.run_scheduled_jobs()
                await asyncio.sleep(run_interval)
            except KeyboardInterrupt:
                logger.info("Scheduler stopped by user")
                break
            except Exception as e:
                logger.error(f"Scheduler error: {e}")
                await asyncio.sleep(run_interval)
    
    def get_stats(self) -> Dict:
        """Get scraping statistics"""
        stats = {
            'jobs': {},
            'proxy_stats': self.proxy_manager.get_stats(),
            'total_success': 0,
            'total_failures': 0
        }
        
        for store_name, job in self.jobs.items():
            stats['jobs'][store_name] = {
                'store_name': job.store_name,
                'enabled': job.enabled,
                'last_run': job.last_run.isoformat() if job.last_run else None,
                'next_run': job.next_run.isoformat() if job.next_run else None,
                'success_count': job.success_count,
                'failure_count': job.failure_count,
                'schedule_hours': self.schedule_hours[store_name]
            }
            stats['total_success'] += job.success_count
            stats['total_failures'] += job.failure_count
        
        return stats

async def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Production Scraper for ReceiptRadar")
    parser.add_argument("--db-url", help="Database connection string")
    parser.add_argument("--store", help="Run scraper for specific store")
    parser.add_argument("--all", action="store_true", help="Run all scrapers once")
    parser.add_argument("--scheduler", action="store_true", help="Start scheduler")
    parser.add_argument("--stats", action="store_true", help="Show statistics")
    parser.add_argument("--concurrent", type=int, default=3, help="Maximum concurrent jobs")
    args = parser.parse_args()

    # Get database URL
    db_url = args.db_url or os.getenv('DATABASE_URL')
    if not db_url:
        print("Error: Database URL required. Set DATABASE_URL environment variable or use --db-url")
        sys.exit(1)

    # Initialize scraper
    scraper = ProductionScraper(db_url, max_concurrent=args.concurrent)
    
    try:
        await scraper.initialize()
        
        if args.stats:
            stats = scraper.get_stats()
            print(json.dumps(stats, indent=2))
            return
        
        if args.store:
            # Run specific store
            if args.store in scraper.jobs:
                result = await scraper.run_scraping_job(args.store)
                print(f"Result: {result}")
            else:
                print(f"Unknown store: {args.store}")
                return
        
        elif args.all:
            # Run all stores once
            results = await scraper.run_all_jobs()
            print("Results:")
            for store, result in results.items():
                print(f"  {store}: {result}")
        
        elif args.scheduler:
            # Start scheduler
            print("Starting production scheduler...")
            await scraper.start_scheduler()
        
        else:
            # Default: run all stores once
            print("Running all scrapers once...")
            results = await scraper.run_all_jobs()
            print("Results:")
            for store, result in results.items():
                print(f"  {store}: {result}")
    
    except Exception as e:
        logger.error(f"Production scraper error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 