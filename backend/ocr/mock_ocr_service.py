#!/usr/bin/env python3

"""
Mock OCR Service for ReceiptRadar
This provides a simple API that mimics the OCR service for development
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import time
import random
from datetime import datetime, timedelta

app = FastAPI(
    title="ReceiptRadar Mock OCR Service",
    description="Mock OCR microservice for parsing grocery receipts",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OCRResult(BaseModel):
    text: str
    bbox: List[List[float]]
    confidence: float

class ReceiptItemResponse(BaseModel):
    name: str
    price: float
    quantity: int
    category: Optional[str]
    confidence: float

class ReceiptResponse(BaseModel):
    store_name: Optional[str]
    date: Optional[str]
    total: Optional[float]
    items: List[ReceiptItemResponse]
    subtotal: Optional[float]
    tax: Optional[float]
    receipt_number: Optional[str]
    validation: Dict[str, Any]
    processing_time: float
    ai_enhanced: bool = False
    confidence: float = 0.0
    savings_analysis: Optional[Dict[str, Any]] = None

class OCRResponse(BaseModel):
    results: List[OCRResult]
    processing_time: float
    image_size: dict

# Mock data for different store types
MOCK_STORES = {
    "countdown": {
        "name": "Countdown",
        "items": [
            {"name": "Bananas", "price": 3.99, "category": "Fresh Produce"},
            {"name": "Milk 2L", "price": 4.50, "category": "Dairy"},
            {"name": "Bread", "price": 2.99, "category": "Pantry"},
            {"name": "Eggs 12pk", "price": 6.99, "category": "Dairy"},
            {"name": "Chicken Breast", "price": 12.99, "category": "Meat"},
            {"name": "Rice 1kg", "price": 3.50, "category": "Pantry"},
            {"name": "Apples 1kg", "price": 4.99, "category": "Fresh Produce"},
            {"name": "Cheese 500g", "price": 8.99, "category": "Dairy"},
        ]
    },
    "new_world": {
        "name": "New World",
        "items": [
            {"name": "Tomatoes 500g", "price": 4.99, "category": "Fresh Produce"},
            {"name": "Yogurt 500g", "price": 3.99, "category": "Dairy"},
            {"name": "Pasta 500g", "price": 2.50, "category": "Pantry"},
            {"name": "Beef Mince 500g", "price": 9.99, "category": "Meat"},
            {"name": "Onions 1kg", "price": 2.99, "category": "Fresh Produce"},
            {"name": "Butter 250g", "price": 4.50, "category": "Dairy"},
            {"name": "Cereal 500g", "price": 5.99, "category": "Pantry"},
            {"name": "Potatoes 2kg", "price": 6.99, "category": "Fresh Produce"},
        ]
    },
    "paknsave": {
        "name": "Pak'nSave",
        "items": [
            {"name": "Oranges 1kg", "price": 3.99, "category": "Fresh Produce"},
            {"name": "Cream 300ml", "price": 3.50, "category": "Dairy"},
            {"name": "Flour 1kg", "price": 2.99, "category": "Pantry"},
            {"name": "Pork Chops 500g", "price": 8.99, "category": "Meat"},
            {"name": "Carrots 1kg", "price": 2.50, "category": "Fresh Produce"},
            {"name": "Cheddar 250g", "price": 5.99, "category": "Dairy"},
            {"name": "Sugar 1kg", "price": 2.99, "category": "Pantry"},
            {"name": "Broccoli", "price": 3.99, "category": "Fresh Produce"},
        ]
    }
}

def generate_mock_receipt(store_type: str = "countdown") -> Dict[str, Any]:
    """Generate a mock receipt for testing"""
    store = MOCK_STORES.get(store_type, MOCK_STORES["countdown"])
    
    # Select random items (3-8 items)
    num_items = random.randint(3, 8)
    selected_items = random.sample(store["items"], min(num_items, len(store["items"])))
    
    # Add random quantities
    items_with_quantities = []
    for item in selected_items:
        quantity = random.randint(1, 3)
        items_with_quantities.append({
            **item,
            "quantity": quantity,
            "confidence": round(random.uniform(0.7, 0.95), 2)
        })
    
    # Calculate totals
    subtotal = sum(item["price"] * item["quantity"] for item in items_with_quantities)
    tax = round(subtotal * 0.15, 2)  # 15% GST
    total = subtotal + tax
    
    # Generate date (within last 30 days)
    receipt_date = datetime.now() - timedelta(days=random.randint(0, 30))
    
    return {
        "store_name": store["name"],
        "date": receipt_date.strftime("%Y-%m-%d"),
        "total": round(total, 2),
        "subtotal": round(subtotal, 2),
        "tax": tax,
        "receipt_number": f"R{random.randint(100000, 999999)}",
        "items": items_with_quantities,
        "validation": {
            "total_matches": True,
            "items_parsed": len(items_with_quantities),
            "confidence_score": round(random.uniform(0.8, 0.95), 2),
            "warnings": []
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "mock-ocr",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/ocr", response_model=OCRResponse)
async def process_receipt_ocr(file: UploadFile = File(...)):
    """Mock OCR processing endpoint"""
    start_time = time.time()
    
    # Simulate processing time
    time.sleep(random.uniform(1, 3))
    
    # Generate mock OCR results
    mock_texts = [
        "COUNTDOWN", "GROCERY", "RECEIPT", "TOTAL", "GST", "THANK YOU",
        "BANANAS", "MILK", "BREAD", "EGGS", "CHICKEN", "RICE", "APPLES", "CHEESE"
    ]
    
    results = []
    for i, text in enumerate(mock_texts):
        results.append(OCRResult(
            text=text,
            bbox=[[i * 50, i * 30], [i * 50 + 100, i * 30], [i * 50 + 100, i * 30 + 20], [i * 50, i * 30 + 20]],
            confidence=round(random.uniform(0.7, 0.95), 2)
        ))
    
    processing_time = time.time() - start_time
    
    return OCRResponse(
        results=results,
        processing_time=round(processing_time, 2),
        image_size={"width": 800, "height": 600}
    )

@app.post("/parse", response_model=ReceiptResponse)
async def parse_receipt(file: UploadFile = File(...)):
    """Mock receipt parsing endpoint"""
    start_time = time.time()
    
    # Simulate processing time
    time.sleep(random.uniform(2, 4))
    
    # Generate mock receipt data
    store_types = list(MOCK_STORES.keys())
    store_type = random.choice(store_types)
    receipt_data = generate_mock_receipt(store_type)
    
    # Convert to response format
    items = [
        ReceiptItemResponse(
            name=item["name"],
            price=item["price"],
            quantity=item["quantity"],
            category=item["category"],
            confidence=item["confidence"]
        )
        for item in receipt_data["items"]
    ]
    
    processing_time = time.time() - start_time
    
    return ReceiptResponse(
        store_name=receipt_data["store_name"],
        date=receipt_data["date"],
        total=receipt_data["total"],
        items=items,
        subtotal=receipt_data["subtotal"],
        tax=receipt_data["tax"],
        receipt_number=receipt_data["receipt_number"],
        validation=receipt_data["validation"],
        processing_time=round(processing_time, 2),
        savings_analysis={
            "total_savings": round(random.uniform(2, 8), 2),
            "savings_percentage": round(random.uniform(5, 15), 1),
            "suggestions": [
                "Consider buying store brand for 20% savings",
                "Bulk purchase could save $3.50",
                "Check for coupons next time"
            ]
        }
    )

@app.post("/parse-hybrid", response_model=ReceiptResponse)
async def parse_receipt_hybrid(file: UploadFile = File(...)):
    """Mock hybrid receipt parsing endpoint (AI + OCR fallback)"""
    start_time = time.time()
    
    # Simulate processing time
    time.sleep(random.uniform(2, 4))
    
    # Generate mock receipt data
    store_types = list(MOCK_STORES.keys())
    store_type = random.choice(store_types)
    receipt_data = generate_mock_receipt(store_type)
    
    # Convert to response format
    items = [
        ReceiptItemResponse(
            name=item["name"],
            price=item["price"],
            quantity=item["quantity"],
            category=item["category"],
            confidence=item["confidence"]
        )
        for item in receipt_data["items"]
    ]
    
    processing_time = time.time() - start_time
    
    return ReceiptResponse(
        store_name=receipt_data["store_name"],
        date=receipt_data["date"],
        total=receipt_data["total"],
        items=items,
        subtotal=receipt_data["subtotal"],
        tax=receipt_data["tax"],
        receipt_number=receipt_data["receipt_number"],
        validation=receipt_data["validation"],
        processing_time=round(processing_time, 2),
        ai_enhanced=True,
        savings_analysis={
            "total_savings": round(random.uniform(2, 8), 2),
            "savings_percentage": round(random.uniform(5, 15), 1),
            "suggestions": [
                "Consider buying store brand for 20% savings",
                "Bulk purchase could save $3.50",
                "Check for coupons next time"
            ]
        }
    )

@app.post("/parse-ai", response_model=ReceiptResponse)
async def parse_receipt_ai(file: UploadFile = File(...)):
    """Mock AI receipt parsing endpoint"""
    start_time = time.time()
    
    # Simulate processing time
    time.sleep(random.uniform(2, 4))
    
    # Generate mock receipt data
    store_types = list(MOCK_STORES.keys())
    store_type = random.choice(store_types)
    receipt_data = generate_mock_receipt(store_type)
    
    # Convert to response format
    items = [
        ReceiptItemResponse(
            name=item["name"],
            price=item["price"],
            quantity=item["quantity"],
            category=item["category"],
            confidence=item["confidence"]
        )
        for item in receipt_data["items"]
    ]
    
    processing_time = time.time() - start_time
    
    return ReceiptResponse(
        store_name=receipt_data["store_name"],
        date=receipt_data["date"],
        total=receipt_data["total"],
        items=items,
        subtotal=receipt_data["subtotal"],
        tax=receipt_data["tax"],
        receipt_number=receipt_data["receipt_number"],
        validation=receipt_data["validation"],
        processing_time=round(processing_time, 2),
        ai_enhanced=True,
        confidence=0.95,
        savings_analysis={
            "total_savings": round(random.uniform(2, 8), 2),
            "savings_percentage": round(random.uniform(5, 15), 1),
            "suggestions": [
                "Consider buying store brand for 20% savings",
                "Bulk purchase could save $3.50",
                "Check for coupons next time"
            ]
        }
    )

@app.get("/ai-health")
async def ai_health_check():
    """Mock AI health check endpoint"""
    return {
        "ai_available": True,
        "status": "healthy",
        "model": "gpt-4-vision-preview"
    }

@app.get("/categories")
async def get_categories():
    """Get available categories"""
    return [
        {"id": "fresh-produce", "name": "Fresh Produce", "color": "#4CAF50"},
        {"id": "dairy", "name": "Dairy", "color": "#2196F3"},
        {"id": "meat", "name": "Meat", "color": "#F44336"},
        {"id": "pantry", "name": "Pantry", "color": "#FF9800"},
        {"id": "beverages", "name": "Beverages", "color": "#9C27B0"},
        {"id": "snacks", "name": "Snacks", "color": "#795548"},
        {"id": "frozen", "name": "Frozen", "color": "#00BCD4"},
        {"id": "household", "name": "Household", "color": "#607D8B"}
    ]

@app.get("/stores")
async def get_stores():
    """Get available stores"""
    return [
        {"id": "countdown", "name": "Countdown", "location": "Auckland"},
        {"id": "new_world", "name": "New World", "location": "Auckland"},
        {"id": "paknsave", "name": "Pak'nSave", "location": "Auckland"},
        {"id": "four_square", "name": "Four Square", "location": "Auckland"},
        {"id": "fresh_choice", "name": "Fresh Choice", "location": "Auckland"}
    ]

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Mock OCR Service on http://0.0.0.0:8000")
    print("📱 React Native apps can connect to: http://192.168.1.10:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000) 