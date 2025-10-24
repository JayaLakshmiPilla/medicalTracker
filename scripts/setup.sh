#!/bin/bash

# MediCare AI Setup Script
echo "🏥 Setting up MediCare AI - Smart Medication Management System"
echo "=============================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need Docker for production deployment."
else
    echo "✅ Docker $(docker --version) detected"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "⚠️  Please update .env file with your configuration"
else
    echo "✅ Environment file already exists"
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Setup database (if DATABASE_URL is configured)
if grep -q "DATABASE_URL=" .env && ! grep -q "DATABASE_URL=\"\"" .env; then
    echo "🗄️  Setting up database..."
    npx prisma db push
    echo "🌱 Seeding database..."
    npm run db:seed
else
    echo "⚠️  Please configure DATABASE_URL in .env file"
fi

# Setup Git hooks
echo "🔧 Setting up Git hooks..."
npm run prepare

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Run 'npm run dev' to start development server"
echo "3. Run 'npm run db:studio' to open Prisma Studio"
echo "4. Run 'docker-compose up' for production deployment"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run start        - Start production server"
echo "  npm run test         - Run tests"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  docker-compose up    - Start with Docker"
echo ""




