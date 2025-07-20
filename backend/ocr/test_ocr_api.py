#!/usr/bin/env python3
"""
Test script for the ReceiptRadar OCR API
"""

import requests
import json
from PIL import Image, ImageDraw, ImageFont
import io

def create_mock_receipt():
    """Create a simple mock receipt image for testing"""
    # Create a white image
    img = Image.new('RGB', (400, 600), color='white')
    draw = ImageDraw.Draw(img)
    
    # Add some text to simulate a receipt
    text_lines = [
        "COUNTDOWN",
        "123 Main Street",
        "Auckland, NZ",
        "",
        "Date: 2024-07-16",
        "Time: 14:30",
        "",
        "MILK 2L          $4.50",
        "BREAD            $3.20",
        "EGGS 12pk        $8.90",
        "BANANAS 1kg      $3.50",
        "",
        "Subtotal:       $20.10",
        "GST:            $3.02",
        "Total:          $23.12",
        "",
        "Thank you for shopping!"
    ]
    
    y_position = 50
    for line in text_lines:
        draw.text((50, y_position), line, fill='black')
        y_position += 30
    
    return img

def test_ocr_api():
    """Test the OCR API endpoints"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing ReceiptRadar OCR API")
    print("=" * 40)
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    response = requests.get(f"{base_url}/health")
    if response.status_code == 200:
        health_data = response.json()
        print(f"✅ Health check passed: {health_data}")
    else:
        print(f"❌ Health check failed: {response.status_code}")
        return
    
    # Test categories endpoint
    print("\n2. Testing categories endpoint...")
    response = requests.get(f"{base_url}/categories")
    if response.status_code == 200:
        categories_data = response.json()
        print(f"✅ Categories retrieved: {len(categories_data['categories'])} categories")
    else:
        print(f"❌ Categories failed: {response.status_code}")
    
    # Test stores endpoint
    print("\n3. Testing stores endpoint...")
    response = requests.get(f"{base_url}/stores")
    if response.status_code == 200:
        stores_data = response.json()
        print(f"✅ Stores retrieved: {len(stores_data['stores'])} stores")
    else:
        print(f"❌ Stores failed: {response.status_code}")
    
    # Create mock receipt image
    print("\n4. Creating mock receipt image...")
    mock_receipt = create_mock_receipt()
    
    # Convert image to bytes
    img_bytes = io.BytesIO()
    mock_receipt.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    # Test OCR endpoint
    print("\n5. Testing OCR endpoint...")
    files = {'file': ('receipt.png', img_bytes, 'image/png')}
    response = requests.post(f"{base_url}/ocr", files=files)
    if response.status_code == 200:
        ocr_data = response.json()
        print(f"✅ OCR successful: {len(ocr_data['results'])} text elements found")
        print(f"   Processing time: {ocr_data['processing_time']:.2f}s")
    else:
        print(f"❌ OCR failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    # Test parse endpoint
    print("\n6. Testing parse endpoint...")
    img_bytes.seek(0)  # Reset file pointer
    files = {'file': ('receipt.png', img_bytes, 'image/png')}
    response = requests.post(f"{base_url}/parse", files=files)
    if response.status_code == 200:
        parse_data = response.json()
        print(f"✅ Parse successful: {len(parse_data['items'])} items parsed")
        print(f"   Store: {parse_data['store_name']}")
        print(f"   Total: ${parse_data['total']}")
        print(f"   Processing time: {parse_data['processing_time']:.2f}s")
        
        # Show parsed items
        print("\n   Parsed items:")
        for item in parse_data['items']:
            print(f"     - {item['name']}: ${item['price']} (qty: {item['quantity']})")
    else:
        print(f"❌ Parse failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    print("\n" + "=" * 40)
    print("🎉 OCR API testing completed!")

if __name__ == "__main__":
    test_ocr_api() 