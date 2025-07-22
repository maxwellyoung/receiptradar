import re
import json
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging
import rapidfuzz

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
        """Enhanced store name extraction"""
        # First, try exact pattern matching
        for line in header_lines:
            line_lower = line.lower()
            for store_name, pattern in self.store_patterns.items():
                if re.search(pattern, line_lower):
                    return line.strip()
        
        # If no exact match, try fuzzy matching
        for line in header_lines:
            line_lower = line.lower()
            
            # Common store keywords
            store_keywords = ['countdown', 'new world', 'paknsave', 'four square', 'fresh choice', 'super value']
            for keyword in store_keywords:
                if keyword in line_lower:
                    return line.strip()
            
            # Look for lines that might be store names (uppercase, reasonable length)
            if (line.isupper() and 3 <= len(line) <= 50 and 
                not any(word in line_lower for word in ['receipt', 'invoice', 'total', 'date', 'time'])):
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
        """Enhanced item extraction with better pattern matching"""
        items = []
        
        for i, line in enumerate(lines):
            # Skip header lines, totals, and non-item lines
            if self._is_header_line(line) or self._is_total_line(line):
                continue
                
            # Enhanced price pattern matching
            price_match = self._extract_price(line)
            if not price_match:
                continue
                
            price = price_match['price']
            
            # Extract item name with better logic
            item_text = self._extract_item_name(line, price_match)
            if not item_text or len(item_text.strip()) < 2:
                continue
                
            # Extract quantity with better patterns
            quantity = self._extract_quantity(item_text)
            if quantity > 1:
                # Remove quantity from item name
                item_text = self._remove_quantity_from_name(item_text, quantity)
            
            # Determine category with improved logic
            category = self._categorize_item(item_text)
            
            # Calculate confidence based on multiple factors
            confidence = self._calculate_item_confidence(item_text, price, line)
            
            # Skip items with very low confidence
            if confidence < 0.3:
                continue
            
            items.append(ReceiptItem(
                name=item_text.strip(),
                price=price,
                quantity=quantity,
                category=category,
                confidence=confidence
            ))
        
        return items

    def _extract_price(self, line: str) -> Optional[Dict[str, float]]:
        """Enhanced price extraction with multiple patterns"""
        # Multiple price patterns
        price_patterns = [
            r'\$?\s*(\d+\.\d{2})',  # Standard price: $12.34
            r'\$?\s*(\d+\.\d{1})',  # Price with one decimal: $12.3
            r'\$?\s*(\d+)',         # Whole number price: $12
            r'(\d+\.\d{2})\s*$',    # Price at end of line
            r'(\d+\.\d{1})\s*$',    # Price with one decimal at end
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, line)
            if match:
                price = float(match.group(1))
                # Validate reasonable price range
                if 0.01 <= price <= 10000:
                    return {
                        'price': price,
                        'start': match.start(),
                        'end': match.end()
                    }
        
        return None

    def _extract_item_name(self, line: str, price_match: Dict[str, float]) -> str:
        """Extract item name with better logic"""
        # Get text before the price
        item_text = line[:price_match['start']].strip()
        
        # Clean up common OCR artifacts
        item_text = re.sub(r'[^\w\s\.\-\&\(\)]', '', item_text)
        item_text = re.sub(r'\s+', ' ', item_text)
        
        # Remove common prefixes/suffixes
        item_text = re.sub(r'^(QTY|QTY:|QTY\s+\d+|X\s*\d+)\s*', '', item_text, flags=re.IGNORECASE)
        item_text = re.sub(r'\s+(EACH|PER|UNIT|KG|L|PACK|PKT)\s*$', '', item_text, flags=re.IGNORECASE)
        
        return item_text

    def _extract_quantity(self, item_text: str) -> int:
        """Enhanced quantity extraction"""
        # Multiple quantity patterns
        quantity_patterns = [
            r'(\d+)\s*x\s*',        # 2 x
            r'(\d+)\s*@\s*',        # 2 @
            r'QTY\s*(\d+)',         # QTY 2
            r'(\d+)\s*PKT',         # 2 PKT
            r'(\d+)\s*PACK',        # 2 PACK
        ]
        
        for pattern in quantity_patterns:
            match = re.search(pattern, item_text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return 1

    def _remove_quantity_from_name(self, item_text: str, quantity: int) -> str:
        """Remove quantity information from item name"""
        # Remove quantity patterns
        patterns_to_remove = [
            rf'{quantity}\s*x\s*',
            rf'{quantity}\s*@\s*',
            rf'QTY\s*{quantity}',
            rf'{quantity}\s*PKT',
            rf'{quantity}\s*PACK',
        ]
        
        for pattern in patterns_to_remove:
            item_text = re.sub(pattern, '', item_text, flags=re.IGNORECASE)
        
        return item_text.strip()

    def _calculate_item_confidence(self, item_text: str, price: float, original_line: str) -> float:
        """Calculate confidence score for extracted item"""
        confidence = 0.5  # Base confidence
        
        # Text length factor
        if len(item_text) >= 3:
            confidence += 0.2
        elif len(item_text) >= 2:
            confidence += 0.1
        
        # Price validation
        if 0.01 <= price <= 1000:
            confidence += 0.2
        
        # Line structure factor
        if re.search(r'\s{2,}', original_line):  # Multiple spaces (typical receipt format)
            confidence += 0.1
        
        # Category match factor
        if self._categorize_item(item_text):
            confidence += 0.1
        
        # No suspicious characters
        if not re.search(r'[^\w\s\.\-\&\(\)]', item_text):
            confidence += 0.1
        
        return min(confidence, 0.95)

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
        """Categorize item based on keywords and fuzzy matching"""
        item_lower = item_name.lower()
        best_category = None
        best_score = 0.0
        # Expanded category keywords
        expanded_category_keywords = {
            'Fresh Produce': self.category_keywords['Fresh Produce'] + ['grapes', 'kiwi', 'mandarin', 'pear', 'plum', 'spinach', 'broccoli', 'cauliflower', 'pumpkin', 'lemon', 'lime', 'orange', 'blueberry', 'strawberry'],
            'Dairy': self.category_keywords['Dairy'] + ['cream cheese', 'custard', 'evaporated milk', 'condensed milk', 'ice cream'],
            'Meat': self.category_keywords['Meat'] + ['turkey', 'duck', 'venison', 'salami', 'meatballs', 'ribs', 'wings', 'drumsticks'],
            'Pantry': self.category_keywords['Pantry'] + ['muesli', 'granola', 'jam', 'honey', 'spices', 'herbs', 'baking powder', 'yeast', 'vinegar', 'mustard', 'mayonnaise', 'ketchup', 'tomato paste', 'beans', 'lentils', 'chickpeas', 'couscous', 'quinoa'],
            'Beverages': self.category_keywords['Beverages'] + ['smoothie', 'energy drink', 'sports drink', 'kombucha', 'lemonade', 'ginger beer', 'tonic', 'syrup'],
            'Snacks': self.category_keywords['Snacks'] + ['popcorn', 'muesli bar', 'granola bar', 'rice cracker', 'pretzel', 'fruit snack', 'trail mix', 'ice block'],
            'Frozen': self.category_keywords['Frozen'] + ['frozen berries', 'frozen veg', 'frozen meal', 'frozen fish', 'frozen chicken', 'frozen dessert'],
            'Household': self.category_keywords['Household'] + ['dishwasher', 'laundry', 'bleach', 'sponges', 'bin liner', 'foil', 'cling film', 'air freshener', 'insect spray', 'light bulb'],
        }
        # Fuzzy match against expanded keywords
        for category, keywords in expanded_category_keywords.items():
            for keyword in keywords:
                score = rapidfuzz.fuzz.partial_ratio(item_lower, keyword)
                if score > best_score and score > 80:  # 80+ is a strong match
                    best_score = score
                    best_category = category
        if best_category:
            return best_category
        # Fallback: try OpenAI normalization if available and confidence is low
        # (Pseudo-code, as this would require async and service access)
        # if hasattr(self, 'openai_service') and best_score < 85:
        #     normalized = await self.openai_service.normalize_products([item_name])
        #     if normalized and normalized[0].category:
        #         return normalized[0].category
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