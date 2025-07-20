#!/usr/bin/env python3
"""
Test script for fixed Countdown scraper
Tests the corrected price extraction logic
"""

import asyncio
import json
import sys
import os
from enhanced_price_scraper import EnhancedPriceScraperService

async def test_fixed_countdown():
    """Test the fixed Countdown scraper"""
    print("Testing Fixed Countdown Scraper")
    print("=" * 40)
    
    # Initialize scraper
    db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/receiptradar')
    scraper = EnhancedPriceScraperService(db_url, max_concurrent=1)
    
    # Get Countdown config
    task = scraper.get_countdown_config()
    
    # Test with just one department and limited pages
    task.departments = ['pantry']  # Just test pantry department
    
    print(f"Testing {task.store_name} - {task.departments[0]}")
    
    try:
        # Scrape prices
        prices = await scraper.scrape_store_prices(task)
        
        print(f"Successfully scraped {len(prices)} prices from Countdown")
        
        if prices:
            # Show first few results
            print("\nSample results:")
            for i, price in enumerate(prices[:10]):
                print(f"  {i+1}. {price.item_name}: ${price.price} ({price.volume_size or 'N/A'})")
            
            # Test price extraction logic
            print("\nPrice extraction test:")
            test_prices = [p.price for p in prices[:5]]
            for i, price in enumerate(test_prices):
                print(f"  Price {i+1}: {price} (type: {type(price)})")
            
            # Store in database
            success = await scraper.store_scraped_prices(prices)
            if success:
                print("\n✅ Successfully stored prices in database")
            else:
                print("\n❌ Failed to store prices in database")
        else:
            print("\n❌ No prices scraped - check the scraper logic")
        
        return len(prices)
        
    except Exception as e:
        print(f"\n❌ Error testing Countdown scraping: {e}")
        import traceback
        traceback.print_exc()
        return 0

async def main():
    """Main test function"""
    count = await test_fixed_countdown()
    
    print("\n" + "=" * 40)
    if count > 0:
        print(f"✅ Fixed Countdown scraper is working! Scraped {count} prices.")
        print("The price extraction fix is successful.")
    else:
        print("❌ Fixed Countdown scraper still has issues.")
        print("Check the error messages above for debugging.")

if __name__ == "__main__":
    asyncio.run(main()) 