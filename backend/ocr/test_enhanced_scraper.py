#!/usr/bin/env python3
"""
Test script for enhanced price scraper
Tests the scraper with techniques from grocer repository
"""

import asyncio
import json
import sys
import os
from enhanced_price_scraper import EnhancedPriceScraperService

async def test_countdown_scraping():
    """Test Countdown scraping with grocer repository techniques"""
    print("Testing Countdown scraping...")
    
    # Initialize scraper
    db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/receiptradar')
    scraper = EnhancedPriceScraperService(db_url, max_concurrent=1)
    
    # Get Countdown config
    task = scraper.get_countdown_config()
    
    # Test with just one department to avoid overwhelming
    task.departments = ['pantry']  # Just test pantry department
    
    print(f"Testing {task.store_name} - {task.departments[0]}")
    
    try:
        # Scrape prices
        prices = await scraper.scrape_store_prices(task)
        
        print(f"Successfully scraped {len(prices)} prices from Countdown")
        
        if prices:
            # Show first few results
            print("\nSample results:")
            for i, price in enumerate(prices[:5]):
                print(f"  {i+1}. {price.item_name}: ${price.price} ({price.volume_size or 'N/A'})")
            
            # Store in database
            success = await scraper.store_scraped_prices(prices)
            if success:
                print("Successfully stored prices in database")
            else:
                print("Failed to store prices in database")
        
        return len(prices)
        
    except Exception as e:
        print(f"Error testing Countdown scraping: {e}")
        return 0

async def test_paknsave_scraping():
    """Test Pak'nSave scraping with grocer repository techniques"""
    print("\nTesting Pak'nSave scraping...")
    
    # Initialize scraper
    db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/receiptradar')
    scraper = EnhancedPriceScraperService(db_url, max_concurrent=1)
    
    # Get Pak'nSave config
    task = scraper.get_paknsave_config()
    
    # Test with just one department
    task.departments = ['pantry']  # Just test pantry department
    
    print(f"Testing {task.store_name} - {task.departments[0]}")
    
    try:
        # Scrape prices
        prices = await scraper.scrape_store_prices(task)
        
        print(f"Successfully scraped {len(prices)} prices from Pak'nSave")
        
        if prices:
            # Show first few results
            print("\nSample results:")
            for i, price in enumerate(prices[:5]):
                print(f"  {i+1}. {price.item_name}: ${price.price} ({price.volume_size or 'N/A'})")
            
            # Store in database
            success = await scraper.store_scraped_prices(prices)
            if success:
                print("Successfully stored prices in database")
            else:
                print("Failed to store prices in database")
        
        return len(prices)
        
    except Exception as e:
        print(f"Error testing Pak'nSave scraping: {e}")
        return 0

async def test_config_loading():
    """Test loading configuration from JSON file"""
    print("\nTesting configuration loading...")
    
    try:
        with open('enhanced_scraper_config.json', 'r') as f:
            config = json.load(f)
        
        print("Successfully loaded configuration:")
        for store_name, store_config in config.items():
            print(f"  - {store_name}: {len(store_config.get('departments', []))} departments")
        
        return True
        
    except Exception as e:
        print(f"Error loading configuration: {e}")
        return False

async def main():
    """Main test function"""
    print("Enhanced Price Scraper Test")
    print("=" * 40)
    
    # Test configuration loading
    config_ok = await test_config_loading()
    if not config_ok:
        print("Configuration test failed. Exiting.")
        return
    
    # Test Countdown scraping
    countdown_count = await test_countdown_scraping()
    
    # Test Pak'nSave scraping
    paknsave_count = await test_paknsave_scraping()
    
    # Summary
    print("\n" + "=" * 40)
    print("Test Summary:")
    print(f"Countdown: {countdown_count} prices scraped")
    print(f"Pak'nSave: {paknsave_count} prices scraped")
    print(f"Total: {countdown_count + paknsave_count} prices scraped")
    
    if countdown_count > 0 or paknsave_count > 0:
        print("\n✅ Enhanced scraper is working!")
        print("The techniques from the grocer repository are successfully integrated.")
    else:
        print("\n❌ Enhanced scraper needs debugging.")
        print("Check the error messages above for issues.")

if __name__ == "__main__":
    asyncio.run(main()) 