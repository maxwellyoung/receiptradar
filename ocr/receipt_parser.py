import re
import json
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class ReceiptItem:
    name: str
    price: float
    quantity: int = 1
    category: Optional[str] = None
    confidence: float = 0.0

@dataclass
class ReceiptData:
    store_name: Optional[str] = None
    date: Optional[datetime] = None
    total: Optional[float] = None
    items: List[ReceiptItem] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    receipt_number: Optional[str] = None
    
    def __post_init__(self):
        if self.items is None:
            self.items = []

class ReceiptParser:
    def __init__(self):
        # Common store name patterns
        self.store_patterns = {
            'countdown': r'(?i)countdown|cd\s*$',
            'new_world': r'(?i)new\s*world|nw\s*$',
            'paknsave': r'(?i)pak\s*[\'n\s]*save|pns\s*$',
            'four_square': r'(?i)four\s*square|4\s*square',
            'fresh_choice': r'(?i)fresh\s*choice',
            'super_value': r'(?i)super\s*value',
        }
        
        # Price patterns
        self.price_pattern = r'\$?\s*(\d+\.\d{2})'
        self.quantity_pattern = r'(\d+)\s*x\s*'
        
        # Date patterns
        self.date_patterns = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})',  # DD/MM/YYYY
            r'(\d{4})-(\d{1,2})-(\d{1,2})',  # YYYY-MM-DD
            r'(\d{1,2})\s+(\w{3})\s+(\d{4})',  # DD MMM YYYY
        ]
        
        # Category mapping for common grocery items
        self.category_keywords = {
            'Fresh Produce': ['apple', 'banana', 'tomato', 'lettuce', 'carrot', 'onion', 'potato', 'avocado', 'cucumber', 'pepper'],
            'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'yoghurt', 'cheddar', 'mozzarella'],
            'Meat': ['beef', 'chicken', 'pork', 'lamb', 'steak', 'mince', 'sausage', 'bacon', 'ham'],
            'Pantry': ['bread', 'pasta', 'rice', 'flour', 'sugar', 'oil', 'sauce', 'soup', 'cereal'],
            'Beverages': ['water', 'juice', 'soda', 'beer', 'wine', 'coffee', 'tea', 'coke', 'pepsi'],
            'Snacks': ['chips', 'crackers', 'nuts', 'chocolate', 'candy', 'biscuits', 'cookies'],
            'Frozen': ['ice cream', 'frozen', 'pizza', 'fries', 'peas', 'corn'],
            'Household': ['toilet paper', 'paper towel', 'soap', 'detergent', 'cleaning', 'tissue'],
        }

    def parse_ocr_results(self, ocr_results: List[Dict]) -> ReceiptData:
        """Parse OCR results into structured receipt data"""
        receipt = ReceiptData()
        lines = [result['text'].strip() for result in ocr_results if result['text'].strip()]
        
        # Extract store name from header
        receipt.store_name = self._extract_store_name(lines[:5])
        
        # Extract date
        receipt.date = self._extract_date(lines)
        
        # Extract items and prices
        receipt.items = self._extract_items(lines)
        
        # Extract totals
        receipt.total, receipt.subtotal, receipt.tax = self._extract_totals(lines)
        
        # Extract receipt number
        receipt.receipt_number = self._extract_receipt_number(lines)
        
        return receipt

    def _extract_store_name(self, header_lines: List[str]) -> Optional[str]:
        """Extract store name from header lines"""
        for line in header_lines:
            line_lower = line.lower()
            for store_name, pattern in self.store_patterns.items():
                if re.search(pattern, line_lower):
                    return line.strip()
        return None

    def _extract_date(self, lines: List[str]) -> Optional[datetime]:
        """Extract date from receipt lines"""
        for line in lines:
            for pattern in self.date_patterns:
                match = re.search(pattern, line)
                if match:
                    try:
                        if len(match.groups()) == 3:
                            if len(match.group(3)) == 2:  # YY format
                                year = '20' + match.group(3)
                            else:
                                year = match.group(3)
                            
                            if len(match.group(1)) == 4:  # YYYY-MM-DD format
                                return datetime(int(match.group(1)), int(match.group(2)), int(match.group(3)))
                            else:  # DD/MM/YYYY format
                                return datetime(int(year), int(match.group(2)), int(match.group(1)))
                    except (ValueError, IndexError):
                        continue
        return None

    def _extract_items(self, lines: List[str]) -> List[ReceiptItem]:
        """Extract items and prices from receipt lines"""
        items = []
        
        for line in lines:
            # Skip header lines, totals, and non-item lines
            if self._is_header_line(line) or self._is_total_line(line):
                continue
                
            # Look for price pattern
            price_match = re.search(self.price_pattern, line)
            if not price_match:
                continue
                
            price = float(price_match.group(1))
            
            # Extract item name (everything before the price)
            item_text = line[:price_match.start()].strip()
            if not item_text:
                continue
                
            # Extract quantity
            quantity = 1
            qty_match = re.search(self.quantity_pattern, item_text)
            if qty_match:
                quantity = int(qty_match.group(1))
                item_text = item_text[qty_match.end():].strip()
            
            # Determine category
            category = self._categorize_item(item_text)
            
            # Calculate confidence based on text length and price
            confidence = min(0.9, 0.5 + len(item_text) * 0.02 + (price > 0) * 0.3)
            
            items.append(ReceiptItem(
                name=item_text,
                price=price,
                quantity=quantity,
                category=category,
                confidence=confidence
            ))
        
        return items

    def _is_header_line(self, line: str) -> bool:
        """Check if line is a header (store name, date, etc.)"""
        header_keywords = ['receipt', 'invoice', 'total', 'subtotal', 'tax', 'gst', 'change', 'card', 'cash']
        line_lower = line.lower()
        return any(keyword in line_lower for keyword in header_keywords)

    def _is_total_line(self, line: str) -> bool:
        """Check if line contains totals"""
        total_keywords = ['total', 'subtotal', 'tax', 'gst', 'amount due', 'balance']
        line_lower = line.lower()
        return any(keyword in line_lower for keyword in total_keywords)

    def _categorize_item(self, item_name: str) -> Optional[str]:
        """Categorize item based on keywords"""
        item_lower = item_name.lower()
        
        for category, keywords in self.category_keywords.items():
            if any(keyword in item_lower for keyword in keywords):
                return category
        
        return None

    def _extract_totals(self, lines: List[str]) -> Tuple[Optional[float], Optional[float], Optional[float]]:
        """Extract total, subtotal, and tax amounts"""
        total = None
        subtotal = None
        tax = None
        
        for line in lines:
            line_lower = line.lower()
            
            if 'total' in line_lower and not 'subtotal' in line_lower:
                match = re.search(self.price_pattern, line)
                if match:
                    total = float(match.group(1))
            
            elif 'subtotal' in line_lower:
                match = re.search(self.price_pattern, line)
                if match:
                    subtotal = float(match.group(1))
            
            elif 'tax' in line_lower or 'gst' in line_lower:
                match = re.search(self.price_pattern, line)
                if match:
                    tax = float(match.group(1))
        
        return total, subtotal, tax

    def _extract_receipt_number(self, lines: List[str]) -> Optional[str]:
        """Extract receipt number"""
        for line in lines:
            # Look for patterns like "Receipt #12345" or "RN: 12345"
            match = re.search(r'(?:receipt|rn|invoice)\s*[#:]?\s*(\d+)', line.lower())
            if match:
                return match.group(1)
        return None

    def validate_receipt(self, receipt: ReceiptData) -> Dict[str, any]:
        """Validate receipt data and return validation results"""
        validation = {
            'is_valid': True,
            'warnings': [],
            'errors': []
        }
        
        # Check if we have items
        if not receipt.items:
            validation['is_valid'] = False
            validation['errors'].append('No items found in receipt')
        
        # Check if total matches sum of items
        if receipt.total and receipt.items:
            calculated_total = sum(item.price * item.quantity for item in receipt.items)
            if abs(calculated_total - receipt.total) > 0.01:
                validation['warnings'].append(f'Total mismatch: calculated ${calculated_total:.2f}, receipt shows ${receipt.total:.2f}')
        
        # Check for low confidence items
        low_confidence_items = [item for item in receipt.items if item.confidence < 0.6]
        if low_confidence_items:
            validation['warnings'].append(f'{len(low_confidence_items)} items have low confidence scores')
        
        return validation 