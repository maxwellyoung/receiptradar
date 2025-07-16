import pytest
from datetime import datetime
from receipt_parser import ReceiptParser, ReceiptData, ReceiptItem

@pytest.fixture
def parser():
    return ReceiptParser()

@pytest.fixture
def sample_ocr_results():
    return [
        {'text': 'COUNTDOWN MT ALBERT', 'bbox': [[0, 0], [200, 0], [200, 20], [0, 20]], 'confidence': 0.95},
        {'text': '15/12/2024', 'bbox': [[0, 25], [100, 25], [100, 45], [0, 45]], 'confidence': 0.90},
        {'text': 'BREAD WHT 700G', 'bbox': [[0, 50], [150, 50], [150, 70], [0, 70]], 'confidence': 0.85},
        {'text': '$3.50', 'bbox': [[160, 50], [200, 50], [200, 70], [160, 70]], 'confidence': 0.95},
        {'text': 'MILK 2L', 'bbox': [[0, 75], [120, 75], [120, 95], [0, 95]], 'confidence': 0.88},
        {'text': '$4.20', 'bbox': [[160, 75], [200, 75], [200, 95], [160, 95]], 'confidence': 0.95},
        {'text': 'APPLE RED 1KG', 'bbox': [[0, 100], [140, 100], [140, 120], [0, 120]], 'confidence': 0.82},
        {'text': '$5.99', 'bbox': [[160, 100], [200, 100], [200, 120], [160, 120]], 'confidence': 0.95},
        {'text': 'TOTAL', 'bbox': [[0, 150], [100, 150], [100, 170], [0, 170]], 'confidence': 0.90},
        {'text': '$13.69', 'bbox': [[160, 150], [200, 150], [200, 170], [160, 170]], 'confidence': 0.95},
    ]

def test_extract_store_name(parser):
    """Test store name extraction"""
    lines = ['COUNTDOWN MT ALBERT', '15/12/2024', 'BREAD WHT 700G $3.50']
    store_name = parser._extract_store_name(lines)
    assert store_name == 'COUNTDOWN MT ALBERT'

def test_extract_store_name_new_world(parser):
    """Test New World store name extraction"""
    lines = ['NEW WORLD PONSONBY', '15/12/2024', 'BREAD WHT 700G $3.50']
    store_name = parser._extract_store_name(lines)
    assert store_name == 'NEW WORLD PONSONBY'

def test_extract_date(parser):
    """Test date extraction"""
    lines = ['COUNTDOWN MT ALBERT', '15/12/2024', 'BREAD WHT 700G $3.50']
    date = parser._extract_date(lines)
    assert date == datetime(2024, 12, 15)

def test_extract_date_yy_format(parser):
    """Test date extraction with YY format"""
    lines = ['COUNTDOWN MT ALBERT', '15/12/24', 'BREAD WHT 700G $3.50']
    date = parser._extract_date(lines)
    assert date == datetime(2024, 12, 15)

def test_extract_items(parser):
    """Test item extraction"""
    lines = [
        'COUNTDOWN MT ALBERT',
        '15/12/2024',
        'BREAD WHT 700G $3.50',
        'MILK 2L $4.20',
        'APPLE RED 1KG $5.99',
        'TOTAL $13.69'
    ]
    items = parser._extract_items(lines)
    
    assert len(items) == 3
    assert items[0].name == 'BREAD WHT 700G'
    assert items[0].price == 3.50
    assert items[0].category == 'Pantry'
    
    assert items[1].name == 'MILK 2L'
    assert items[1].price == 4.20
    assert items[1].category == 'Dairy'
    
    assert items[2].name == 'APPLE RED 1KG'
    assert items[2].price == 5.99
    assert items[2].category == 'Fresh Produce'

def test_extract_items_with_quantity(parser):
    """Test item extraction with quantities"""
    lines = [
        'COUNTDOWN MT ALBERT',
        '2 x BREAD WHT 700G $7.00',
        'MILK 2L $4.20'
    ]
    items = parser._extract_items(lines)
    
    assert len(items) == 2
    assert items[0].name == 'BREAD WHT 700G'
    assert items[0].price == 7.00
    assert items[0].quantity == 2

