from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Body
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
from openai_service import OpenAIReceiptService, ReceiptParseResult
import re
import asyncpg

# Configure logging
logging.basicConfig(level=logging.INFO)
logger.add("ocr_service.log", rotation="10 MB", retention="7 days")

app = FastAPI(
    title="ReceiptRadar OCR Service",
    description="OCR microservice for parsing grocery receipts with AI enhancement",
    version="2.0.0"
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
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/receiptradar")
    price_intelligence = PriceIntelligenceService(DATABASE_URL)
    
    # Initialize OpenAI service
    openai_service = OpenAIReceiptService()
    
    logger.info("All services initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize services: {e}")
    ocr = None
    receipt_parser = None
    price_intelligence = None
    openai_service = None

class OCRResult(BaseModel):
    text: str
    bbox: List[List[float]]
    confidence: float

class OCRResponse(BaseModel):
    results: List[OCRResult]
    processing_time: float
    image_size: Dict[str, int]

class ReceiptItemResponse(BaseModel):
    name: str
    price: float
    quantity: int
    category: Optional[str] = None
    confidence: float

class ReceiptResponse(BaseModel):
    store_name: str
    date: str
    total: float
    items: List[ReceiptItemResponse]
    subtotal: float
    tax: float
    receipt_number: Optional[str] = None
    validation: Dict[str, Any]
    processing_time: float
    ai_enhanced: bool = False

class AIReceiptResponse(BaseModel):
    store_name: str
    date: str
    total: float
    items: List[ReceiptItemResponse]
    subtotal: float
    tax: float
    receipt_number: Optional[str] = None
    confidence: float
    ai_enhanced: bool = True
    processing_time: float

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Enhanced preprocessing for better OCR results"""
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Get image dimensions
    height, width = img.shape[:2]
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply perspective correction if needed
    corrected = apply_perspective_correction(gray)
    
    # Enhance contrast
    enhanced = enhance_contrast(corrected)
    
    # Apply adaptive thresholding with better parameters
    thresh = cv2.adaptiveThreshold(
        enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, 5
    )
    
    # Denoise with better parameters
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
    
    # Apply morphological operations to clean up text
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    cleaned = cv2.morphologyEx(denoised, cv2.MORPH_CLOSE, kernel)
    
    return cleaned

def apply_perspective_correction(image: np.ndarray) -> np.ndarray:
    """Apply perspective correction to straighten receipt"""
    try:
        # Find edges
        edges = cv2.Canny(image, 50, 150, apertureSize=3)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Find the largest contour (likely the receipt)
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Approximate the contour to a polygon
            epsilon = 0.02 * cv2.arcLength(largest_contour, True)
            approx = cv2.approxPolyDP(largest_contour, epsilon, True)
            
            # If we have 4 points, it's likely a rectangle
            if len(approx) == 4:
                # Order points: top-left, top-right, bottom-right, bottom-left
                pts = approx.reshape(4, 2)
                rect = np.zeros((4, 2), dtype="float32")
                
                # Top-left point will have the smallest sum
                s = pts.sum(axis=1)
                rect[0] = pts[np.argmin(s)]
                rect[2] = pts[np.argmax(s)]
                
                # Top-right point will have the smallest difference
                diff = np.diff(pts, axis=1)
                rect[1] = pts[np.argmin(diff)]
                rect[3] = pts[np.argmax(diff)]
                
                # Calculate new width and height
                widthA = np.sqrt(((rect[2][0] - rect[3][0]) ** 2) + ((rect[2][1] - rect[3][1]) ** 2))
                widthB = np.sqrt(((rect[1][0] - rect[0][0]) ** 2) + ((rect[1][1] - rect[0][1]) ** 2))
                maxWidth = max(int(widthA), int(widthB))
                
                heightA = np.sqrt(((rect[1][0] - rect[2][0]) ** 2) + ((rect[1][1] - rect[2][1]) ** 2))
                heightB = np.sqrt(((rect[0][0] - rect[3][0]) ** 2) + ((rect[0][1] - rect[3][1]) ** 2))
                maxHeight = max(int(heightA), int(heightB))
                
                # Define destination points
                dst = np.array([
                    [0, 0],
                    [maxWidth - 1, 0],
                    [maxWidth - 1, maxHeight - 1],
                    [0, maxHeight - 1]
                ], dtype="float32")
                
                # Calculate perspective transform matrix
                M = cv2.getPerspectiveTransform(rect, dst)
                
                # Apply perspective transform
                warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
                return warped
    except Exception as e:
        logger.warning(f"Perspective correction failed: {e}")
    
    return image

def enhance_contrast(image: np.ndarray) -> np.ndarray:
    """Enhance image contrast for better OCR"""
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(image)
    
    # Apply slight Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(enhanced, (1, 1), 0)
    
    return blurred

def filter_ocr_results(results: List[Dict], min_confidence: float = 0.6) -> List[Dict]:
    """Filter OCR results by confidence and clean up text"""
    filtered_results = []
    
    for result in results:
        if result['confidence'] >= min_confidence:
            # Clean up text
            cleaned_text = clean_text(result['text'])
            if cleaned_text and len(cleaned_text.strip()) > 1:
                result['text'] = cleaned_text
                filtered_results.append(result)
    
    # Sort by vertical position (top to bottom)
    filtered_results.sort(key=lambda x: x['bbox'][0][1] if x['bbox'] else 0)
    
    return filtered_results

def clean_text(text: str) -> str:
    """Clean and normalize OCR text"""
    if not text:
        return ""
    
    # Remove common OCR artifacts
    text = re.sub(r'[^\w\s\.\-\$\,\/\@\#\&\*\(\)]', '', text)
    
    # Fix common OCR mistakes
    text = re.sub(r'[0O]', '0', text)  # Replace O with 0 in numbers
    text = re.sub(r'[1l]', '1', text)  # Replace l with 1 in numbers
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

def validate_receipt_data(receipt_data: Dict) -> Dict[str, Any]:
    """Validate extracted receipt data"""
    validation = {
        'is_valid': True,
        'confidence_score': 0.0,
        'issues': [],
        'warnings': []
    }
    
    # Check for required fields
    if not receipt_data.get('store_name'):
        validation['issues'].append('Store name not detected')
        validation['is_valid'] = False
    
    if not receipt_data.get('total') or receipt_data['total'] <= 0:
        validation['issues'].append('Total amount not detected or invalid')
        validation['is_valid'] = False
    
    if not receipt_data.get('items') or len(receipt_data['items']) == 0:
        validation['issues'].append('No items detected')
        validation['is_valid'] = False
    
    # Check for reasonable values
    if receipt_data.get('total', 0) > 10000:
        validation['warnings'].append('Total amount seems unusually high')
    
    if len(receipt_data.get('items', [])) > 100:
        validation['warnings'].append('Unusually high number of items')
    
    # Calculate confidence score
    confidence_factors = []
    
    if receipt_data.get('store_name'):
        confidence_factors.append(0.2)
    
    if receipt_data.get('date'):
        confidence_factors.append(0.15)
    
    if receipt_data.get('total') and receipt_data['total'] > 0:
        confidence_factors.append(0.25)
    
    if receipt_data.get('items'):
        item_confidence = min(0.4, len(receipt_data['items']) * 0.02)
        confidence_factors.append(item_confidence)
    
    validation['confidence_score'] = sum(confidence_factors)
    
    return validation

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ocr_available": ocr is not None,
        "parser_available": receipt_parser is not None,
        "version": "2.0.0"
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
        # Enhanced error logging for OCR failures
        try:
            file_info = f"filename={getattr(file, 'filename', 'unknown')}"
            image_info = ''
            if 'image_bytes' in locals():
                try:
                    img = Image.open(io.BytesIO(image_bytes))
                    image_info = f", image_size={img.size}, format={img.format}"
                except Exception:
                    image_info = ''
            logger.error(f"OCR FAILURE: {file_info}{image_info}, error={e}")
        except Exception as log_error:
            logger.error(f"Failed to log OCR failure details: {log_error}")
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
        
        # Filter and clean OCR results
        filtered_results = filter_ocr_results(ocr_results, min_confidence=0.5)
        
        logger.info(f"OCR extracted {len(ocr_results)} text elements, filtered to {len(filtered_results)} high-confidence elements")
        
        # Parse receipt data
        receipt_data = receipt_parser.parse_ocr_results(ocr_results)
        
        # Validate receipt
        validation = validate_receipt_data(receipt_data)
        
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
        # Enhanced error logging for parse failures
        try:
            file_info = f"filename={getattr(file, 'filename', 'unknown')}"
            image_info = ''
            if 'image_bytes' in locals():
                try:
                    img = Image.open(io.BytesIO(image_bytes))
                    image_info = f", image_size={img.size}, format={img.format}"
                except Exception:
                    image_info = ''
            logger.error(f"PARSE FAILURE: {file_info}{image_info}, error={e}")
        except Exception as log_error:
            logger.error(f"Failed to log parse failure details: {log_error}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/parse/ocr-results")
async def parse_ocr_results(ocr_results: List[Dict]):
    """Parse OCR results into structured receipt data"""
    if not receipt_parser:
        raise HTTPException(status_code=503, detail="Receipt parser not available")
    
    try:
        # Parse receipt data
        receipt_data = receipt_parser.parse_ocr_results(ocr_results)
        
        # Validate receipt
        validation = validate_receipt_data(receipt_data)
        
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

@app.post("/parse-ai", response_model=AIReceiptResponse)
async def parse_receipt_with_ai(file: UploadFile = File(...)):
    """Parse receipt using GPT-4V for maximum accuracy"""
    start_time = time.time()
    
    if not openai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Parse with AI
        ai_result = await openai_service.parse_receipt_with_ai(image_bytes)
        
        # Convert to response format
        items = [
            ReceiptItemResponse(
                name=item.get('name', ''),
                price=float(item.get('price', 0)),
                quantity=int(item.get('quantity', 1)),
                category=item.get('category'),
                confidence=1.0
            )
            for item in ai_result.items
        ]
        
        processing_time = time.time() - start_time
        
        logger.info(f"AI parsed receipt in {processing_time:.2f}s, found {len(items)} items")
        
        return AIReceiptResponse(
            store_name=ai_result.store_name,
            date=ai_result.date,
            total=ai_result.total,
            items=items,
            subtotal=ai_result.subtotal,
            tax=ai_result.tax,
            receipt_number=ai_result.receipt_number,
            confidence=ai_result.confidence,
            ai_enhanced=True,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error processing image with AI: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image with AI: {str(e)}")

@app.post("/parse-hybrid", response_model=ReceiptResponse)
async def parse_receipt_hybrid(file: UploadFile = File(...)):
    """Parse receipt using AI first, fallback to OCR if needed"""
    start_time = time.time()
    
    if not openai_service or not ocr or not receipt_parser:
        raise HTTPException(status_code=503, detail="Services not available")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Try AI first
        try:
            ai_result = await openai_service.parse_receipt_with_ai(image_bytes)
            
            # Convert to response format
            items = [
                ReceiptItemResponse(
                    name=item.get('name', ''),
                    price=float(item.get('price', 0)),
                    quantity=int(item.get('quantity', 1)),
                    category=item.get('category'),
                    confidence=1.0
                )
                for item in ai_result.items
            ]
            
            processing_time = time.time() - start_time
            
            logger.info(f"AI parsing successful in {processing_time:.2f}s")
            
            return ReceiptResponse(
                store_name=ai_result.store_name,
                date=ai_result.date,
                total=ai_result.total,
                items=items,
                subtotal=ai_result.subtotal,
                tax=ai_result.tax,
                receipt_number=ai_result.receipt_number,
                validation={
                    "is_valid": True,
                    "confidence_score": ai_result.confidence,
                    "warnings": [],
                    "errors": []
                },
                processing_time=processing_time,
                ai_enhanced=True
            )
            
        except Exception as ai_error:
            logger.warn(f"AI parsing failed, using OCR fallback: {ai_error}")
            
            # Fallback to OCR
            processed_img = preprocess_image(image_bytes)
            results = ocr.predict(processed_img)
            
            # Convert to list of dicts for parser
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
            
            # Filter and clean OCR results
            filtered_results = filter_ocr_results(ocr_results, min_confidence=0.5)
            
            # Parse receipt data
            receipt_data = receipt_parser.parse_ocr_results(ocr_results)
            
            # Validate receipt
            validation = validate_receipt_data(receipt_data)
            
            processing_time = time.time() - start_time
            
            logger.info(f"OCR fallback successful in {processing_time:.2f}s")
            
            return ReceiptResponse(
                store_name=receipt_data.store_name or "Unknown Store",
                date=receipt_data.date.isoformat() if receipt_data.date else "",
                total=float(receipt_data.total or 0),
                items=[
                    ReceiptItemResponse(
                        name=item.name,
                        price=float(item.price),
                        quantity=item.quantity,
                        category=item.category,
                        confidence=item.confidence
                    )
                    for item in receipt_data.items
                ],
                subtotal=float(receipt_data.subtotal or 0),
                tax=float(receipt_data.tax or 0),
                receipt_number=receipt_data.receipt_number,
                validation=validation,
                processing_time=processing_time,
                ai_enhanced=False
            )
        
    except Exception as e:
        logger.error(f"Error in hybrid parsing: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/normalize-products")
async def normalize_products(products: List[str]):
    """Normalize product names for cross-store comparison"""
    if not openai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        normalized = await openai_service.normalize_products(products)
        return {
            "normalized_products": [
                {
                    "original": item.original,
                    "normalized": item.normalized,
                    "brand": item.brand,
                    "size": item.size,
                    "category": item.category,
                    "confidence": item.confidence
                }
                for item in normalized
            ]
        }
    except Exception as e:
        logger.error(f"Error normalizing products: {e}")
        raise HTTPException(status_code=500, detail=f"Error normalizing products: {str(e)}")

@app.post("/shopping-insights")
async def generate_shopping_insights(user_history: List[Dict], current_basket: List[Dict]):
    """Generate personalized shopping insights"""
    if not openai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        insights = await openai_service.generate_shopping_insights(user_history, current_basket)
        return insights
    except Exception as e:
        logger.error(f"Error generating shopping insights: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")

@app.post("/budget-coaching")
async def generate_budget_coaching(user_data: Dict, tone_mode: str = "gentle"):
    """Generate personalized budget coaching"""
    if not openai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        coaching = await openai_service.generate_budget_coaching(user_data, tone_mode)
        return coaching
    except Exception as e:
        logger.error(f"Error generating budget coaching: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating coaching: {str(e)}")

@app.get("/ai-health")
async def ai_health_check():
    """Check AI service health"""
    if not openai_service:
        return {
            "ai_available": False,
            "status": "AI service not initialized"
        }
    
    try:
        is_healthy = await openai_service.health_check()
        return {
            "ai_available": True,
            "status": "healthy" if is_healthy else "unhealthy",
            "model": openai_service.model
        }
    except Exception as e:
        return {
            "ai_available": True,
            "status": "error",
            "error": str(e)
        }

@app.post("/receipts/{receipt_id}/corrections")
async def submit_receipt_corrections(receipt_id: str, corrections: dict = Body(...)):
    """Accept corrected items for a receipt. Store in item_corrections table. If item_id is missing, match by name, price, and quantity."""
    items = corrections.get("items", [])
    user_id = corrections.get("user_id")
    if not user_id or not items:
        return {"success": False, "error": "Missing user_id or items"}
    try:
        pool = await asyncpg.create_pool(DATABASE_URL)
        async with pool.acquire() as conn:
            for item in items:
                item_id = item.get("item_id")
                # If item_id is missing, try to look it up
                if not item_id:
                    found = await conn.fetchrow(
                        """
                        SELECT id FROM items
                        WHERE receipt_id = $1 AND name = $2 AND price = $3 AND quantity = $4
                        LIMIT 1
                        """,
                        receipt_id,
                        item.get("name"),
                        item.get("price"),
                        item.get("quantity"),
                    )
                    if found:
                        item_id = found["id"]
                    else:
                        logger.warning(f"Could not find item for correction: {item}")
                        continue  # Skip this correction
                await conn.execute(
                    """
                    INSERT INTO item_corrections (
                        item_id, receipt_id, user_id, corrected_name, corrected_price, corrected_quantity, corrected_category, confirmed
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    """,
                    item_id,
                    receipt_id,
                    user_id,
                    item.get("name"),
                    item.get("price"),
                    item.get("quantity"),
                    item.get("category"),
                    item.get("confirmed", False),
                )
        await pool.close()
        logger.info(f"Corrections stored for receipt {receipt_id} by user {user_id}")
        return {"success": True}
    except Exception as e:
        logger.error(f"Failed to store corrections: {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 