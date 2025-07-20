#!/usr/bin/env python3
"""
Free Proxy Setup for ReceiptRadar
Automatically fetches and tests free proxies for scraping
"""

import asyncio
import aiohttp
import json
import time
from typing import List, Dict
from proxy_manager import ProxyManager

# Free proxy sources
FREE_PROXY_SOURCES = [
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
    "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt",
    "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt",
    "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt",
]

async def fetch_free_proxies() -> List[str]:
    """Fetch free proxies from public sources"""
    all_proxies = []
    
    print("Fetching free proxies from public sources...")
    
    async with aiohttp.ClientSession() as session:
        for url in FREE_PROXY_SOURCES:
            try:
                print(f"Fetching from: {url}")
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        content = await response.text()
                        proxy_list = [line.strip() for line in content.split('\n') if line.strip()]
                        all_proxies.extend(proxy_list)
                        print(f"  Found {len(proxy_list)} proxies")
                    else:
                        print(f"  Failed: HTTP {response.status}")
            except Exception as e:
                print(f"  Error: {e}")
    
    # Remove duplicates and validate format
    unique_proxies = list(set(all_proxies))
    valid_proxies = []
    
    for proxy in unique_proxies:
        if ':' in proxy and len(proxy.split(':')) == 2:
            host, port = proxy.split(':')
            if port.isdigit() and 1 <= int(port) <= 65535:
                valid_proxies.append(proxy)
    
    print(f"Total valid proxies found: {len(valid_proxies)}")
    return valid_proxies

async def test_free_proxies(proxies: List[str], max_test: int = 50) -> List[str]:
    """Test free proxies and return working ones"""
    print(f"\nTesting {min(len(proxies), max_test)} proxies...")
    
    # Test a subset to avoid taking too long
    test_proxies = proxies[:max_test]
    working_proxies = []
    
    async def test_single_proxy(proxy):
        try:
            timeout = aiohttp.ClientTimeout(total=10)
            connector = aiohttp.TCPConnector(limit=1)
            
            async with aiohttp.ClientSession(
                timeout=timeout,
                connector=connector
            ) as session:
                async with session.get(
                    'https://httpbin.org/ip',
                    proxy=f"http://{proxy}",
                    timeout=timeout
                ) as response:
                    if response.status == 200:
                        return proxy
                    return None
        except:
            return None
    
    # Test proxies concurrently
    semaphore = asyncio.Semaphore(10)  # Limit concurrent tests
    
    async def test_with_semaphore(proxy):
        async with semaphore:
            return await test_single_proxy(proxy)
    
    tasks = [test_with_semaphore(proxy) for proxy in test_proxies]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Collect working proxies
    for result in results:
        if isinstance(result, str) and result:
            working_proxies.append(result)
    
    print(f"Working proxies found: {len(working_proxies)}")
    return working_proxies

async def setup_free_proxies():
    """Complete setup for free proxies"""
    print("Free Proxy Setup for ReceiptRadar")
    print("=" * 40)
    
    # Step 1: Fetch proxies
    proxies = await fetch_free_proxies()
    
    if not proxies:
        print("❌ No proxies found. You may need to:")
        print("  1. Check your internet connection")
        print("  2. Try again later (sources may be down)")
        print("  3. Use paid proxies for production")
        return []
    
    # Step 2: Test proxies
    working_proxies = await test_free_proxies(proxies)
    
    if working_proxies:
        print(f"\n✅ Found {len(working_proxies)} working free proxies!")
        print("\nWorking proxies:")
        for i, proxy in enumerate(working_proxies[:10], 1):  # Show first 10
            print(f"  {i}. {proxy}")
        
        if len(working_proxies) > 10:
            print(f"  ... and {len(working_proxies) - 10} more")
        
        # Save to file
        with open('working_proxies.txt', 'w') as f:
            for proxy in working_proxies:
                f.write(f"{proxy}\n")
        
        print(f"\n💾 Saved {len(working_proxies)} working proxies to 'working_proxies.txt'")
        print("\nTo use these proxies:")
        print("export SCRAPER_PROXIES=\"" + ",".join(working_proxies) + "\"")
        
        return working_proxies
    else:
        print("\n❌ No working free proxies found.")
        print("\nThis is common with free proxies. You can:")
        print("1. Try again later")
        print("2. Use the scraper without proxies (Countdown will work)")
        print("3. Consider paid proxies for production")
        return []

def load_saved_proxies() -> List[str]:
    """Load previously saved working proxies"""
    try:
        with open('working_proxies.txt', 'r') as f:
            return [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        return []

async def main():
    """Main function"""
    print("Free Proxy Setup")
    print("=" * 40)
    
    # Check if we have saved proxies
    saved_proxies = load_saved_proxies()
    if saved_proxies:
        print(f"Found {len(saved_proxies)} saved working proxies")
        use_saved = input("Use saved proxies? (y/n): ").lower().strip()
        
        if use_saved == 'y':
            print("Using saved proxies:")
            for proxy in saved_proxies[:5]:
                print(f"  {proxy}")
            if len(saved_proxies) > 5:
                print(f"  ... and {len(saved_proxies) - 5} more")
            return saved_proxies
    
    # Fetch and test new proxies
    return await setup_free_proxies()

if __name__ == "__main__":
    proxies = asyncio.run(main())
    if proxies:
        print(f"\n🎉 Setup complete! You can now use {len(proxies)} free proxies.")
    else:
        print("\n⚠️  No proxies available. Countdown scraper will still work without proxies.") 