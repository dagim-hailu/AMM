# Appointment Management Module (AMM) - System Documentation

## 📑 Overview
The Appointment Management Module (AMM) is a robust, scalable, and modern solution designed for the Ministry to manage official appointment requests from the public. It features a QR-driven public interface and a high-end administrative dashboard with real-time analytics.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Monorepo** | Turborepo |
| **Backend Framework** | NestJS (Node.js) |
| **Frontend Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database ORM** | Drizzle ORM |
| **Database** | PostgreSQL |
| **Eventing / Cache** | Redis |
| **Styling** | Tailwind CSS / Vanilla CSS Variables |

---

## 🏗️ Architecture: Hexagonal (Ports & Adapters)

The system follows **Hexagonal Architecture** to ensure the core business logic is decoupled from external infrastructure (DB, API, etc.).

### 1. Domain Layer
- **Entities**: `Appointment` (The core business object with state transitions).
- **Enums**: `AppointmentState` (PENDING, CONFIRMED, RESCHEDULED, etc.).
- **Ports**: Interfaces like `IAppointmentRepository` and `IEventPublisher`.

### 2. Application Layer
- **Use Cases**:
    - `CreateAppointmentUseCase`: Handles new public requests.
    - `ConfirmAppointmentUseCase`: Direct approval by staff.
    - `RescheduleAppointmentUseCase`: Modifies existing slots with notes and notifications.
    - `GetAppointmentsUseCase`: Advanced filtering and proximity sorting.

### 3. Infrastructure Layer
- **Persistence**: `DrizzleAppointmentRepository` (PostgreSQL implementation).
- **Messaging**: `RedisEventPublisher` (Mocked for notification hooks).

---

## 🚀 Key Features

### 📱 Public View (QR-First)
- **Glassmorphism Design**: High-end visual aesthetic for public trust.
- **QR Entry**: Instant mobile access to the appointment form via scanning.
- **Validation**: Strict validation for contact details and inquiry descriptions.

### 📊 Admin Dashboard
- **Dark/Light Mode**: Premium theme switching with smooth transitions.
- **Proximity Sorting**: Today's appointments are automatically sorted by closeness to the current time.
- **Date-Based Boards**: "Today", "Tomorrow", "Upcoming", and "History" tabs for efficient workflow.
- **Rescheduling Engine**:
    - Optional administrative notes stored per rescheduling.
    - Conditional email notification toggle (Event-driven).
- **Advanced Pagination & Search**: Real-time filtering across thousands of records.

---

## 📡 API Reference

### Appointments
- `GET /appointments`: List appointments with search, state, and view filters.
- `POST /appointments`: Submit a new request from the public.
- `PUT /appointments/:id/confirm`: Confirm an appointment slot.
- `PUT /appointments/:id/reschedule`: Modify a slot with optional notes and email flags.

---

## 🗄️ Database Schema

### `appointments` Table
- `id`: UUID (Primary Key)
- `requestor_name`: String
- `email`: String
- `mobile`: String
- `state`: Enum (REQUESTED, CONFIRMED, RESCHEDULED, COMPLETED, CANCELLED)
- `suggested_time`: Timestamp
- `confirmed_time`: Timestamp
- `reschedule_notes`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

---

## 🛠️ Getting Started

### Prerequisites
- Node.js v18+
- Docker (for Postgres and Redis)

### Installation
```bash
npm install
npm run dev
```

### Environment Variables
- `DATABASE_URL`: Connection string for PostgreSQL.
- `REDIS_URL`: Connection string for Redis.
- `PORT`: Backend port (Default: 3002).
