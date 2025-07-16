#!/usr/bin/env python3
"""
Debug script to understand PaddleOCR result structure
"""

import numpy as np
from PIL import Image, ImageDraw
from paddleocr import PaddleOCR

def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (300, 200), color='white')
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), "TEST TEXT", fill='black')
    draw.text((50, 100), "HELLO WORLD", fill='black')
    return img

def debug_ocr():
    """Debug PaddleOCR results"""
    print("🔍 Debugging PaddleOCR result structure...")
    
    # Initialize OCR
    ocr = PaddleOCR(use_textline_orientation=True, lang='en')
    
    # Create test image
    test_img = create_test_image()
    
    # Convert to numpy array
    img_array = np.array(test_img)
    
    # Perform OCR
    print("Performing OCR...")
    results = ocr.predict(img_array)
    
    print(f"\nResults type: {type(results)}")
    print(f"Results length: {len(results) if results else 0}")
    
    if results:
        print(f"First element type: {type(results[0])}")
        print(f"First element: {results[0]}")
        
        # Check if it has attributes
        if hasattr(results[0], '__dict__'):
            print(f"Attributes: {dir(results[0])}")
        
        # Try to access the data
        try:
            print(f"\nTrying to access data...")
            print(f"Results[0].data: {results[0].data}")
        except Exception as e:
            print(f"Error accessing .data: {e}")
        
        try:
            print(f"Results[0].text: {results[0].text}")
        except Exception as e:
            print(f"Error accessing .text: {e}")
        
        try:
            print(f"Results[0].bbox: {results[0].bbox}")
        except Exception as e:
            print(f"Error accessing .bbox: {e}")

if __name__ == "__main__":
    debug_ocr() 