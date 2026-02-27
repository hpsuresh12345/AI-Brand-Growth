@echo off
REM Development environment setup script for Windows

echo 🚀 Setting up AI Real Estate Lead Conversion Engine - Development Environment
echo ==============================================================================

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.11 or higher.
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 20 or higher.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup backend
echo.
echo 🔧 Setting up backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create .env if not exists
if not exist ".env" (
    echo Creating .env file from template...
    copy ..\. env.example .env
    echo ⚠️  Please edit backend\.env and add your ANTHROPIC_API_KEY and other settings
)

REM Create database
echo Creating database...
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"

cd ..

REM Setup frontend
echo.
echo 🎨 Setting up frontend...
cd frontend

REM Install dependencies
echo Installing Node.js dependencies...
call npm install

cd ..

echo.
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo    1. Edit backend\.env and add your ANTHROPIC_API_KEY
echo    2. Generate a secure JWT_SECRET_KEY:
echo       python -c "import secrets; print(secrets.token_urlsafe(32))"
echo    3. Start the backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo    4. Start the frontend: cd frontend ^&^& npm run dev
echo.
echo 🌐 Access the application at:
echo    - Frontend: http://localhost:5173
echo    - Backend API: http://localhost:8000
echo    - API Docs: http://localhost:8000/docs

pause
