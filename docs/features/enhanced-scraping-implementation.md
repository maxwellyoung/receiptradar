# Enhanced Scraping Implementation

## Overview

Based on the successful techniques from the [grocer repository](https://github.com/TonyCui02/grocer), we've significantly enhanced our price scraping capabilities for NZ supermarkets. This implementation incorporates proven methods that work effectively with NZ supermarket websites.

## Key Improvements from Grocer Repository

### 1. Countdown API Integration

**Previous Approach**: Generic web scraping with Playwright
**Enhanced Approach**: Direct API calls using the same endpoints as grocer

```python
# Countdown API endpoint discovered from grocer
url = "https://shop.countdown.co.nz/api/v1/products"
params = {
    'dasFilter': f'Department;;{department};false',
    'target': 'browse',
    'page': page
}
```

**Key Headers from Grocer**:

- `x-requested-with: OnlineShopping.WebApp`
- `request-id: |d99a667157664139bb2435b190eda682.c30ccf4caa5e4c86`
- Proper referer and authority headers

### 2. Department-Based Scraping

**Previous Approach**: Item-by-item search
**Enhanced Approach**: Department-by-department scraping

```python
# Countdown departments from grocer
departments = [
    'meat-seafood', 'fruit-veg', 'fridge-deli', 'bakery',
    'frozen', 'pantry', 'beer-wine', 'drinks',
    'health-beauty', 'household', 'baby-child', 'pet'
]

# Pak'nSave departments from grocer
departments = [
    'pantry', 'fresh-foods-and-bakery', 'baby-toddler-and-kids',
    'beer-cider-and-wine', 'chilled-frozen-and-desserts',
    'drinks', 'personal-care', 'kitchen-dining-and-household'
]
```

### 3. Pak'nSave BeautifulSoup Implementation

**Previous Approach**: Generic selectors
**Enhanced Approach**: Specific selectors from grocer

```python
# Product container selector from grocer
containers = soup.find_all("div", {'class':'fs-product-card'})

# Product data extraction from grocer
footer = container.find("div", {"class":"js-product-card-footer fs-product-card__footer-container"})
data = json.loads(footer.get("data-options"))
product_name = data.get("productName")
price = data.get('ProductDetails', {}).get('PricePerItem')
```

### 4. Proper Pagination Handling

**Previous Approach**: Fixed page limits
**Enhanced Approach**: Dynamic pagination based on total items

```python
# Countdown pagination from grocer
if page == 1:
    total_items = raw_data.get('products', {}).get('totalItems', 0)
    page_num = math.ceil(total_items / 48) + 1

# Pak'nSave pagination from grocer
if page == 1:
    page_num_container = soup.find("div", {"class": "fs-product-filter__item u-color-half-dark-grey u-hide-down-l"})
    products_num = page_num_container.text.split(" ")[5]
    page_num = math.ceil(int(products_num) / 20)
```

## Implementation Files

### 1. Enhanced Price Scraper (`ocr/enhanced_price_scraper.py`)

Main scraper service that implements all grocer techniques:

- Async/await for better performance
- Proper error handling and retry logic
- Database integration
- Proxy support
- Rate limiting

### 2. Enhanced Configuration (`ocr/enhanced_scraper_config.json`)

Comprehensive configuration for all NZ supermarkets:

- Store-specific headers and endpoints
- Department mappings
- Scraping parameters
- Selector configurations

### 3. Test Script (`ocr/test_enhanced_scraper.py`)

Validation script to test the enhanced scraper:

- Tests both Countdown and Pak'nSave
- Sample data verification
- Database storage testing

## Usage

### Basic Usage

```bash
# Test the enhanced scraper
cd ocr
python test_enhanced_scraper.py

# Run full scraping job
python enhanced_price_scraper.py

# Run for specific store
python enhanced_price_scraper.py --store countdown
```

### Configuration

The scraper uses environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SCRAPER_PROXIES`: Comma-separated list of proxy servers

## Key Benefits

### 1. Higher Success Rate

- Uses proven techniques from working implementation
- Proper headers and API endpoints
- Better error handling

### 2. More Comprehensive Coverage

- Department-based scraping captures more products
- Dynamic pagination handles all available items
- Multiple store support

### 3. Better Performance

- Async implementation for concurrent scraping
- Efficient API calls vs. browser automation
- Proper rate limiting

### 4. Enhanced Data Quality

- Extracts volume/size information
- Captures product images
- Better price validation

## Data Structure

Enhanced scraped data includes:

```python
@dataclass
class ScrapedPrice:
    store_id: str
    item_name: str
    price: Decimal
    date: datetime
    url: str
    confidence: float = 1.0
    volume_size: Optional[str] = None  # New field
    image_url: Optional[str] = None    # New field
```

## Database Schema Updates

The enhanced scraper stores additional data:

```sql
-- Enhanced price_history table
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS volume_size TEXT;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS image_url TEXT;
```

## Monitoring and Maintenance

### Logging

- Comprehensive logging for debugging
- Performance metrics tracking
- Error reporting

### Rate Limiting

- Configurable delays between requests
- Respectful scraping practices
- Proxy rotation support

### Data Validation

- Price range validation
- Duplicate detection
- Confidence scoring

## Future Enhancements

1. **New World Integration**: Extend to New World using similar techniques
2. **Fresh Choice/Super Value**: Add support for smaller chains
3. **Price History Analysis**: Implement trend analysis
4. **Automated Scheduling**: Set up regular scraping jobs
5. **Alert System**: Notify on significant price changes

## Troubleshooting

### Common Issues

1. **API Rate Limiting**: Increase delays between requests
2. **Selector Changes**: Update selectors in configuration
3. **Database Connection**: Check DATABASE_URL environment variable
4. **Proxy Issues**: Verify proxy configuration

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Conclusion

The enhanced scraping implementation based on the grocer repository provides a robust, scalable solution for collecting price data from NZ supermarkets. The proven techniques ensure high success rates while maintaining respectful scraping practices.
