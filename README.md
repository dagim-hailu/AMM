# Appointment Management Module (AMM)

A full-stack appointment management system built with Hexagonal Architecture, featuring a public web form, admin dashboard, and backend API.

## Architecture

- **Frontend**: Next.js (TypeScript) with Tailwind CSS
  - `public-web`: Public appointment request form with QR code and CAPTCHA
  - `admin-dashboard`: Admin interface with real-time updates
- **Backend**: NestJS (TypeScript) with Hexagonal Architecture
  - Domain layer with entities and value objects
  - Application layer with use cases
  - Infrastructure layer with adapters
- **Database**: PostgreSQL with Drizzle ORM
- **Message Broker**: Redis for event publishing
- **Reverse Proxy**: Nginx for routing

## Features

### Public Web App (`:3000`)
- Mobile-optimized landing page with QR code
- Appointment request form with CAPTCHA protection
- Real-time form validation with Zod schemas
- Success confirmation with reference ID
- Responsive design with gradient backgrounds

### Admin Dashboard (`:3001`)
- Real-time appointment monitoring via WebSockets
- Filter, sort, and search appointments
- Confirm, reschedule, cancel appointments
- Audit trail and state transition tracking
- Ministry design system compliant UI

### Backend API (`:3002`)
- RESTful API with NestJS
- Hexagonal (Clean) Architecture
- PostgreSQL with Drizzle ORM
- Redis event publishing
- Business hours and holiday validation
- Full appointment state machine

## Docker Setup

The entire system can be run using Docker Compose:

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services
- **PostgreSQL**: `:5433` (exposed as 5433 to avoid conflicts)
- **Redis**: `:6379`
- **Backend API**: `:3002`
- **Public Web**: `:3000`
- **Admin Dashboard**: `:3001`
- **Nginx**: `:80` (optional)

## Development Setup

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Local Development

1. **Start infrastructure services:**
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   # Backend API
   cd apps/backend-api
   npm run start:dev

   # Public web app
   cd apps/public-web
   npm run dev

   # Admin dashboard
   cd apps/admin-dashboard
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

### Backend API (`.env`)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5433/amm_db
REDIS_URL=redis://localhost:6379
PORT=3002
NODE_ENV=development
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Frontend Apps
Public web and admin dashboard use environment variables prefixed with `NEXT_PUBLIC_` for client-side configuration.

## Database Schema

### Core Tables
- `appointments`: Appointment requests with state management
- `audit_logs`: State transition history
- `business_hours`: Configurable business hours
- `holidays`: Holiday calendar for validation

## Hexagonal Architecture Layers

### Domain Layer
- **Entities**: `Appointment`, `RequestorDetails`
- **Value Objects**: State machine, business rules
- **Ports**: `IAppointmentRepository`, `IEventPublisher`

### Application Layer
- **Use Cases**: `CreateAppointmentUseCase`, `ConfirmAppointmentUseCase`, etc.
- **Services**: Business logic orchestration

### Infrastructure Layer
- **Adapters**: `DrizzleAppointmentRepository`, `RedisEventPublisher`
- **Controllers**: REST endpoints
- **Database**: PostgreSQL with Drizzle

## Testing

```bash
# Run backend tests
cd apps/backend-api
npm test

# Run with coverage
npm run test:cov
```

## API Endpoints

### Appointments
- `GET /appointments` - List all appointments
- `POST /appointments` - Create new appointment
- `PUT /appointments/:id/confirm` - Confirm appointment
- `PUT /appointments/:id/reschedule` - Reschedule appointment
- `PUT /appointments/:id/cancel` - Cancel appointment

### Events
- WebSocket events for real-time updates
- Redis Pub/Sub for system events

## Deployment

### Production Docker
```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3 --scale public-web=2
```

### Kubernetes (Optional)
See `k8s/` directory for Kubernetes manifests.

## License

Proprietary - Ministry of Agriculture Internal Use