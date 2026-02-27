# Production Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- Valid Anthropic API key
- PostgreSQL database (can use Docker)
- SSL certificates (for HTTPS)
- Domain name configured

## Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone Repository

```bash
git clone <repository-url>
cd App2-Lead
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Required configurations:**

```env
# Application
APP_ENV=production
DEBUG=false

# Database
DATABASE_URL=postgresql://postgres:SECURE_PASSWORD@db:5432/lead_engine
DB_PASSWORD=SECURE_PASSWORD_HERE

# AI
ANTHROPIC_API_KEY=sk-ant-your-key-here

# JWT (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
JWT_SECRET_KEY=your-secure-jwt-secret-min-32-chars

# CORS (your production domains)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security
RATE_LIMIT_PER_MINUTE=60
```

### 4. Deploy with Docker

```bash
# Make deploy script executable
chmod +x scripts/deploy-prod.sh

# Run deployment
./scripts/deploy-prod.sh
```

### 5. Setup Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/lead-engine`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=10 nodelay;
    }

    # API documentation
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_set_header Host $host;
    }
}

# Rate limit zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/lead-engine /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

### 7. Create Admin User

```bash
# Access backend container
docker-compose exec backend bash

# Create admin user (you'll need to create a script for this)
python scripts/create_admin.py --email admin@yourdomain.com --password SECURE_PASSWORD
```

### 8. Setup Monitoring

#### Application Logs

```bash
# View logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

#### Health Checks

Set up monitoring for these endpoints:
- Backend: `https://yourdomain.com/health`
- Frontend: `https://yourdomain.com/health`

### 9. Backup Strategy

#### Database Backup

Create `/root/backup-db.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
mkdir -p $BACKUP_DIR

docker-compose exec -T db pg_dump -U postgres lead_engine | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /root/backup-db.sh >> /var/log/backup.log 2>&1
```

### 10. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (UFW)
- [ ] Set up fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Backup database regularly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Configure CORS properly

### 11. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 12. Monitoring & Maintenance

#### Docker Container Health

```bash
# Check container status
docker-compose ps

# View resource usage
docker stats

# Check logs
docker-compose logs --tail=100 -f
```

#### System Resources

```bash
# Disk usage
df -h

# Memory usage
free -m

# CPU usage
top
```

#### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
./scripts/deploy-prod.sh

# Or manually:
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check database connection
docker-compose exec backend python -c "from app.database import engine; print(engine.connect())"
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps db

# Test connection
docker-compose exec db psql -U postgres -d lead_engine -c "SELECT 1;"
```

### Performance Issues

1. Check Docker resource limits
2. Monitor database queries
3. Check API rate limits
4. Review application logs
5. Consider adding Redis caching

## Rollback

```bash
# Stop current containers
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose build --no-cache
docker-compose up -d

# Restore database from backup if needed
gunzip -c /backups/postgres/backup_<DATE>.sql.gz | docker-compose exec -T db psql -U postgres lead_engine
```

## Support

For issues:
1. Check application logs
2. Review Docker logs
3. Check database connectivity
4. Verify environment variables
5. Contact support team
