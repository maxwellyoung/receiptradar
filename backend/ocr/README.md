# ReceiptRadar OCR Service

A Python-based OCR microservice for parsing grocery receipts using PaddleOCR and custom receipt parsing logic.

## 🚀 Features

- **High Accuracy OCR**: Uses PaddleOCR for superior text recognition
- **Receipt-Specific Parsing**: Extracts structured data from grocery receipts
- **Store Recognition**: Automatically identifies major NZ grocery chains
- **Item Categorization**: Categorizes items into grocery categories
- **Validation**: Validates receipt data for accuracy
- **Fast Processing**: Optimized for sub-5 second processing times
- **RESTful API**: Easy integration with mobile app

## 📋 Requirements

- Python 3.11+
- 2GB+ RAM (for PaddleOCR models)
- OpenCV dependencies

## 🛠️ Quick Start

### Option 1: Using the startup script (Recommended)

```bash
cd ocr
./start.sh
```

### Option 2: Manual setup

```bash
cd ocr

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🌐 API Endpoints

### Health Check

```http
GET /health
```

### OCR Processing

```http
POST /ocr
Content-Type: multipart/form-data

file: <image_file>
```

### Receipt Parsing

```http
POST /parse
Content-Type: multipart/form-data

file: <image_file>
```

### Batch Processing

```http
POST /ocr/batch
Content-Type: multipart/form-data

files: <image_file1>, <image_file2>, ...
```

### Get Categories

```http
GET /categories
```

### Get Stores

```http
GET /stores
```

## 📊 API Response Examples

### OCR Response

```json
{
  "results": [
    {
      "text": "COUNTDOWN MT ALBERT",
      "bbox": [
        [0, 0],
        [200, 0],
        [200, 20],
        [0, 20]
      ],
      "confidence": 0.95
    }
  ],
  "processing_time": 1.23,
  "image_size": {
    "width": 400,
    "height": 600
  }
}
```

### Parsed Receipt Response

```json
{
  "store_name": "COUNTDOWN MT ALBERT",
  "date": "2024-12-15T00:00:00",
  "total": 25.52,
  "items": [
    {
      "name": "BREAD WHT 700G",
      "price": 3.5,
      "quantity": 1,
      "category": "Pantry",
      "confidence": 0.85
    }
  ],
  "subtotal": 22.19,
  "tax": 3.33,
  "receipt_number": "12345",
  "validation": {
    "is_valid": true,
    "warnings": [],
    "errors": []
  },
  "processing_time": 2.45
}
```

## 🏪 Supported Stores

- Countdown
- New World
- Pak'nSave
- Four Square
- Fresh Choice
- Super Value

## 🛒 Item Categories

- Fresh Produce
- Dairy
- Meat
- Pantry
- Beverages
- Snacks
- Frozen
- Household

## 🧪 Testing

### Run Tests

```bash
cd ocr
python -m pytest tests/ -v
```

### Test with Sample Receipt

```bash
cd ocr
python test_ocr.py
```

### Manual Testing

1. Start the service: `./start.sh`
2. Open browser: http://localhost:8000/docs
3. Use the interactive API documentation

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t receiptradar-ocr .
```

### Run Container

```bash
docker run -p 8000:8000 receiptradar-ocr
```

## 🚀 Fly.io Deployment

### Deploy to Fly.io

```bash
flyctl deploy
```

### Check Status

```bash
flyctl status
```

## 📈 Performance

- **Processing Time**: <5 seconds per receipt
- **Accuracy**: >93% item price correctness
- **Memory Usage**: ~2GB (including PaddleOCR models)
- **Concurrent Requests**: 10+ simultaneous receipts

## 🔧 Configuration

### Environment Variables

```bash
REDIS_URL=your_redis_url
LOG_LEVEL=INFO
OCR_CONFIDENCE_THRESHOLD=0.7
```

### Custom Categories

Edit `receipt_parser.py` to add custom categories:

```python
self.category_keywords = {
    'Your Category': ['keyword1', 'keyword2', 'keyword3'],
    # ... existing categories
}
```

## 🐛 Troubleshooting

### PaddleOCR Installation Issues

```bash
# Reinstall PaddleOCR
pip uninstall paddlepaddle paddleocr
pip install paddlepaddle paddleocr --upgrade
```

### Memory Issues

- Ensure 2GB+ RAM available
- Close other applications
- Use smaller image sizes

### Performance Issues

- Use JPEG format for images
- Compress images to <2MB
- Ensure good lighting in receipt photos

## 📝 Logs

Logs are written to `ocr_service.log` with rotation:

- Max file size: 10MB
- Retention: 7 days

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📄 License

MIT License - see LICENSE for details
