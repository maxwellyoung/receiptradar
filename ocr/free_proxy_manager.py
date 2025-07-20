#!/usr/bin/env python3
"""
Production Free Proxy Manager for ReceiptRadar
Automatically manages free proxies with rotation, health checking, and fallback
"""

import asyncio
import aiohttp
import json
import time
import os
import logging
from typing import List, Dict, Optional, Set
from dataclasses import dataclass
from datetime import datetime, timedelta
import random

logger = logging.getLogger(__name__)

@dataclass
class ProxyInfo:
    proxy: str
    last_used: datetime
    success_count: int = 0
    failure_count: int = 0
    last_tested: Optional[datetime] = None
    is_working: bool = True
    response_time: float = 0.0

class FreeProxyManager:
    def __init__(self, max_proxies: int = 50, test_interval: int = 300):
        self.max_proxies = max_proxies
        self.test_interval = test_interval  # 5 minutes
        self.proxies: Dict[str, ProxyInfo] = {}
        self.current_index = 0
        self.last_refresh = None
        self.refresh_interval = timedelta(hours=2)  # Refresh every 2 hours
        
        # Free proxy sources (updated list)
        self.proxy_sources = [
            "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
            "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt",
            "https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt",
            "https://raw.githubusercontent.com/hookzof/socks5_list/master/proxy.txt",
            "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt",
            "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt",
            "https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt",
            "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt",
        ]
        
        # Test URLs for different regions
        self.test_urls = [
            "https://httpbin.org/ip",
            "https://api.ipify.org?format=json",
            "https://ipinfo.io/json",
        ]
    
    async def initialize(self):
        """Initialize the proxy manager"""
        logger.info("Initializing Free Proxy Manager...")
        
        # Load existing proxies
        await self.load_saved_proxies()
        
        # If we don't have enough proxies, fetch new ones
        if len(self.proxies) < 10:
            await self.refresh_proxies()
        else:
            # Test existing proxies
            await self.test_all_proxies()
        
        logger.info(f"Free Proxy Manager initialized with {len(self.get_working_proxies())} working proxies")
    
    async def refresh_proxies(self):
        """Fetch and test new proxies"""
        logger.info("Refreshing proxy list...")
        
        # Fetch new proxies
        new_proxies = await self.fetch_proxies()
        logger.info(f"Fetched {len(new_proxies)} new proxies")
        
        # Test new proxies
        working_proxies = await self.test_proxies(new_proxies)
        logger.info(f"Found {len(working_proxies)} working proxies")
        
        # Add new working proxies
        for proxy in working_proxies:
            if proxy not in self.proxies:
                self.proxies[proxy] = ProxyInfo(
                    proxy=proxy,
                    last_used=datetime.now(),
                    last_tested=datetime.now()
                )
        
        # Remove old non-working proxies
        await self.cleanup_proxies()
        
        # Save to file
        await self.save_proxies()
        
        self.last_refresh = datetime.now()
    
    async def fetch_proxies(self) -> List[str]:
        """Fetch proxies from multiple sources"""
        all_proxies = set()
        
        async with aiohttp.ClientSession() as session:
            for url in self.proxy_sources:
                try:
                    logger.debug(f"Fetching proxies from: {url}")
                    async with session.get(url, timeout=10) as response:
                        if response.status == 200:
                            content = await response.text()
                            proxy_list = [line.strip() for line in content.split('\n') if line.strip()]
                            
                            # Validate proxy format
                            valid_proxies = []
                            for proxy in proxy_list:
                                if self.is_valid_proxy_format(proxy):
                                    valid_proxies.append(proxy)
                            
                            all_proxies.update(valid_proxies)
                            logger.debug(f"  Found {len(valid_proxies)} valid proxies")
                        else:
                            logger.warning(f"  Failed to fetch from {url}: HTTP {response.status}")
                except Exception as e:
                    logger.warning(f"  Error fetching from {url}: {e}")
        
        return list(all_proxies)
    
    def is_valid_proxy_format(self, proxy: str) -> bool:
        """Validate proxy format"""
        if ':' not in proxy:
            return False
        
        host, port = proxy.split(':', 1)
        if not port.isdigit():
            return False
        
        port_num = int(port)
        if not (1 <= port_num <= 65535):
            return False
        
        # Basic host validation
        if len(host) < 3 or len(host) > 255:
            return False
        
        return True
    
    async def test_proxies(self, proxies: List[str], max_concurrent: int = 20) -> List[str]:
        """Test proxies and return working ones"""
        if not proxies:
            return []
        
        # Test a subset if we have too many
        test_proxies = proxies[:min(len(proxies), 100)]
        working_proxies = []
        
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def test_single_proxy(proxy):
            async with semaphore:
                return await self.test_single_proxy_async(proxy)
        
        tasks = [test_single_proxy(proxy) for proxy in test_proxies]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, dict) and result.get('working'):
                working_proxies.append(result['proxy'])
        
        return working_proxies
    
    async def test_single_proxy_async(self, proxy: str) -> Dict:
        """Test a single proxy"""
        start_time = time.time()
        
        try:
            timeout = aiohttp.ClientTimeout(total=10)
            connector = aiohttp.TCPConnector(limit=1, force_close=True)
            
            async with aiohttp.ClientSession(
                timeout=timeout,
                connector=connector
            ) as session:
                # Test with multiple URLs
                for test_url in self.test_urls:
                    try:
                        async with session.get(
                            test_url,
                            proxy=f"http://{proxy}",
                            timeout=timeout
                        ) as response:
                            if response.status == 200:
                                response_time = time.time() - start_time
                                return {
                                    'working': True,
                                    'proxy': proxy,
                                    'response_time': response_time
                                }
                    except:
                        continue
                
                return {'working': False, 'proxy': proxy}
                
        except Exception as e:
            return {'working': False, 'proxy': proxy, 'error': str(e)}
    
    async def test_all_proxies(self):
        """Test all existing proxies"""
        logger.info("Testing all existing proxies...")
        
        working_proxies = await self.test_proxies(list(self.proxies.keys()))
        
        # Update proxy status
        for proxy in self.proxies:
            if proxy in working_proxies:
                self.proxies[proxy].is_working = True
                self.proxies[proxy].last_tested = datetime.now()
            else:
                self.proxies[proxy].is_working = False
                self.proxies[proxy].last_tested = datetime.now()
        
        logger.info(f"Proxy test complete: {len(working_proxies)}/{len(self.proxies)} working")
    
    async def cleanup_proxies(self):
        """Remove old non-working proxies"""
        current_time = datetime.now()
        to_remove = []
        
        for proxy, info in self.proxies.items():
            # Remove proxies that haven't worked in 24 hours
            if not info.is_working and info.last_tested:
                if current_time - info.last_tested > timedelta(hours=24):
                    to_remove.append(proxy)
            
            # Remove proxies with too many failures
            if info.failure_count > 10 and info.success_count < 5:
                to_remove.append(proxy)
        
        for proxy in to_remove:
            del self.proxies[proxy]
        
        if to_remove:
            logger.info(f"Removed {len(to_remove)} non-working proxies")
    
    def get_round_robin_proxy(self) -> Optional[str]:
        """Get next proxy in round-robin fashion"""
        working_proxies = self.get_working_proxies()
        
        if not working_proxies:
            return None
        
        proxy = working_proxies[self.current_index % len(working_proxies)]
        self.current_index += 1
        
        # Update last used time
        if proxy in self.proxies:
            self.proxies[proxy].last_used = datetime.now()
        
        return proxy
    
    def get_random_proxy(self) -> Optional[str]:
        """Get a random working proxy"""
        working_proxies = self.get_working_proxies()
        
        if not working_proxies:
            return None
        
        proxy = random.choice(working_proxies)
        
        # Update last used time
        if proxy in self.proxies:
            self.proxies[proxy].last_used = datetime.now()
        
        return proxy
    
    def get_working_proxies(self) -> List[str]:
        """Get list of working proxies"""
        return [proxy for proxy, info in self.proxies.items() if info.is_working]
    
    def mark_proxy_success(self, proxy: str):
        """Mark proxy as successful"""
        if proxy in self.proxies:
            self.proxies[proxy].success_count += 1
            self.proxies[proxy].is_working = True
    
    def mark_proxy_failure(self, proxy: str):
        """Mark proxy as failed"""
        if proxy in self.proxies:
            self.proxies[proxy].failure_count += 1
            
            # Mark as non-working if too many failures
            if self.proxies[proxy].failure_count > 5:
                self.proxies[proxy].is_working = False
    
    async def load_saved_proxies(self):
        """Load proxies from saved file"""
        try:
            if os.path.exists('working_proxies.txt'):
                with open('working_proxies.txt', 'r') as f:
                    proxies = [line.strip() for line in f if line.strip()]
                
                for proxy in proxies:
                    if proxy not in self.proxies:
                        self.proxies[proxy] = ProxyInfo(
                            proxy=proxy,
                            last_used=datetime.now(),
                            last_tested=datetime.now()
                        )
                
                logger.info(f"Loaded {len(proxies)} saved proxies")
        except Exception as e:
            logger.warning(f"Error loading saved proxies: {e}")
    
    async def save_proxies(self):
        """Save working proxies to file"""
        try:
            working_proxies = self.get_working_proxies()
            
            with open('working_proxies.txt', 'w') as f:
                for proxy in working_proxies:
                    f.write(f"{proxy}\n")
            
            logger.info(f"Saved {len(working_proxies)} working proxies")
        except Exception as e:
            logger.error(f"Error saving proxies: {e}")
    
    def get_stats(self) -> Dict:
        """Get proxy statistics"""
        working_proxies = self.get_working_proxies()
        total_proxies = len(self.proxies)
        
        total_success = sum(info.success_count for info in self.proxies.values())
        total_failure = sum(info.failure_count for info in self.proxies.values())
        
        return {
            'total_proxies': total_proxies,
            'working_proxies': len(working_proxies),
            'success_rate': len(working_proxies) / total_proxies if total_proxies > 0 else 0,
            'total_success': total_success,
            'total_failure': total_failure,
            'last_refresh': self.last_refresh.isoformat() if self.last_refresh else None
        }
    
    async def maintenance_task(self):
        """Background maintenance task"""
        while True:
            try:
                # Check if we need to refresh
                if (self.last_refresh is None or 
                    datetime.now() - self.last_refresh > self.refresh_interval):
                    await self.refresh_proxies()
                
                # Test proxies periodically
                await self.test_all_proxies()
                
                # Cleanup old proxies
                await self.cleanup_proxies()
                
                # Save current state
                await self.save_proxies()
                
                logger.info(f"Maintenance complete. Stats: {self.get_stats()}")
                
                # Wait before next maintenance
                await asyncio.sleep(self.test_interval)
                
            except Exception as e:
                logger.error(f"Error in maintenance task: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error

async def main():
    """Test the free proxy manager"""
    manager = FreeProxyManager()
    await manager.initialize()
    
    print("Free Proxy Manager Test")
    print("=" * 40)
    print(f"Stats: {manager.get_stats()}")
    
    # Test getting proxies
    for i in range(5):
        proxy = manager.get_round_robin_proxy()
        if proxy:
            print(f"Round-robin proxy {i+1}: {proxy}")
        else:
            print(f"No proxy available for round {i+1}")
    
    print("\nRandom proxies:")
    for i in range(3):
        proxy = manager.get_random_proxy()
        if proxy:
            print(f"Random proxy {i+1}: {proxy}")
        else:
            print(f"No proxy available for random {i+1}")

if __name__ == "__main__":
    asyncio.run(main()) 