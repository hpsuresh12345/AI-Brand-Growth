# AI Real Estate Lead Conversion Engine

> Production-grade AI-powered lead management system for real estate with Claude AI integration.

## 🚀 Features

### Core Features
- ✅ **AI-Powered Lead Scoring** - Claude AI analyzes and scores leads automatically
- ✅ **Smart Categorization** - Hot, Warm, Cold lead classification
- ✅ **WhatsApp Integration** - AI-generated personalized follow-up messages
- ✅ **Conversion Analytics** - Real-time dashboard with pipeline metrics
- ✅ **No-Show Risk Prediction** - AI predicts likelihood of lead no-shows

### Production Features
- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access (Admin, Agent, Viewer)
- 📝 **Activity Logging** - Complete audit trail of all system activities
- 💬 **Notes & Comments** - Collaborative lead notes with importance flags
- 🔍 **Advanced Search** - Multi-filter search with sorting and pagination
- 📊 **CSV Export** - Export filtered leads to CSV
- ⚡ **Rate Limiting** - API rate limiting to prevent abuse
- 🔒 **Security Headers** - Production security best practices
- 🐳 **Docker Support** - Full containerization for easy deployment
- 📈 **Request Logging** - Structured logging for monitoring

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Production database
- **SQLAlchemy** - ORM with migrations
- **Anthropic Claude** - AI intelligence engine
- **JWT** - Secure authentication
- **Redis** - Caching layer

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool
- **Tailwind CSS 4** - Utility-first styling
- **Recharts** - Data visualization
- **React Router** - Client-side routing

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 16+ (or use Docker)
- Redis (optional, for caching)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd App2-Lead
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
# Edit .env with your settings

# Run migrations (if using Alembic)
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔑 Environment Variables

Key environment variables (see `.env.example` for full list):

```env
# Required
ANTHROPIC_API_KEY=your-api-key
JWT_SECRET_KEY=your-secret-key-32-chars-min
DATABASE_URL=postgresql://user:pass@localhost/dbname

# Optional
DEBUG=false
APP_ENV=production
RATE_LIMIT_PER_MINUTE=60
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

#### Leads
- `POST /api/leads` - Create and analyze lead
- `GET /api/leads` - List leads with pagination
- `GET /api/leads/search` - Advanced search
- `GET /api/leads/export/csv` - Export to CSV
- `GET /api/leads/{id}` - Get single lead
- `POST /api/leads/{id}/followup` - Generate WhatsApp message
- `POST /api/leads/{id}/analyze` - Re-analyze lead

#### Notes
- `GET /api/leads/{id}/notes` - List notes
- `POST /api/leads/{id}/notes` - Create note
- `PUT /api/leads/{id}/notes/{note_id}` - Update note
- `DELETE /api/leads/{id}/notes/{note_id}` - Delete note

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/conversion-funnel` - Conversion stats

#### Activity Logs
- `GET /api/activity-logs` - List activity logs with filters
- `GET /api/activity-logs/user/{id}` - User-specific logs

## 🎯 Usage

### Creating a Lead

1. Navigate to the Leads page
2. Fill in the lead form with contact details, budget, location, etc.
3. Click "Create Lead"
4. AI automatically analyzes and scores the lead
5. View AI insights, score breakdown, and recommended actions

### Searching Leads

Use the advanced search to filter leads by:
- Text search (name, location, phone)
- Category (Hot, Warm, Cold)
- Score range
- Budget range
- Property type
- Timeline
- Location

### Exporting Data

1. Apply any filters you want
2. Click "Export CSV"
3. Authenticated users can download filtered leads

### Managing Users (Admin)

Admins can:
- View all users
- Create new users with roles
- Update user permissions
- Deactivate accounts

## 🧪 Testing

```bash
cd backend
pytest                    # Run all tests
pytest --cov             # With coverage
pytest -v tests/         # Verbose output
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Setup

1. Set `APP_ENV=production` and `DEBUG=false`
2. Use strong JWT secret: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
3. Configure PostgreSQL with strong password
4. Set up HTTPS with reverse proxy (nginx/Caddy)
5. Configure CORS with your production domains

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🔒 Security Features

- JWT-based authentication with secure password hashing (bcrypt)
- Role-based access control (RBAC)
- Rate limiting to prevent API abuse
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Activity logging for audit trail
- CORS configuration
- SQL injection protection via SQLAlchemy ORM
- Input validation with Pydantic

## 📊 Monitoring

- Request logging with timing
- Activity audit trail
- Health check endpoints
- Error tracking and logging
- Rate limit monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check the API documentation
- Review the code examples

## 🎓 Architecture

```
App2-Lead/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── agents/         # AI agents (scoring, intelligence, etc.)
│   │   ├── dependencies/   # FastAPI dependencies (auth)
│   │   ├── middleware/     # Custom middleware (rate limiting, etc.)
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── config.py       # Configuration
│   │   ├── database.py     # Database setup
│   │   └── main.py         # App entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── services/      # API client
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml     # Docker orchestration
```

## 🔄 Roadmap

- [ ] Email notifications
- [ ] SMS integration
- [ ] Advanced reporting
- [ ] Lead assignment workflow
- [ ] Task management
- [ ] Calendar integration
- [ ] Multi-language support
- [ ] Mobile app
- [ ] WhatsApp Business API integration
- [ ] Advanced AI insights

## 💡 Tips

- Use the CSV export feature for regular backups
- Set up activity log monitoring for security
- Regularly review lead scores and adjust AI parameters
- Use notes feature for team collaboration
- Export analytics for monthly reports

---

Built with ❤️ using FastAPI, React, and Claude AI
