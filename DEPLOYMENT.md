# 🚀 MediCare AI Deployment Guide

This guide covers various deployment options for the MediCare AI application.

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis (optional)
- Docker (for containerized deployment)
- Domain name and SSL certificate (for production)

## 🐳 Docker Deployment (Recommended)

### Quick Start with Docker Compose

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd medicare-ai
   cp env.example .env
   ```

2. **Configure environment variables** in `.env`:
   ```env
   DATABASE_URL="postgresql://medicare_user:medicare_password@postgres:5432/medicare_ai?schema=public"
   REDIS_URL="redis://redis:6379"
   NEXTAUTH_SECRET="your-secret-key"
   # Add other required environment variables
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Setup database**:
   ```bash
   docker-compose exec app npx prisma migrate deploy
   docker-compose exec app npx prisma db seed
   ```

5. **Access the application**:
   - Application: http://localhost:3000
   - Prisma Studio: http://localhost:5555

### Production Docker Setup

1. **Create production environment file**:
   ```env
   NODE_ENV=production
   DATABASE_URL="postgresql://user:password@your-db-host:5432/medicare_ai"
   REDIS_URL="redis://your-redis-host:6379"
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="your-production-secret"
   SMTP_HOST="your-smtp-host"
   SMTP_USER="your-smtp-user"
   SMTP_PASSWORD="your-smtp-password"
   TWILIO_ACCOUNT_SID="your-twilio-sid"
   TWILIO_AUTH_TOKEN="your-twilio-token"
   OPENAI_API_KEY="your-openai-key"
   ```

2. **Build and deploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## ☁️ Cloud Deployment

### Vercel (Recommended for Next.js)

1. **Connect repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Database setup**:
   - Use Vercel Postgres or external PostgreSQL
   - Run migrations: `npx prisma migrate deploy`

### AWS Deployment

#### Using AWS App Runner

1. **Create Dockerfile** (already included)
2. **Push to ECR**:
   ```bash
   aws ecr create-repository --repository-name medicare-ai
   docker build -t medicare-ai .
   docker tag medicare-ai:latest <account>.dkr.ecr.<region>.amazonaws.com/medicare-ai:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/medicare-ai:latest
   ```

3. **Create App Runner service** with the ECR image
4. **Configure environment variables**
5. **Set up RDS PostgreSQL** and ElastiCache Redis

#### Using AWS ECS

1. **Create ECS cluster**
2. **Create task definition** with your container
3. **Create service** with load balancer
4. **Configure auto-scaling**

### Google Cloud Platform

1. **Use Cloud Run**:
   ```bash
   gcloud run deploy medicare-ai \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Set up Cloud SQL** for PostgreSQL
3. **Configure Memorystore** for Redis

### Azure Deployment

1. **Use Azure Container Instances** or **Azure App Service**
2. **Set up Azure Database for PostgreSQL**
3. **Configure Azure Cache for Redis**

## 🗄️ Database Setup

### PostgreSQL Configuration

1. **Create database**:
   ```sql
   CREATE DATABASE medicare_ai;
   CREATE USER medicare_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE medicare_ai TO medicare_user;
   ```

2. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed database** (optional):
   ```bash
   npx prisma db seed
   ```

### Redis Configuration

1. **Install Redis**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   
   # Docker
   docker run -d -p 6379:6379 redis:alpine
   ```

2. **Configure Redis**:
   ```conf
   # /etc/redis/redis.conf
   maxmemory 256mb
   maxmemory-policy allkeys-lru
   ```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Obtain SSL certificate** (Let's Encrypt recommended):
   ```bash
   certbot --nginx -d your-domain.com
   ```

2. **Configure Nginx** with SSL:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
   }
   ```

### Environment Security

1. **Use secrets management**:
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager
   - HashiCorp Vault

2. **Rotate secrets regularly**
3. **Use least privilege access**
4. **Enable audit logging**

## 📊 Monitoring and Logging

### Application Monitoring

1. **Set up Sentry** for error tracking:
   ```env
   SENTRY_DSN="your-sentry-dsn"
   ```

2. **Configure Winston logging**:
   ```typescript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
     ],
   });
   ```

### Database Monitoring

1. **Enable PostgreSQL logging**:
   ```sql
   ALTER SYSTEM SET log_statement = 'all';
   ALTER SYSTEM SET log_min_duration_statement = 1000;
   ```

2. **Set up database backups**:
   ```bash
   # Daily backup
   0 2 * * * pg_dump medicare_ai > backup_$(date +\%Y\%m\%d).sql
   ```

### Infrastructure Monitoring

1. **Use monitoring tools**:
   - Prometheus + Grafana
   - DataDog
   - New Relic
   - AWS CloudWatch

2. **Set up alerts** for:
   - High CPU usage
   - Memory usage
   - Database connections
   - Error rates

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to production
        run: |
          # Your deployment commands here
          echo "Deploying to production..."
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm run test

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/

deploy:
  stage: deploy
  script:
    - echo "Deploying to production..."
  only:
    - main
```

## 🚨 Troubleshooting

### Common Issues

1. **Database connection issues**:
   - Check DATABASE_URL format
   - Verify database is running
   - Check network connectivity

2. **Build failures**:
   - Clear node_modules and reinstall
   - Check Node.js version
   - Verify all dependencies

3. **Memory issues**:
   - Increase container memory
   - Optimize database queries
   - Enable Redis caching

### Performance Optimization

1. **Database optimization**:
   - Add indexes for frequently queried fields
   - Use connection pooling
   - Enable query caching

2. **Application optimization**:
   - Enable gzip compression
   - Use CDN for static assets
   - Implement caching strategies

3. **Monitoring**:
   - Set up performance monitoring
   - Monitor database performance
   - Track user metrics

## 📞 Support

For deployment issues:
1. Check the logs: `docker-compose logs app`
2. Verify environment variables
3. Test database connectivity
4. Check service status

## 🔄 Updates and Maintenance

### Regular Maintenance

1. **Update dependencies**:
   ```bash
   npm update
   npm audit fix
   ```

2. **Database maintenance**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Security updates**:
   - Update Docker images
   - Apply security patches
   - Rotate secrets

### Backup Strategy

1. **Database backups**:
   ```bash
   # Daily automated backup
   pg_dump medicare_ai > backup_$(date +%Y%m%d).sql
   ```

2. **Application backups**:
   - Version control
   - Container image backups
   - Configuration backups

---

**Happy Deploying! 🚀**



