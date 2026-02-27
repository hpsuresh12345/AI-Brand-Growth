# 📋 Production Deployment Checklist

Use this checklist to ensure your application is production-ready.

## Pre-Deployment

### Environment Setup
- [ ] `.env` file created from `.env.example`
- [ ] `ANTHROPIC_API_KEY` configured
- [ ] `JWT_SECRET_KEY` generated (32+ chars)
- [ ] `DATABASE_URL` configured for PostgreSQL
- [ ] `DB_PASSWORD` set to strong password
- [ ] `CORS_ORIGINS` configured with production domains
- [ ] `APP_ENV` set to `production`
- [ ] `DEBUG` set to `false`

### Security
- [ ] All default passwords changed
- [ ] JWT secret is strong and unique
- [ ] Database password is strong
- [ ] Environment variables not committed to git
- [ ] `.gitignore` configured properly
- [ ] Security headers enabled (automatic)
- [ ] Rate limiting configured
- [ ] CORS configured for production domains only

### Database
- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Database user created with proper permissions
- [ ] Backup strategy defined
- [ ] Database migrations tested
- [ ] Connection pooling configured

### Testing
- [ ] All tests passing (`pytest -v`)
- [ ] Test coverage > 80%
- [ ] Integration tests completed
- [ ] End-to-end tests completed
- [ ] Load testing performed (optional)

## Deployment

### Infrastructure
- [ ] Server provisioned (cloud or on-premise)
- [ ] Docker installed on server
- [ ] Docker Compose installed
- [ ] SSL certificates obtained (Let's Encrypt)
- [ ] Domain name configured
- [ ] DNS records updated
- [ ] Firewall configured (ports 80, 443, 22)
- [ ] SSH key-based authentication enabled

### Application Deployment
- [ ] Code pushed to production branch
- [ ] `.env` file copied to server
- [ ] Docker images built
- [ ] Containers started successfully
- [ ] Health checks passing
- [ ] Database migrations applied
- [ ] Admin user created

### Reverse Proxy (Nginx)
- [ ] Nginx installed and configured
- [ ] SSL certificates installed
- [ ] HTTPS redirect configured
- [ ] Reverse proxy configured for backend
- [ ] Reverse proxy configured for frontend
- [ ] Rate limiting configured
- [ ] Gzip compression enabled
- [ ] Static file caching configured

## Post-Deployment

### Verification
- [ ] Frontend accessible via HTTPS
- [ ] Backend API accessible via HTTPS
- [ ] API documentation accessible (`/docs`)
- [ ] Health check endpoints working
- [ ] Login functionality working
- [ ] Lead creation working
- [ ] AI analysis functioning
- [ ] CSV export working
- [ ] No console errors
- [ ] No network errors

### Monitoring
- [ ] Application logs accessible
- [ ] Error tracking configured
- [ ] Uptime monitoring set up
- [ ] Performance monitoring configured
- [ ] Database monitoring set up
- [ ] Disk space monitoring configured
- [ ] SSL certificate expiry monitoring

### Backup & Recovery
- [ ] Database backup script created
- [ ] Backup schedule configured (cron)
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Rollback procedure tested

### Documentation
- [ ] Deployment guide updated
- [ ] API documentation reviewed
- [ ] Admin documentation created
- [ ] User guide created (optional)
- [ ] Troubleshooting guide updated

### Security Hardening
- [ ] Fail2ban installed and configured
- [ ] UFW firewall enabled
- [ ] SSH port changed (optional)
- [ ] Root login disabled
- [ ] Automatic security updates enabled
- [ ] Docker daemon secured
- [ ] Secrets management reviewed
- [ ] Rate limiting tested
- [ ] API authentication tested

### Performance
- [ ] Application load tested
- [ ] Database queries optimized
- [ ] Caching configured (Redis)
- [ ] CDN configured for static assets (optional)
- [ ] Image optimization configured
- [ ] Response times acceptable (<500ms)

## User Management

### Initial Users
- [ ] Admin account created
- [ ] Test user accounts created
- [ ] Default passwords changed
- [ ] User roles verified
- [ ] Password reset flow tested

## Operations

### Maintenance
- [ ] Server timezone configured
- [ ] Log rotation configured
- [ ] Disk cleanup scheduled
- [ ] Database maintenance scheduled
- [ ] Backup retention policy defined

### Communication
- [ ] Team notified of deployment
- [ ] Users notified (if applicable)
- [ ] Documentation shared
- [ ] Support channels configured
- [ ] Incident response plan created

## Optional Enhancements

### Email & Notifications
- [ ] Email service configured (SendGrid/SES)
- [ ] Email templates created
- [ ] Notification system tested
- [ ] Alert thresholds configured

### Analytics
- [ ] Google Analytics configured (optional)
- [ ] Application analytics configured
- [ ] User behavior tracking (optional)

### Additional Services
- [ ] Redis cache configured
- [ ] CDN configured
- [ ] Object storage configured (S3, etc.)
- [ ] Message queue configured (optional)

## Sign-Off

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

**Production URL:** _______________

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

## Quick Reference

### Critical Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Backup database
docker-compose exec -T db pg_dump -U postgres lead_engine | gzip > backup.sql.gz

# Restore database
gunzip -c backup.sql.gz | docker-compose exec -T db psql -U postgres lead_engine

# Check disk space
df -h

# Check memory
free -m

# Check SSL certificate
certbot certificates
```

### Emergency Contacts

- **DevOps Lead:** _______________
- **Backend Lead:** _______________
- **Database Admin:** _______________
- **Security Lead:** _______________

### Rollback Procedure

1. Stop current containers: `docker-compose down`
2. Checkout previous version: `git checkout <previous-commit>`
3. Rebuild: `docker-compose build --no-cache`
4. Start: `docker-compose up -d`
5. Restore database if needed
6. Verify functionality

---

**Remember:** Always test in staging before deploying to production!