def test_extract_totals(parser):
    """Test total extraction"""
    lines = [
        'COUNTDOWN MT ALBERT',
        'BREAD WHT 700G $3.50',
        'MILK 2L $4.20',
        'SUBTOTAL $7.70',
        'GST $1.15',
        'TOTAL $8.85'
    ]
    total, subtotal, tax = parser._extract_totals(lines)
    
    assert total == 8.85
    assert subtotal == 7.70
    assert tax == 1.15

def test_extract_receipt_number(parser):
    """Test receipt number extraction"""
    lines = [
        'COUNTDOWN MT ALBERT',
        'Receipt #12345',
        'BREAD WHT 700G $3.50'
    ]
    receipt_number = parser._extract_receipt_number(lines)
    assert receipt_number == '12345'

def test_categorize_item(parser):
    """Test item categorization"""
    assert parser._categorize_item('BREAD WHT 700G') == 'Pantry'
    assert parser._categorize_item('MILK 2L') == 'Dairy'
    assert parser._categorize_item('APPLE RED 1KG') == 'Fresh Produce'
    assert parser._categorize_item('CHICKEN BREAST 500G') == 'Meat'
    assert parser._categorize_item('UNKNOWN ITEM') is None

def test_is_header_line(parser):
    """Test header line detection"""
    assert parser._is_header_line('RECEIPT') == True
    assert parser._is_header_line('TOTAL') == True
    assert parser._is_header_line('BREAD WHT 700G') == False

def test_is_total_line(parser):
    """Test total line detection"""
    assert parser._is_total_line('TOTAL $13.69') == True
    assert parser._is_total_line('SUBTOTAL $12.50') == True
    assert parser._is_total_line('BREAD WHT 700G') == False

def test_parse_ocr_results(parser, sample_ocr_results):
    """Test full OCR results parsing"""
    receipt = parser.parse_ocr_results(sample_ocr_results)
    
    assert receipt.store_name == 'COUNTDOWN MT ALBERT'
    assert receipt.date == datetime(2024, 12, 15)
    assert receipt.total == 13.69
    assert len(receipt.items) == 3
    
    # Check items
    assert receipt.items[0].name == 'BREAD WHT 700G'
    assert receipt.items[0].price == 3.50
    assert receipt.items[0].category == 'Pantry'
    
    assert receipt.items[1].name == 'MILK 2L'
    assert receipt.items[1].price == 4.20
    assert receipt.items[1].category == 'Dairy'
    
    assert receipt.items[2].name == 'APPLE RED 1KG'
    assert receipt.items[2].price == 5.99
    assert receipt.items[2].category == 'Fresh Produce'

def test_validate_receipt_valid(parser, sample_ocr_results):
    """Test receipt validation with valid data"""
    receipt = parser.parse_ocr_results(sample_ocr_results)
    validation = parser.validate_receipt(receipt)
    
    assert validation['is_valid'] == True
    assert len(validation['errors']) == 0
    assert len(validation['warnings']) == 0

def test_validate_receipt_no_items(parser):
    """Test receipt validation with no items"""
    receipt = ReceiptData()
    receipt.items = []
    validation = parser.validate_receipt(receipt)
    
    assert validation['is_valid'] == False
    assert 'No items found in receipt' in validation['errors']

def test_validate_receipt_total_mismatch(parser):
    """Test receipt validation with total mismatch"""
    receipt = ReceiptData()
    receipt.total = 20.00
    receipt.items = [
        ReceiptItem(name='BREAD', price=3.50, quantity=1),
        ReceiptItem(name='MILK', price=4.20, quantity=1)
    ]
    validation = parser.validate_receipt(receipt)
    
    assert validation['is_valid'] == True
    assert len(validation['warnings']) > 0
    assert 'Total mismatch' in validation['warnings'][0]

def test_validate_receipt_low_confidence(parser):
    """Test receipt validation with low confidence items"""
    receipt = ReceiptData()
    receipt.items = [
        ReceiptItem(name='BREAD', price=3.50, quantity=1, confidence=0.3),
        ReceiptItem(name='MILK', price=4.20, quantity=1, confidence=0.8)
    ]
    validation = parser.validate_receipt(receipt)
    
    assert validation['is_valid'] == True
    assert len(validation['warnings']) > 0
    assert 'low confidence scores' in validation['warnings'][0] 