#!/bin/bash
# Production deployment script using Docker Compose

set -e

echo "🚀 Deploying AI Real Estate Lead Conversion Engine - Production"
echo "================================================================"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file from .env.example and configure production settings"
    exit 1
fi

# Check required environment variables
echo "📋 Checking required environment variables..."
source .env

REQUIRED_VARS=("ANTHROPIC_API_KEY" "JWT_SECRET_KEY" "DB_PASSWORD")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '   - %s\n' "${MISSING_VARS[@]}"
    exit 1
fi

echo "✅ Environment variables check passed"

# Pull latest images
echo ""
echo "📥 Pulling latest Docker images..."
docker-compose pull

# Build images
echo ""
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose down

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🏥 Checking service health..."
docker-compose ps

# Run database migrations (if using Alembic)
echo ""
echo "📦 Running database migrations..."
docker-compose exec backend alembic upgrade head 2>/dev/null || echo "⚠️  No migrations to run or Alembic not configured"

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access the application at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "📊 Monitor logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"
