#!/usr/bin/env python3
"""
Proxy Manager for Enhanced Scraper
Handles proxy rotation, health checking, and fallback strategies
"""

import asyncio
import aiohttp
import random
import time
import logging
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import os
import json

logger = logging.getLogger(__name__)

@dataclass
class ProxyInfo:
    proxy: str
    last_used: datetime
    success_count: int = 0
    failure_count: int = 0
    last_check: Optional[datetime] = None
    is_working: bool = True
    response_time: Optional[float] = None

class ProxyManager:
    def __init__(self, proxy_list: List[str] = None, max_concurrent: int = 5):
        self.proxies: List[ProxyInfo] = []
        self.max_concurrent = max_concurrent
        self.current_index = 0
        self.test_url = "https://httpbin.org/ip"
        self.test_timeout = 10
        
        # Load proxies from environment or provided list
        if proxy_list:
            self.add_proxies(proxy_list)
        else:
            self.load_proxies_from_env()
    
    def load_proxies_from_env(self):
        """Load proxies from environment variables"""
        # Try different environment variable names
        proxy_sources = [
            'SCRAPER_PROXIES',
            'PROXY_LIST',
            'HTTP_PROXIES',
            'HTTPS_PROXIES'
        ]
        
        for env_var in proxy_sources:
            proxy_string = os.getenv(env_var)
            if proxy_string:
                proxies = [p.strip() for p in proxy_string.split(',') if p.strip()]
                if proxies:
                    self.add_proxies(proxies)
                    logger.info(f"Loaded {len(proxies)} proxies from {env_var}")
                    return
        
        logger.warning("No proxies found in environment variables")
    
    def add_proxies(self, proxy_list: List[str]):
        """Add proxies to the manager"""
        for proxy in proxy_list:
            if self._is_valid_proxy_format(proxy):
                proxy_info = ProxyInfo(proxy=proxy, last_used=datetime.now())
                self.proxies.append(proxy_info)
        
        logger.info(f"Added {len(proxy_list)} proxies to manager")
    
    def _is_valid_proxy_format(self, proxy: str) -> bool:
        """Validate proxy format"""
        # Basic validation for common proxy formats
        valid_formats = [
            # HTTP proxy: http://user:pass@host:port
            r'^https?://[^:]+:[^@]+@[^:]+:\d+$',
            # HTTP proxy without auth: http://host:port
            r'^https?://[^:]+:\d+$',
            # SOCKS proxy: socks5://host:port
            r'^socks[45]://[^:]+:\d+$',
            # Simple host:port format
            r'^[^:]+:\d+$'
        ]
        
        import re
        for pattern in valid_formats:
            if re.match(pattern, proxy):
                return True
        
        logger.warning(f"Invalid proxy format: {proxy}")
        return False
    
    async def test_proxy(self, proxy_info: ProxyInfo) -> bool:
        """Test if a proxy is working"""
        try:
            start_time = time.time()
            
            timeout = aiohttp.ClientTimeout(total=self.test_timeout)
            connector = aiohttp.TCPConnector(limit=1)
            
            proxy_dict = self._format_proxy_for_aiohttp(proxy_info.proxy)
            
            async with aiohttp.ClientSession(
                timeout=timeout,
                connector=connector
            ) as session:
                async with session.get(self.test_url, proxy=proxy_dict) as response:
                    if response.status == 200:
                        response_time = time.time() - start_time
                        proxy_info.response_time = response_time
                        proxy_info.is_working = True
                        proxy_info.last_check = datetime.now()
                        logger.debug(f"Proxy {proxy_info.proxy} working (response time: {response_time:.2f}s)")
                        return True
                    else:
                        proxy_info.is_working = False
                        proxy_info.last_check = datetime.now()
                        logger.debug(f"Proxy {proxy_info.proxy} failed with status {response.status}")
                        return False
                        
        except Exception as e:
            proxy_info.is_working = False
            proxy_info.last_check = datetime.now()
            logger.debug(f"Proxy {proxy_info.proxy} failed: {e}")
            return False
    
    def _format_proxy_for_aiohttp(self, proxy: str) -> str:
        """Format proxy string for aiohttp"""
        # If it's already a full URL, return as is
        if proxy.startswith(('http://', 'https://', 'socks5://')):
            return proxy
        
        # Otherwise, assume it's host:port and add http://
        return f"http://{proxy}"
    
    async def test_all_proxies(self) -> Dict[str, bool]:
        """Test all proxies and return results"""
        logger.info(f"Testing {len(self.proxies)} proxies...")
        
        # Test proxies concurrently with limit
        semaphore = asyncio.Semaphore(self.max_concurrent)
        
        async def test_with_semaphore(proxy_info):
            async with semaphore:
                return proxy_info.proxy, await self.test_proxy(proxy_info)
        
        tasks = [test_with_semaphore(proxy_info) for proxy_info in self.proxies]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        working_proxies = 0
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Proxy test error: {result}")
            else:
                proxy, is_working = result
                if is_working:
                    working_proxies += 1
        
        logger.info(f"Proxy test complete: {working_proxies}/{len(self.proxies)} working")
        
        return {proxy: is_working for proxy, is_working in results if not isinstance(result, Exception)}
    
    def get_working_proxies(self) -> List[str]:
        """Get list of working proxies"""
        return [p.proxy for p in self.proxies if p.is_working]
    
    def get_best_proxy(self) -> Optional[str]:
        """Get the best available proxy based on performance"""
        working_proxies = [p for p in self.proxies if p.is_working]
        
        if not working_proxies:
            return None
        
        # Sort by success rate and response time
        working_proxies.sort(key=lambda p: (
            p.failure_count / max(p.success_count + p.failure_count, 1),  # Lower failure rate first
            p.response_time or float('inf')  # Lower response time first
        ))
        
        return working_proxies[0].proxy
    
    def get_random_proxy(self) -> Optional[str]:
        """Get a random working proxy"""
        working_proxies = self.get_working_proxies()
        return random.choice(working_proxies) if working_proxies else None
    
    def get_round_robin_proxy(self) -> Optional[str]:
        """Get next proxy in round-robin fashion"""
        working_proxies = [p for p in self.proxies if p.is_working]
        
        if not working_proxies:
            return None
        
        proxy_info = working_proxies[self.current_index % len(working_proxies)]
        self.current_index += 1
        
        # Update usage stats
        proxy_info.last_used = datetime.now()
        proxy_info.success_count += 1
        
        return proxy_info.proxy
    
    def mark_proxy_failed(self, proxy: str):
        """Mark a proxy as failed"""
        for proxy_info in self.proxies:
            if proxy_info.proxy == proxy:
                proxy_info.failure_count += 1
                proxy_info.is_working = False
                logger.debug(f"Marked proxy {proxy} as failed (failures: {proxy_info.failure_count})")
                break
    
    def mark_proxy_success(self, proxy: str):
        """Mark a proxy as successful"""
        for proxy_info in self.proxies:
            if proxy_info.proxy == proxy:
                proxy_info.success_count += 1
                proxy_info.is_working = True
                break
    
    def get_stats(self) -> Dict:
        """Get proxy statistics"""
        total = len(self.proxies)
        working = len(self.get_working_proxies())
        
        return {
            'total_proxies': total,
            'working_proxies': working,
            'success_rate': working / total if total > 0 else 0,
            'proxy_details': [
                {
                    'proxy': p.proxy,
                    'working': p.is_working,
                    'success_count': p.success_count,
                    'failure_count': p.failure_count,
                    'response_time': p.response_time,
                    'last_used': p.last_used.isoformat() if p.last_used else None
                }
                for p in self.proxies
            ]
        }

# Free proxy lists for testing (use paid proxies for production)
FREE_PROXY_SOURCES = [
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
    "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt",
    "https://raw.githubusercontent.com/sunny9577/proxy-scraper/master/proxies.txt"
]

async def load_free_proxies() -> List[str]:
    """Load free proxies from public sources (for testing only)"""
    proxies = []
    
    async with aiohttp.ClientSession() as session:
        for url in FREE_PROXY_SOURCES:
            try:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        content = await response.text()
                        proxy_list = [line.strip() for line in content.split('\n') if line.strip()]
                        proxies.extend(proxy_list)
                        logger.info(f"Loaded {len(proxy_list)} proxies from {url}")
            except Exception as e:
                logger.warning(f"Failed to load proxies from {url}: {e}")
    
    # Remove duplicates and validate
    unique_proxies = list(set(proxies))
    valid_proxies = [p for p in unique_proxies if ProxyManager()._is_valid_proxy_format(p)]
    
    logger.info(f"Loaded {len(valid_proxies)} valid free proxies")
    return valid_proxies

async def test_proxy_manager():
    """Test the proxy manager"""
    print("Testing Proxy Manager")
    print("=" * 40)
    
    # Create proxy manager with some test proxies
    test_proxies = [
        "127.0.0.1:8080",  # Local proxy (will fail)
        "8.8.8.8:8080",    # Google DNS (will fail)
    ]
    
    manager = ProxyManager(test_proxies)
    
    # Test proxy validation
    print(f"Added {len(manager.proxies)} proxies")
    
    # Test all proxies
    results = await manager.test_all_proxies()
    
    print(f"Test results: {results}")
    
    # Get stats
    stats = manager.get_stats()
    print(f"Stats: {stats}")
    
    # Try to get a working proxy
    best_proxy = manager.get_best_proxy()
    print(f"Best proxy: {best_proxy}")
    
    random_proxy = manager.get_random_proxy()
    print(f"Random proxy: {random_proxy}")

if __name__ == "__main__":
    asyncio.run(test_proxy_manager()) 