#!/bin/bash

# ReceiptRadar OCR Service Startup Script

echo "🚀 Starting ReceiptRadar OCR Service..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+"
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.10"

# Compare major.minor version (allow 3.10 or higher)
if [[ $(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1) != "$required_version" ]]; then
    echo "❌ Python $python_version is installed, but Python $required_version+ is required"
    exit 1
fi

echo "✅ Python $python_version detected"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if PaddleOCR is properly installed
echo "🔍 Checking OCR dependencies..."
python3 -c "from paddleocr import PaddleOCR; print('✅ PaddleOCR installed successfully')" 2>/dev/null || {
    echo "❌ PaddleOCR installation failed. This might take a while on first run..."
    echo "💡 If this fails, try: pip install paddlepaddle paddleocr --upgrade"
}

# Start the service
echo "🌐 Starting OCR service on http://localhost:8000"
echo "📖 API documentation available at http://localhost:8000/docs"
echo "🔍 Health check available at http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Run the service
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload 