"""
OpenAI Service for ReceiptRadar
Provides AI-powered receipt parsing and intelligence features
"""

import openai
import base64
import json
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import os
from loguru import logger

@dataclass
class ReceiptParseResult:
    store_name: str
    date: str
    items: List[Dict[str, Any]]
    subtotal: float
    tax: float
    total: float
    receipt_number: Optional[str] = None
    confidence: float = 1.0
    ai_enhanced: bool = True

@dataclass
class ProductNormalization:
    original: str
    normalized: str
    brand: Optional[str] = None
    size: Optional[str] = None
    category: Optional[str] = None
    confidence: float = 1.0

class OpenAIReceiptService:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize OpenAI service with API key"""
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        openai.api_key = self.api_key
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4-vision-preview')
        self.max_tokens = int(os.getenv('OPENAI_MAX_TOKENS', '1000'))
        
        logger.info(f"OpenAI service initialized with model: {self.model}")
    
    async def parse_receipt_with_ai(self, image_bytes: bytes) -> ReceiptParseResult:
        """
        Parse receipt using GPT-4V for maximum accuracy
        
        Args:
            image_bytes: Raw image bytes from receipt
            
        Returns:
            ReceiptParseResult with parsed data
        """
        try:
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            
            prompt = """
            Extract from this grocery receipt and return as JSON:
            {
              "store_name": "string",
              "date": "YYYY-MM-DD",
              "items": [
                {
                  "name": "string",
                  "price": number,
                  "quantity": number,
                  "category": "string"
                }
              ],
              "subtotal": number,
              "tax": number,
              "total": number,
              "receipt_number": "string"
            }
            
            Handle any receipt format, any store, any layout.
            Be very accurate with prices and item names.
            """
            
            response = await openai.chat.completions.create(
                model=self.model,
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }],
                max_tokens=self.max_tokens,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")
            
            # Parse JSON response
            parsed_data = json.loads(content)
            
            # Convert to ReceiptParseResult
            return ReceiptParseResult(
                store_name=parsed_data.get('store_name', 'Unknown Store'),
                date=parsed_data.get('date', ''),
                items=parsed_data.get('items', []),
                subtotal=float(parsed_data.get('subtotal', 0)),
                tax=float(parsed_data.get('tax', 0)),
                total=float(parsed_data.get('total', 0)),
                receipt_number=parsed_data.get('receipt_number'),
                confidence=1.0,
                ai_enhanced=True
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI JSON response: {e}")
            raise ValueError(f"Invalid JSON response from AI: {e}")
        except Exception as e:
            logger.error(f"OpenAI receipt parsing failed: {e}")
            raise
    
    async def normalize_products(self, products: List[str]) -> List[ProductNormalization]:
        """
        Normalize product names to standard forms for cross-store comparison
        
        Args:
            products: List of product names to normalize
            
        Returns:
            List of normalized products
        """
        try:
            prompt = f"""
            Normalize these grocery product names to their standard forms.
            Handle brand variations, sizes, and packaging differences.
            
            Products: {', '.join(products)}
            
            Return JSON array:
            [
              {{
                "original": "string",
                "normalized": "string", 
                "brand": "string",
                "size": "string",
                "category": "string",
                "confidence": number
              }}
            ]
            
            Examples:
            - "Coca-Cola 330ml" -> "Coca-Cola 330ml"
            - "Coke 330ml" -> "Coca-Cola 330ml"
            - "Countdown Milk 2L" -> "Milk 2L"
            - "Pak'nSave Bread White" -> "White Bread"
            """
            
            response = await openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")
            
            parsed_data = json.loads(content)
            
            return [
                ProductNormalization(
                    original=item.get('original', ''),
                    normalized=item.get('normalized', ''),
                    brand=item.get('brand'),
                    size=item.get('size'),
                    category=item.get('category'),
                    confidence=float(item.get('confidence', 1.0))
                )
                for item in parsed_data
            ]
            
        except Exception as e:
            logger.error(f"Product normalization failed: {e}")
            raise
    
    async def generate_shopping_insights(self, user_history: List[Dict], current_basket: List[Dict]) -> Dict:
        """
        Generate personalized shopping insights based on user history
        
        Args:
            user_history: List of previous receipts
            current_basket: Current shopping basket
            
        Returns:
            Dictionary with shopping insights
        """
        try:
            prompt = f"""
            Analyze this user's shopping patterns and current basket.
            
            User History (last 10 receipts): {json.dumps(user_history)}
            Current Basket: {json.dumps(current_basket)}
            
            Provide insights as JSON:
            {{
              "price_anomalies": [
                {{
                  "item": "string",
                  "usual_price": number,
                  "current_price": number,
                  "difference": number,
                  "reasoning": "string"
                }}
              ],
              "substitutions": [
                {{
                  "expensive_item": "string",
                  "cheaper_alternative": "string",
                  "savings": number,
                  "confidence": number
                }}
              ],
              "timing_recommendations": [
                {{
                  "item": "string",
                  "best_day": "string",
                  "best_store": "string",
                  "reasoning": "string"
                }}
              ],
              "store_switching": [
                {{
                  "current_store": "string",
                  "better_store": "string",
                  "potential_savings": number,
                  "items_to_switch": ["string"]
                }}
              ]
            }}
            """
            
            response = await openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")
            
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Shopping insights generation failed: {e}")
            raise
    
    async def generate_budget_coaching(self, user_data: Dict, tone_mode: str = "gentle") -> Dict:
        """
        Generate personalized budget coaching
        
        Args:
            user_data: User spending data
            tone_mode: "gentle" or "direct"
            
        Returns:
            Dictionary with coaching insights
        """
        try:
            tone_instruction = "supportive and encouraging" if tone_mode == "gentle" else "direct and honest"
            
            prompt = f"""
            Act as a {tone_instruction} budget coach analyzing this user's grocery spending.
            
            User Data: {json.dumps(user_data)}
            
            Provide coaching as JSON:
            {{
              "weekly_analysis": "string",
              "spending_patterns": ["string"],
              "savings_opportunities": ["string"],
              "motivational_message": "string",
              "next_week_prediction": number,
              "action_items": ["string"],
              "progress_score": number
            }}
            """
            
            response = await openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")
            
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Budget coaching generation failed: {e}")
            raise
    
    async def health_check(self) -> bool:
        """Check if OpenAI service is working"""
        try:
            # Simple test call
            response = await openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            return bool(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"OpenAI health check failed: {e}")
            return False 