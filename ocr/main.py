from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import cv2
import numpy as np
from PIL import Image
import io
import base64
import time
import os
from paddleocr import PaddleOCR
import logging
from loguru import logger
from receipt_parser import ReceiptParser, ReceiptData, ReceiptItem
from price_intelligence import PriceIntelligenceService, BasketAnalysis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger.add("ocr_service.log", rotation="10 MB", retention="7 days")

app = FastAPI(
    title="ReceiptRadar OCR Service",
    description="OCR microservice for parsing grocery receipts",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
try:
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
    receipt_parser = ReceiptParser()
    
    # Initialize price intelligence service
    db_url = os.getenv('DATABASE_URL', 'postgresql://localhost/receiptradar')
    price_intelligence = PriceIntelligenceService(db_url)
    
    logger.info("All services initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize services: {e}")
    ocr = None
    receipt_parser = None
    price_intelligence = None

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
    savings_analysis: Optional[Dict[str, Any]] = None

class OCRResponse(BaseModel):
    results: List[OCRResult]
    processing_time: float
    image_size: dict

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Preprocess image for better OCR results"""
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(thresh)
    
    return denoised

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ocr_available": ocr is not None,
        "parser_available": receipt_parser is not None,
        "version": "1.0.0"
    }

@app.post("/ocr", response_model=OCRResponse)
async def process_receipt_ocr(file: UploadFile = File(...)):
    """Process receipt image and extract raw OCR text"""
    start_time = time.time()
    
    if not ocr:
        raise HTTPException(status_code=503, detail="OCR service not available")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Preprocess image
        processed_img = preprocess_image(image_bytes)
        
        # Perform OCR
        results = ocr.predict(processed_img)
        
        # Parse results (new PaddleOCR structure)
        ocr_results = []
        if results and len(results) > 0:
            res = results[0]
            texts = res['rec_texts']
            scores = res['rec_scores']
            boxes = res['rec_boxes']
            for text, score, box in zip(texts, scores, boxes):
                ocr_results.append(OCRResult(
                    text=text,
                    bbox=box.tolist() if hasattr(box, 'tolist') else box,
                    confidence=score
                ))
        
        processing_time = time.time() - start_time
        
        logger.info(f"Processed image in {processing_time:.2f}s, found {len(ocr_results)} text elements")
        
        return OCRResponse(
            results=ocr_results,
            processing_time=processing_time,
            image_size={
                "width": image.width,
                "height": image.height
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/parse", response_model=ReceiptResponse)
async def parse_receipt(file: UploadFile = File(...)):
    """Process receipt image and return structured data"""
    start_time = time.time()
    
    if not ocr or not receipt_parser:
        raise HTTPException(status_code=503, detail="OCR service not available")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Preprocess image
        processed_img = preprocess_image(image_bytes)
        
        # Perform OCR
        results = ocr.predict(processed_img)
        
        # Convert to list of dicts for parser (new PaddleOCR structure)
        ocr_results = []
        if results and len(results) > 0:
            res = results[0]
            texts = res['rec_texts']
            scores = res['rec_scores']
            boxes = res['rec_boxes']
            for text, score, box in zip(texts, scores, boxes):
                ocr_results.append({
                    'text': text,
                    'bbox': box.tolist() if hasattr(box, 'tolist') else box,
                    'confidence': score
                })
        
        # Parse receipt data
        receipt_data = receipt_parser.parse_ocr_results(ocr_results)
        
        # Validate receipt
        validation = receipt_parser.validate_receipt(receipt_data)
        
        processing_time = time.time() - start_time
        
        logger.info(f"Parsed receipt in {processing_time:.2f}s, found {len(receipt_data.items)} items")
        
        # Convert to response format
        items_response = [
            ReceiptItemResponse(
                name=item.name,
                price=item.price,
                quantity=item.quantity,
                category=item.category,
                confidence=item.confidence
            ) for item in receipt_data.items
        ]
        
        return ReceiptResponse(
            store_name=receipt_data.store_name,
            date=receipt_data.date.isoformat() if receipt_data.date else None,
            total=receipt_data.total,
            items=items_response,
            subtotal=receipt_data.subtotal,
            tax=receipt_data.tax,
            receipt_number=receipt_data.receipt_number,
            validation=validation,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error parsing receipt: {e}")
        raise HTTPException(status_code=500, detail=f"Error parsing receipt: {str(e)}")

@app.post("/parse/ocr-results")
async def parse_ocr_results(ocr_results: List[Dict]):
    """Parse OCR results into structured receipt data"""
    if not receipt_parser:
        raise HTTPException(status_code=503, detail="Receipt parser not available")
    
    try:
        # Parse receipt data
        receipt_data = receipt_parser.parse_ocr_results(ocr_results)
        
        # Validate receipt
        validation = receipt_parser.validate_receipt(receipt_data)
        
        # Convert to response format
        items_response = [
            ReceiptItemResponse(
                name=item.name,
                price=item.price,
                quantity=item.quantity,
                category=item.category,
                confidence=item.confidence
            ) for item in receipt_data.items
        ]
        
        return ReceiptResponse(
            store_name=receipt_data.store_name,
            date=receipt_data.date.isoformat() if receipt_data.date else None,
            total=receipt_data.total,
            items=items_response,
            subtotal=receipt_data.subtotal,
            tax=receipt_data.tax,
            receipt_number=receipt_data.receipt_number,
            validation=validation,
            processing_time=0.0
        )
        
    except Exception as e:
        logger.error(f"Error parsing OCR results: {e}")
        raise HTTPException(status_code=500, detail=f"Error parsing OCR results: {str(e)}")

@app.post("/ocr/batch")
async def process_batch(files: List[UploadFile] = File(...)):
    """Process multiple receipt images"""
    results = []
    
    for file in files:
        try:
            result = await parse_receipt(file)
            results.append({
                "filename": file.filename,
                "result": result
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {"results": results}

@app.get("/categories")
async def get_categories():
    """Get available item categories"""
    if not receipt_parser:
        raise HTTPException(status_code=503, detail="Receipt parser not available")
    
    return {
        "categories": list(receipt_parser.category_keywords.keys()),
        "category_keywords": receipt_parser.category_keywords
    }

@app.get("/stores")
async def get_stores():
    """Get supported store patterns"""
    if not receipt_parser:
        raise HTTPException(status_code=503, detail="Receipt parser not available")
    
    return {
        "stores": list(receipt_parser.store_patterns.keys()),
        "store_patterns": receipt_parser.store_patterns
    }

@app.post("/analyze-savings")
async def analyze_savings(items: List[Dict], store_id: str, user_id: str):
    """Analyze basket for savings opportunities"""
    if not price_intelligence:
        raise HTTPException(status_code=503, detail="Price intelligence service not available")
    
    try:
        # Convert items to ReceiptItem objects
        receipt_items = []
        for item in items:
            receipt_items.append(ReceiptItem(
                name=item['name'],
                price=float(item['price']),
                quantity=item.get('quantity', 1),
                category=item.get('category')
            ))
        
        # Analyze savings
        analysis = await price_intelligence.analyze_basket_savings(receipt_items, store_id)
        
        return {
            "total_savings": float(analysis.total_savings),
            "savings_opportunities": [
                {
                    "item_name": opp.item_name,
                    "current_price": float(opp.current_price),
                    "best_price": float(opp.best_price),
                    "savings": float(opp.savings),
                    "store_name": opp.store_name,
                    "confidence": opp.confidence,
                    "price_history_points": opp.price_history_points
                } for opp in analysis.savings_opportunities
            ],
            "store_recommendation": analysis.store_recommendation,
            "cashback_available": float(analysis.cashback_available)
        }
        
    except Exception as e:
        logger.error(f"Error analyzing savings: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing savings: {str(e)}")

@app.get("/price-history/{item_name}")
async def get_price_history(item_name: str, store_id: Optional[str] = None, days: int = 90):
    """Get price history for an item"""
    if not price_intelligence:
        raise HTTPException(status_code=503, detail="Price intelligence service not available")
    
    try:
        history = await price_intelligence.get_price_history(item_name, store_id, days)
        return {"price_history": history}
        
    except Exception as e:
        logger.error(f"Error getting price history: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting price history: {str(e)}")

@app.get("/store-comparison/{item_name}")
async def get_store_comparison(item_name: str):
    """Compare prices across stores for an item"""
    if not price_intelligence:
        raise HTTPException(status_code=503, detail="Price intelligence service not available")
    
    try:
        comparison = await price_intelligence.get_store_price_comparison(item_name)
        return {"store_comparison": comparison}
        
    except Exception as e:
        logger.error(f"Error getting store comparison: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting store comparison: {str(e)}")

@app.post("/store-prices")
async def store_receipt_prices(receipt_data: Dict, store_id: str, user_id: str):
    """Store prices from a receipt into price history"""
    if not price_intelligence:
        raise HTTPException(status_code=503, detail="Price intelligence service not available")
    
    try:
        # Convert receipt data to ReceiptData object
        items = []
        for item in receipt_data.get('items', []):
            items.append(ReceiptItem(
                name=item['name'],
                price=float(item['price']),
                quantity=item.get('quantity', 1),
                category=item.get('category'),
                confidence=item.get('confidence', 0.0)
            ))
        
        receipt = ReceiptData(
            store_name=receipt_data.get('store_name'),
            date=receipt_data.get('date'),
            total=receipt_data.get('total'),
            items=items,
            subtotal=receipt_data.get('subtotal'),
            tax=receipt_data.get('tax'),
            receipt_number=receipt_data.get('receipt_number')
        )
        
        success = await price_intelligence.store_receipt_prices(receipt, store_id, user_id)
        
        if success:
            return {"message": "Prices stored successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to store prices")
            
    except Exception as e:
        logger.error(f"Error storing prices: {e}")
        raise HTTPException(status_code=500, detail=f"Error storing prices: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 