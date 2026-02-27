#!/bin/bash
# Test runner script

set -e

echo "🧪 Running AI Real Estate Lead Conversion Engine Tests"
echo "======================================================="

cd backend

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    echo "❌ Virtual environment not found. Run setup-dev.sh first."
    exit 1
fi

# Run tests with coverage
echo ""
echo "Running tests..."
pytest -v --cov=app --cov-report=term-missing --cov-report=html

echo ""
echo "✅ Tests complete!"
echo ""
echo "📊 Coverage report generated in backend/htmlcov/index.html"
echo "   Open with: open htmlcov/index.html (Mac) or start htmlcov/index.html (Windows)"
