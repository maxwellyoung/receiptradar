#!/usr/bin/env python3
"""
Debug script for enhanced price scraper
Tests individual components to identify issues
"""

import asyncio
import aiohttp
import json
import sys
import os
from bs4 import BeautifulSoup

async def test_countdown_api():
    """Test Countdown API directly"""
    print("Testing Countdown API...")
    
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
    
    params = {
        'dasFilter': 'Department;;pantry;false',
        'target': 'browse',
        'page': 1
    }
    
    url = "https://shop.countdown.co.nz/api/v1/products"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=headers) as response:
                print(f"Countdown API Status: {response.status}")
                print(f"Countdown API Headers: {dict(response.headers)}")
                
                if response.status == 200:
                    data = await response.json()
                    print(f"Countdown API Response keys: {list(data.keys())}")
                    
                    if 'products' in data:
                        products = data['products']
                        print(f"Products keys: {list(products.keys())}")
                        print(f"Total items: {products.get('totalItems', 'N/A')}")
                        
                        items = products.get('items', [])
                        print(f"Items count: {len(items)}")
                        
                        if items:
                            print("Sample item:")
                            sample_item = items[0]
                            print(f"  Name: {sample_item.get('name', 'N/A')}")
                            print(f"  Price: {sample_item.get('price', 'N/A')}")
                            print(f"  Stockcode: {sample_item.get('stockcode', 'N/A')}")
                    else:
                        print("No 'products' key in response")
                        print(f"Response: {data}")
                else:
                    text = await response.text()
                    print(f"Error response: {text}")
                    
    except Exception as e:
        print(f"Countdown API error: {e}")

async def test_paknsave_page():
    """Test Pak'nSave page directly"""
    print("\nTesting Pak'nSave page...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    url = "https://www.paknsaveonline.co.nz/category/pantry?pg=1"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                print(f"Pak'nSave Status: {response.status}")
                print(f"Pak'nSave Headers: {dict(response.headers)}")
                
                if response.status == 200:
                    html_content = await response.text()
                    soup = BeautifulSoup(html_content, 'html.parser')
                    
                    # Check for product containers
                    containers = soup.find_all("div", {'class': 'fs-product-card'})
                    print(f"Found {len(containers)} product containers")
                    
                    if containers:
                        print("Sample container structure:")
                        sample_container = containers[0]
                        print(f"  Classes: {sample_container.get('class', [])}")
                        
                        # Check for footer
                        footer = sample_container.find("div", {"class": "js-product-card-footer fs-product-card__footer-container"})
                        if footer:
                            print("  Found footer with data-options")
                            data_options = footer.get("data-options")
                            if data_options:
                                try:
                                    data = json.loads(data_options)
                                    print(f"  Product name: {data.get('productName', 'N/A')}")
                                    print(f"  Price: {data.get('ProductDetails', {}).get('PricePerItem', 'N/A')}")
                                except json.JSONDecodeError as e:
                                    print(f"  JSON decode error: {e}")
                        else:
                            print("  No footer found")
                    else:
                        print("No product containers found")
                        # Check what's actually on the page
                        print("Page title:", soup.title.string if soup.title else "No title")
                        print("First 500 chars:", html_content[:500])
                else:
                    text = await response.text()
                    print(f"Error response: {text}")
                    
    except Exception as e:
        print(f"Pak'nSave error: {e}")

async def test_simple_countdown():
    """Test simple Countdown request without complex headers"""
    print("\nTesting simple Countdown request...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    params = {
        'dasFilter': 'Department;;pantry;false',
        'target': 'browse',
        'page': 1
    }
    
    url = "https://shop.countdown.co.nz/api/v1/products"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=headers) as response:
                print(f"Simple Countdown Status: {response.status}")
                
                if response.status == 200:
                    data = await response.json()
                    print("Simple request worked!")
                    if 'products' in data:
                        items = data['products'].get('items', [])
                        print(f"Found {len(items)} items")
                else:
                    text = await response.text()
                    print(f"Simple request failed: {text}")
                    
    except Exception as e:
        print(f"Simple Countdown error: {e}")

async def main():
    """Main debug function"""
    print("Enhanced Scraper Debug")
    print("=" * 40)
    
    # Test simple Countdown first
    await test_simple_countdown()
    
    # Test full Countdown API
    await test_countdown_api()
    
    # Test Pak'nSave
    await test_paknsave_page()

if __name__ == "__main__":
    asyncio.run(main()) 