#!/usr/bin/env python3
"""
Production Scraper Startup Script for ReceiptRadar
Uses free proxies for production scraping
"""

import asyncio
import os
import sys
import logging
import argparse
from production_scraper import ProductionScraper

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('production_scraper.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

async def start_production_scraper():
    """Start the production scraper with free proxies"""
    
    # Get database URL from environment
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        logger.error("DATABASE_URL environment variable not set")
        logger.info("Please set DATABASE_URL to your Supabase PostgreSQL connection string")
        logger.info("Example: export DATABASE_URL='postgresql://user:pass@host:port/db'")
        return
    
    # Get max concurrent from environment or use default
    max_concurrent = int(os.getenv('MAX_CONCURRENT_SCRAPERS', '3'))
    
    logger.info("Starting ReceiptRadar Production Scraper with Free Proxies")
    logger.info("=" * 60)
    logger.info(f"Database: {db_url.split('@')[1] if '@' in db_url else 'configured'}")
    logger.info(f"Max concurrent scrapers: {max_concurrent}")
    logger.info("Proxy system: Free proxies with automatic rotation")
    
    try:
        # Initialize production scraper
        scraper = ProductionScraper(db_url, max_concurrent)
        await scraper.initialize()
        
        # Show initial stats
        stats = scraper.get_stats()
        logger.info("Initial scraper stats:")
        logger.info(f"  - Countdown: {stats['countdown']['status']}")
        logger.info(f"  - New World: {stats['new_world']['status']}")
        logger.info(f"  - Pak'nSave: {stats['paknsave']['status']}")
        
        # Show proxy stats
        proxy_stats = scraper.proxy_manager.get_stats()
        logger.info("Free proxy stats:")
        logger.info(f"  - Working proxies: {proxy_stats['working_proxies']}")
        logger.info(f"  - Success rate: {proxy_stats['success_rate']:.1%}")
        
        # Start the scheduler
        logger.info("Starting scheduler...")
        await scraper.start_scheduler()
        
    except KeyboardInterrupt:
        logger.info("Shutting down gracefully...")
    except Exception as e:
        logger.error(f"Error starting production scraper: {e}")
        raise

async def run_single_job():
    """Run a single scraping job for testing"""
    
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        logger.error("DATABASE_URL environment variable not set")
        return
    
    max_concurrent = int(os.getenv('MAX_CONCURRENT_SCRAPERS', '2'))
    
    logger.info("Running single scraping job with free proxies")
    logger.info("=" * 50)
    
    try:
        scraper = ProductionScraper(db_url, max_concurrent)
        await scraper.initialize()
        
        # Run all jobs once
        results = await scraper.run_all_jobs()
        
        logger.info("Single job results:")
        for store, result in results.items():
            if 'error' in result:
                logger.error(f"  {store}: {result['error']}")
            else:
                logger.info(f"  {store}: {result['prices_scraped']} prices scraped")
        
    except Exception as e:
        logger.error(f"Error running single job: {e}")
        raise

async def test_proxies_only():
    """Test just the free proxy system"""
    from free_proxy_manager import FreeProxyManager
    
    logger.info("Testing free proxy system only")
    logger.info("=" * 40)
    
    try:
        proxy_manager = FreeProxyManager()
        await proxy_manager.initialize()
        
        stats = proxy_manager.get_stats()
        logger.info(f"Proxy stats: {stats}")
        
        # Test getting some proxies
        for i in range(5):
            proxy = proxy_manager.get_round_robin_proxy()
            if proxy:
                logger.info(f"  Proxy {i+1}: {proxy}")
            else:
                logger.info(f"  Proxy {i+1}: None available")
        
    except Exception as e:
        logger.error(f"Error testing proxies: {e}")
        raise

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='ReceiptRadar Production Scraper')
    parser.add_argument('--mode', choices=['scheduler', 'single', 'proxies'], 
                       default='scheduler', help='Run mode')
    parser.add_argument('--verbose', '-v', action='store_true', 
                       help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    logger.info(f"Starting in {args.mode} mode")
    
    if args.mode == 'scheduler':
        asyncio.run(start_production_scraper())
    elif args.mode == 'single':
        asyncio.run(run_single_job())
    elif args.mode == 'proxies':
        asyncio.run(test_proxies_only())

if __name__ == "__main__":
    main() 