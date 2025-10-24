# 🚀 Deploy MediCare AI on Render

This guide will help you deploy your MediCare AI application on Render without installing anything locally.

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Your code pushed to a GitHub repository

## 🚀 Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

1. **Create a new repository** on GitHub
2. **Push your code** to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MediCare AI application"
   git branch -M main
   git remote add origin https://github.com/yourusername/medicare-ai.git
   git push -u origin main
   ```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### Step 3: Deploy the Application

#### Option A: Using render.yaml (Recommended)

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Render will automatically detect the render.yaml file**
4. **Click "Apply"** to deploy

#### Option B: Manual Configuration

1. **Create a new Web Service**:
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

2. **Add Environment Variables**:
   ```
   NODE_ENV=production
   NEXTAUTH_SECRET=your-secret-key-here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=+1234567890
   OPENAI_API_KEY=your-openai-key
   GOOGLE_VISION_API_KEY=your-google-vision-key
   FDA_API_KEY=your-fda-key
   DRUG_INTERACTION_API_KEY=your-drug-interaction-key
   ```

3. **Create PostgreSQL Database**:
   - Go to "New +" → "PostgreSQL"
   - Name: `medicare-db`
   - Plan: Free tier
   - Copy the connection string

4. **Create Redis Cache** (Optional):
   - Go to "New +" → "Redis"
   - Name: `medicare-redis`
   - Plan: Free tier

5. **Update DATABASE_URL** in your web service environment variables

### Step 4: Configure Services

#### Database Setup
1. **Get your database URL** from the PostgreSQL service
2. **Add it to your web service** environment variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

#### Redis Setup (Optional)
1. **Get your Redis URL** from the Redis service
2. **Add it to your web service** environment variables:
   ```
   REDIS_URL=redis://username:password@host:port
   ```

### Step 5: Deploy and Test

1. **Click "Deploy"** on your web service
2. **Wait for the build to complete** (5-10 minutes)
3. **Check the logs** for any errors
4. **Visit your application URL**

## 🔧 Environment Variables Setup

### Required Variables

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=your-secret-key-here

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@your-domain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# AI Services
OPENAI_API_KEY=your-openai-api-key
GOOGLE_VISION_API_KEY=your-google-vision-api-key

# External APIs
FDA_API_KEY=your-fda-api-key
DRUG_INTERACTION_API_KEY=your-drug-interaction-api-key

# Cache (Optional)
REDIS_URL=redis://username:password@host:port
```

### Optional Variables

```env
# Monitoring
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## 🗄️ Database Migration

After deployment, you may need to run database migrations:

1. **Go to your web service dashboard**
2. **Click "Shell"** to open a terminal
3. **Run the migration command**:
   ```bash
   npx prisma migrate deploy
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check the build logs
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check if database service is running
   - Ensure database credentials are correct

3. **Environment Variables**:
   - Double-check all required variables are set
   - Verify API keys are valid
   - Check for typos in variable names

4. **Application Crashes**:
   - Check the application logs
   - Verify all environment variables
   - Test database connectivity

### Debugging Steps

1. **Check Build Logs**:
   - Go to your service dashboard
   - Click on "Logs" tab
   - Look for error messages

2. **Test Database Connection**:
   - Use the Shell feature
   - Run: `npx prisma db push`

3. **Verify Environment Variables**:
   - Go to "Environment" tab
   - Ensure all variables are set correctly

## 📊 Monitoring

### Render Dashboard
- **Service Status**: Check if service is running
- **Logs**: View application and build logs
- **Metrics**: Monitor CPU, memory, and response times

### Health Checks
- **Application Health**: `/api/health`
- **Database Health**: Check database service status
- **External Services**: Monitor API integrations

## 💰 Cost Optimization

### Free Tier Limits
- **Web Service**: 750 hours/month
- **Database**: 1GB storage
- **Redis**: 25MB memory

### Upgrade Options
- **Starter Plan**: $7/month for web service
- **Database**: $7/month for 1GB
- **Redis**: $7/month for 25MB

## 🔄 Updates and Maintenance

### Automatic Deployments
- **GitHub Integration**: Auto-deploy on push to main branch
- **Manual Deployments**: Deploy from dashboard
- **Rollback**: Revert to previous deployment

### Database Backups
- **Automatic Backups**: Render handles this
- **Manual Backups**: Use pg_dump
- **Restore**: From Render dashboard

## 🎉 Success!

Once deployed, your application will be available at:
- **URL**: `https://your-app-name.onrender.com`
- **Admin**: Render dashboard
- **Database**: PostgreSQL service
- **Cache**: Redis service (if configured)

## 📞 Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Community**: Render Discord
- **Support**: Render support team

---

**Your MediCare AI application is now live! 🚀**
