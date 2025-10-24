# 🏥 MediCare AI - Smart Medication Management System

A comprehensive medication management application with AI-powered features including camera identification, smart scheduling, adherence tracking, and family notifications.

## ✨ Features

### 🎯 Core Features
- **Personalized Medication Scheduler** - Smart scheduling with AI-powered time suggestions
- **Smart Notifications & Alerts** - Multi-channel notifications (push, email, SMS)
- **Medicine Identification via Camera** - OCR and barcode scanning with AI analysis
- **Adherence Tracking & Reports** - Detailed analytics with charts and insights
- **Family & Caregiver Notifications** - Emergency alerts and communication
- **Medication Chatbot** - AI-powered medication guidance
- **Voice Assistant** - Speech recognition for medication management
- **E-Prescription & Doctor Connectivity** - Healthcare provider integration
- **Emergency SOS** - One-touch emergency contacts
- **Drug Interaction Warnings** - Real-time interaction checking

### 🚀 Technical Features
- **Next.js 14** with TypeScript
- **Prisma ORM** with PostgreSQL
- **Real-time notifications** with Web APIs
- **AI/ML integration** with OpenAI and Google Vision
- **Multi-channel communication** (Email, SMS, Push)
- **Responsive design** with Tailwind CSS
- **Docker containerization** for deployment

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis (optional, for caching)
- Docker (for production deployment)

### Installation

#### Option 1: Automated Setup
```bash
# Linux/Mac
./scripts/setup.sh

# Windows
scripts\setup.bat
```

#### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp env.example .env

# 3. Configure your environment variables in .env
# Update DATABASE_URL, API keys, etc.

# 4. Generate Prisma client
npx prisma generate

# 5. Setup database
npx prisma db push

# 6. Seed database (optional)
npm run db:seed

# 7. Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/medicare_ai?schema=public"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# AI/ML Services
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_VISION_API_KEY="your-google-vision-api-key"

# External APIs
FDA_API_KEY="your-fda-api-key"
DRUG_INTERACTION_API_KEY="your-drug-interaction-api-key"
```

### Database Setup

1. **Install PostgreSQL** (if not using Docker)
2. **Create database**:
   ```sql
   CREATE DATABASE medicare_ai;
   ```
3. **Run migrations**:
   ```bash
   npx prisma migrate dev
   ```
4. **Seed database** (optional):
   ```bash
   npm run db:seed
   ```

## 🚀 Deployment

### Docker Deployment (Recommended)

1. **Build and start services**:
   ```bash
   docker-compose up -d
   ```

2. **Access the application**:
   - Application: http://localhost:3000
   - Prisma Studio: http://localhost:5555

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm run start
   ```

### Cloud Deployment

#### Vercel (Recommended for Next.js)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### AWS/GCP/Azure
1. Use Docker containers
2. Set up managed PostgreSQL and Redis
3. Configure load balancer and SSL certificates

## 📊 Database Schema

The application uses the following main entities:

- **Users** - Patient information
- **Medications** - Medication details and schedules
- **Notifications** - Alert and reminder system
- **Caregivers** - Family and caregiver contacts
- **AdherenceEvents** - Medication adherence tracking
- **Prescriptions** - Doctor prescriptions
- **EmergencyContacts** - Emergency contact information
- **ScanHistory** - Camera identification history

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Medications
- `GET /api/medications` - Get user medications
- `POST /api/medications` - Create medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Adherence
- `GET /api/adherence` - Get adherence data
- `POST /api/adherence` - Log adherence event

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id` - Update notification

### Camera Identification
- `POST /api/identify` - Identify medication from image

### Caregiver Notifications
- `POST /api/caregiver/notify` - Send notification to caregiver

## 🔒 Security

- **Rate limiting** on API endpoints
- **Input validation** with Zod schemas
- **SQL injection protection** with Prisma ORM
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **JWT tokens** for authentication
- **Password hashing** with bcrypt

## 📈 Monitoring

- **Winston** for logging
- **Sentry** for error tracking
- **Health check** endpoints
- **Performance monitoring**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Integration with more healthcare providers
- [ ] Multi-language support
- [ ] Offline functionality
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for better healthcare management**




