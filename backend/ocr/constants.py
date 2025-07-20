from decimal import Decimal

class BUSINESS_RULES:
    # Database connection limits
    DATABASE = {
        "MAX_CONNECTIONS": 10,
        "PRICE_HISTORY_DAYS": 30,
        "PRICE_HISTORY_DAYS_EXTENDED": 90,
    }
    
    # Confidence thresholds
    CONFIDENCE_THRESHOLDS = {
        "LOW": 0.6,
        "MEDIUM": 0.8,
        "HIGH": 0.9,
    }

    # API timeouts
    API_TIMEOUTS = {
        "OCR_PROCESSING": 30,  # 30 seconds
        "HEALTH_CHECK": 5,     # 5 seconds
    } 