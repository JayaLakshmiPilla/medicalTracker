@echo off
echo 🏥 Setting up MediCare AI - Smart Medication Management System
echo ==============================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker is not installed. You'll need Docker for production deployment.
) else (
    echo ✅ Docker detected
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Copy environment file
if not exist .env (
    echo 📝 Creating environment file...
    copy env.example .env
    echo ⚠️  Please update .env file with your configuration
) else (
    echo ✅ Environment file already exists
)

REM Generate Prisma client
echo 🗄️  Generating Prisma client...
call npx prisma generate

REM Setup database
echo 🗄️  Setting up database...
call npx prisma db push

REM Setup Git hooks
echo 🔧 Setting up Git hooks...
call npm run prepare

REM Create uploads directory
if not exist uploads mkdir uploads

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update .env file with your configuration
echo 2. Run 'npm run dev' to start development server
echo 3. Run 'npm run db:studio' to open Prisma Studio
echo 4. Run 'docker-compose up' for production deployment
echo.
echo Available commands:
echo   npm run dev          - Start development server
echo   npm run build        - Build for production
echo   npm run start        - Start production server
echo   npm run test         - Run tests
echo   npm run db:studio    - Open Prisma Studio
echo   docker-compose up    - Start with Docker
echo.
pause



