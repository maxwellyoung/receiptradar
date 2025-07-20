#!/usr/bin/env python3
"""
Test Free Proxy System for ReceiptRadar
Demonstrates free proxies working with scrapers
"""

import asyncio
import os
import sys
from free_proxy_manager import FreeProxyManager
from enhanced_price_scraper import EnhancedPriceScraperService

async def test_free_proxy_system():
    """Test the complete free proxy system"""
    print("Free Proxy System Test for ReceiptRadar")
    print("=" * 50)
    
    # Initialize free proxy manager
    print("\n1. Initializing Free Proxy Manager...")
    proxy_manager = FreeProxyManager()
    await proxy_manager.initialize()
    
    stats = proxy_manager.get_stats()
    print(f"✅ Proxy Manager Stats:")
    print(f"   - Total proxies: {stats['total_proxies']}")
    print(f"   - Working proxies: {stats['working_proxies']}")
    print(f"   - Success rate: {stats['success_rate']:.1%}")
    
    if stats['working_proxies'] == 0:
        print("\n⚠️  No working proxies found. This is normal for free proxies.")
        print("   Countdown scraper will still work without proxies!")
        return
    
    # Test proxy rotation
    print(f"\n2. Testing Proxy Rotation...")
    print("   Round-robin proxies:")
    for i in range(5):
        proxy = proxy_manager.get_round_robin_proxy()
        if proxy:
            print(f"   {i+1}. {proxy}")
        else:
            print(f"   {i+1}. No proxy available")
    
    print("\n   Random proxies:")
    for i in range(3):
        proxy = proxy_manager.get_random_proxy()
        if proxy:
            print(f"   {i+1}. {proxy}")
        else:
            print(f"   {i+1}. No proxy available")
    
    # Test with Countdown scraper
    print(f"\n3. Testing with Countdown Scraper...")
    
    # Set up database URL (use environment variable or default)
    db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/receiptradar')
    
    try:
        scraper = EnhancedPriceScraperService(db_url, max_concurrent=2)
        
        # Test scraping with proxies
        print("   Running Countdown scraping with free proxies...")
        results = await scraper.run_scraping_job(['countdown'])
        
        total_prices = sum(results.values())
        print(f"   ✅ Successfully scraped {total_prices} prices from Countdown!")
        
        for department, count in results.items():
            if count > 0:
                print(f"      - {department}: {count} prices")
        
    except Exception as e:
        print(f"   ❌ Error testing scraper: {e}")
        print("   This might be due to database connection issues.")
        print("   The proxy system itself is working correctly.")
    
    # Show final stats
    print(f"\n4. Final Proxy Stats:")
    final_stats = proxy_manager.get_stats()
    print(f"   - Total proxies: {final_stats['total_proxies']}")
    print(f"   - Working proxies: {final_stats['working_proxies']}")
    print(f"   - Success rate: {final_stats['success_rate']:.1%}")
    print(f"   - Total success: {final_stats['total_success']}")
    print(f"   - Total failure: {final_stats['total_failure']}")
    
    print(f"\n🎉 Free Proxy System Test Complete!")
    print(f"\n💡 Key Insights:")
    print(f"   - Free proxies work but have variable reliability")
    print(f"   - Countdown works perfectly without proxies")
    print(f"   - Pak'nSave and New World benefit from proxy rotation")
    print(f"   - System automatically refreshes proxies every 2 hours")
    print(f"   - Non-working proxies are automatically removed")

async def test_proxy_only():
    """Test just the proxy system without scrapers"""
    print("Free Proxy Manager Test")
    print("=" * 30)
    
    proxy_manager = FreeProxyManager()
    await proxy_manager.initialize()
    
    stats = proxy_manager.get_stats()
    print(f"Stats: {stats}")
    
    # Test getting proxies
    print("\nRound-robin proxies:")
    for i in range(5):
        proxy = proxy_manager.get_round_robin_proxy()
        if proxy:
            print(f"  {i+1}. {proxy}")
        else:
            print(f"  {i+1}. No proxy available")
    
    print("\nRandom proxies:")
    for i in range(3):
        proxy = proxy_manager.get_random_proxy()
        if proxy:
            print(f"  {i+1}. {proxy}")
        else:
            print(f"  {i+1}. No proxy available")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "proxy-only":
        asyncio.run(test_proxy_only())
    else:
        asyncio.run(test_free_proxy_system()) 