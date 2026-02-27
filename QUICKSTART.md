# 🚀 Quick Start Guide

## Installation & Setup

### Option 1: Docker (Recommended for Production)

**Prerequisites:**
- Docker & Docker Compose installed

**Steps:**

```bash
# 1. Navigate to project directory
cd App2-Lead

# 2. Create environment file
cp .env.example .env

# 3. Edit .env and add your keys
# Required:
#   - ANTHROPIC_API_KEY
#   - JWT_SECRET_KEY (generate: python -c "import secrets; print(secrets.token_urlsafe(32))")
#   - DB_PASSWORD

# 4. Start all services
docker-compose up -d

# 5. View logs
docker-compose logs -f

# 6. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Create First Admin User:**

```bash
# Access backend container
docker-compose exec backend bash

# Open Python shell
python

# Create admin
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.services.auth_service import hash_password

db = SessionLocal()
admin = User(
    email="admin@example.com",
    hashed_password=hash_password("changeme123"),
    full_name="Admin User",
    role=UserRole.ADMIN,
    is_active=True
)
db.add(admin)
db.commit()
print(f"Admin created: {admin.email}")
exit()
```

---

### Option 2: Manual Setup (Development)

**Prerequisites:**
- Python 3.11+
- Node.js 20+
- PostgreSQL (optional, can use SQLite)

**Windows:**

```bash
# Run setup script
scripts\setup-dev.bat

# Follow the prompts
```

**Linux/Mac:**

```bash
# Make script executable
chmod +x scripts/setup-dev.sh

# Run setup
./scripts/setup-dev.sh
```

**Manual Steps:**

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

# Create .env
cp ../.env.example .env
# Edit .env with your settings

# Create database
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Start backend
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Configuration

### Required Environment Variables

Edit `backend/.env`:

```env
# AI - Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-key-here

# JWT - Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET_KEY=your-secure-32-char-secret-CHANGE-THIS

# Database (use SQLite for dev, PostgreSQL for prod)
DATABASE_URL=sqlite:///./lead_engine.db
# DATABASE_URL=postgresql://user:pass@localhost:5432/lead_engine

# CORS - Add your frontend URLs
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional
APP_ENV=development
DEBUG=true
RATE_LIMIT_PER_MINUTE=60
```

---

## First Steps After Setup

### 1. Create Admin User

**Using API (after backend is running):**

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

**Or using Python:**

```python
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.services.auth_service import hash_password

db = SessionLocal()
admin = User(
    email="admin@example.com",
    hashed_password=hash_password("SecurePassword123!"),
    full_name="Admin User",
    role=UserRole.ADMIN,
    is_active=True
)
db.add(admin)
db.commit()
```

### 2. Login & Get Token

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
```

Save the `access_token` from the response.

### 3. Create Your First Lead

```bash
curl -X POST http://localhost:8000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "budget": 5000000,
    "location": "Mumbai",
    "timeline": "Immediately",
    "property_type": "2BHK",
    "loan_status": "Pre-approved",
    "message": "Looking for a 2BHK apartment in Andheri"
  }'
```

---

## Testing

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Run tests
pytest -v

# With coverage
pytest --cov=app --cov-report=html

# Open coverage report
# Mac: open htmlcov/index.html
# Windows: start htmlcov/index.html
```

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - List users (admin)

### Leads
- `POST /api/leads` - Create lead with AI analysis
- `GET /api/leads` - List leads (paginated)
- `GET /api/leads/search` - Advanced search
- `GET /api/leads/export/csv` - Export CSV
- `GET /api/leads/{id}` - Get single lead
- `DELETE /api/leads/{id}` - Delete lead
- `POST /api/leads/{id}/followup` - Generate WhatsApp message

### Notes
- `GET /api/leads/{id}/notes` - List notes
- `POST /api/leads/{id}/notes` - Create note
- `PUT /api/leads/{id}/notes/{note_id}` - Update note
- `DELETE /api/leads/{id}/notes/{note_id}` - Delete note

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/conversion-funnel` - Conversion stats

### Activity Logs
- `GET /api/activity-logs` - List activity logs
- `GET /api/activity-logs/user/{id}` - User activity

**Full API docs:** http://localhost:8000/docs

---

## Common Issues & Solutions

### 1. Import Errors

```bash
# Install all dependencies
cd backend
pip install -r requirements.txt
```

### 2. Database Connection Error

```bash
# SQLite (default - no setup needed)
DATABASE_URL=sqlite:///./lead_engine.db

# PostgreSQL
# 1. Install PostgreSQL
# 2. Create database: createdb lead_engine
# 3. Update .env: DATABASE_URL=postgresql://user:pass@localhost:5432/lead_engine
```

### 3. CORS Errors

Add your frontend URL to `.env`:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. JWT Errors

Generate a new secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Add to `.env`:
```env
JWT_SECRET_KEY=<generated-secret>
```

### 5. Rate Limit Errors

Adjust in `.env`:
```env
RATE_LIMIT_PER_MINUTE=120
```

---

## Development Workflow

### Backend Changes

```bash
cd backend
source venv/bin/activate  # Activate venv
# Make changes to code
# Server auto-reloads with --reload flag
```

### Frontend Changes

```bash
cd frontend
# Make changes to code
# Vite hot-reloads automatically
```

### Run Tests After Changes

```bash
cd backend
pytest -v
# Or specific test file
pytest tests/test_leads.py -v
```

---

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
docker-compose logs -f backend  # Specific service

# Restart service
docker-compose restart backend

# Rebuild after code changes
docker-compose build backend
docker-compose up -d

# Execute commands in container
docker-compose exec backend bash
docker-compose exec backend python -c "print('Hello')"

# Check service status
docker-compose ps
```

---

## Deployment

See `docs/DEPLOYMENT.md` for production deployment guide.

**Quick production deployment:**

```bash
# 1. Configure .env for production
APP_ENV=production
DEBUG=false
DATABASE_URL=postgresql://...

# 2. Deploy
chmod +x scripts/deploy-prod.sh
./scripts/deploy-prod.sh
```

---

## Resources

- **API Documentation**: http://localhost:8000/docs
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Enhancements**: [ENHANCEMENTS.md](ENHANCEMENTS.md)
- **Main README**: [README.md](README.md)

---

## Getting Help

1. Check the error message and logs
2. Review API documentation at `/docs`
3. Check environment variables in `.env`
4. Run tests to verify setup
5. Review deployment guide for production issues

---

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Create admin user
3. ✅ Test API endpoints
4. ✅ Create some test leads
5. ✅ Explore dashboard and analytics
6. ✅ Review API documentation
7. ✅ Run tests
8. ✅ Start building your frontend integration

**Happy coding! 🎉**
