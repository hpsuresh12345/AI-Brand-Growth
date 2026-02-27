#!/bin/bash
# Development environment setup script

set -e  # Exit on any error

echo "🚀 Setting up AI Real Estate Lead Conversion Engine - Development Environment"
echo "=============================================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend
echo ""
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env if not exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp ../.env.example .env
    echo "⚠️  Please edit backend/.env and add your ANTHROPIC_API_KEY and other settings"
fi

# Create database
echo "Creating database..."
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"

cd ..

# Setup frontend
echo ""
echo "🎨 Setting up frontend..."
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit backend/.env and add your ANTHROPIC_API_KEY"
echo "   2. Generate a secure JWT_SECRET_KEY:"
echo "      python -c \"import secrets; print(secrets.token_urlsafe(32))\""
echo "   3. Start the backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "   4. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access the application at:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
