#!/usr/bin/env python3
"""
Simple test script for the OCR service
"""

import requests
import json
from PIL import Image, ImageDraw, ImageFont
import io

def create_test_receipt():
    """Create a simple test receipt image"""
    # Create a white image
    img = Image.new('RGB', (400, 600), color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a default font, fallback to basic if not available
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    # Draw receipt content
    lines = [
        "COUNTDOWN MT ALBERT",
        "15/12/2024",
        "",
        "BREAD WHT 700G                    $3.50",
        "MILK 2L                          $4.20",
        "APPLE RED 1KG                    $5.99",
        "CHICKEN BREAST 500G              $8.50",
        "",
        "SUBTOTAL                         $22.19",
        "GST                              $3.33",
        "TOTAL                            $25.52",
        "",
        "Receipt #12345",
        "Thank you for shopping with us!"
    ]
    
    y_position = 20
    for line in lines:
        draw.text((20, y_position), line, fill='black', font=font)
        y_position += 25
    
    return img

def test_ocr_service():
    """Test the OCR service endpoints"""
    base_url = "http://localhost:8000"
    
    # Create test receipt image
    print("Creating test receipt image...")
    img = create_test_receipt()
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return
    
    # Test OCR endpoint
    print("\n2. Testing OCR endpoint...")
    try:
        files = {'file': ('test_receipt.png', img_bytes, 'image/png')}
        response = requests.post(f"{base_url}/ocr", files=files)
        print(f"OCR endpoint: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Found {len(result['results'])} text elements")
            print(f"Processing time: {result['processing_time']:.2f}s")
            
            # Print first few results
            for i, ocr_result in enumerate(result['results'][:5]):
                print(f"  {i+1}. '{ocr_result['text']}' (confidence: {ocr_result['confidence']:.2f})")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"OCR test failed: {e}")
    
    # Test parse endpoint
    print("\n3. Testing parse endpoint...")
    try:
        img_bytes.seek(0)  # Reset file pointer
        files = {'file': ('test_receipt.png', img_bytes, 'image/png')}
        response = requests.post(f"{base_url}/parse", files=files)
        print(f"Parse endpoint: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Store: {result['store_name']}")
            print(f"Date: {result['date']}")
            print(f"Total: ${result['total']}")
            print(f"Items found: {len(result['items'])}")
            
            for item in result['items']:
                print(f"  - {item['name']}: ${item['price']} (qty: {item['quantity']}, category: {item['category']})")
            
            print(f"Validation: {result['validation']}")
            print(f"Processing time: {result['processing_time']:.2f}s")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Parse test failed: {e}")
    
    # Test categories endpoint
    print("\n4. Testing categories endpoint...")
    try:
        response = requests.get(f"{base_url}/categories")
        print(f"Categories endpoint: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Available categories: {result['categories']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Categories test failed: {e}")
    
    # Test stores endpoint
    print("\n5. Testing stores endpoint...")
    try:
        response = requests.get(f"{base_url}/stores")
        print(f"Stores endpoint: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Supported stores: {result['stores']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Stores test failed: {e}")

if __name__ == "__main__":
    print("ReceiptRadar OCR Service Test")
    print("=" * 40)
    test_ocr_service() 