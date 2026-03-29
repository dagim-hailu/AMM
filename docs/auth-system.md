# Authentication & Authorization System for AMM

A comprehensive, reusable authentication and role-based access control (RBAC) module for the Appointment Management System (AMM) built for the Ministry of Agriculture.

## Overview

This system provides a standalone, reusable authentication service with RBAC that can be plugged into multiple applications (AMM admin dashboard, planning applications, meeting applications, etc.) without modification.

## Architecture

### 1. Database Schema (`packages/database/src/schema.ts`)

The following tables were added to support authentication:

- **`users`**: Stores user credentials and basic information
- **`roles`**: Defines roles with permissions (JSONB field for flexible permissions)
- **`applications`**: Tracks different applications in the ecosystem
- **`user_applications`**: Junction table for user-application-role assignments
- **`refresh_tokens`**: Stores refresh tokens for session management

### 2. Package Structure

```
packages/auth/
├── src/
│   ├── domain/              # Domain layer (entities, ports, errors)
│   ├── application/         # Use cases and DTOs
│   ├── infrastructure/      # Implementations (database, security)
│   └── presentation/        # NestJS controllers and modules
└── index.ts                 # Public API exports

packages/auth-ui/
├── components/              # Reusable React components
└── index.ts                # UI package exports
```

### 3. Key Features

- **Registration**: Secure user registration with role assignment
- **Login/Logout**: JWT-based authentication with refresh tokens
- **Role-Based Access Control**: Flexible permission system
- **Token Validation**: Backend token validation endpoint
- **UI Components**: Reusable React components for auth flows
- **Multi-Application Support**: Single registration, multiple applications

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=your-secure-refresh-secret-key-change-in-production

# Database
DATABASE_URL=postgres://user:password@localhost:5432/amm_db
```

### 2. Database Migrations

Run Drizzle migrations to create auth tables:

```bash
cd packages/database
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 3. Seed Initial Roles

Run the seed script to create default roles:

```bash
cd packages/database
npm run seed
```

Default roles created:
- `admin`: Full system access
- `manager`: Can manage appointments and users
- `staff`: Can view and manage appointments
- `viewer`: Read-only access

### 4. Integration with Backend API

The auth module is already integrated into `apps/backend-api/src/app.module.ts`. The following endpoints are available:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout
- `POST /api/auth/validate` - Token validation
- `POST /api/auth/refresh` - Refresh token (TODO)

### 5. Frontend Integration

#### Admin Dashboard

The admin dashboard (`apps/admin-dashboard`) has been updated with:

1. **Auth Hook**: `src/lib/auth.ts` - React hook for authentication
2. **Login Page**: `src/app/login/page.tsx` - Login interface
3. **Route Protection**: Middleware to protect routes (TODO)

#### Using the Auth Hook

```typescript
import { useAuth } from '@/lib/auth';

function MyComponent() {
  const { user, login, logout, isAuthenticated, hasRole } = useAuth();
  
  // Check authentication
  if (!isAuthenticated()) {
    // Redirect to login
  }
  
  // Check role
  if (!hasRole(['admin', 'manager'])) {
    // Show unauthorized
  }
}
```

### 6. Adding Auth to New Applications

To add authentication to a new application:

1. **Install the auth package** (already available in workspace)
2. **Import AuthModule** in your NestJS application module
3. **Use auth UI components** in your React application
4. **Protect routes** using the auth hook

Example for a new application:

```typescript
// backend (NestJS)
import { AuthModule } from '@amm/auth';

@Module({
  imports: [AuthModule],
  // ... rest of module
})
export class MyAppModule {}

// frontend (React)
import { useAuth } from '@/lib/auth';
import { LoginForm } from '@amm/auth-ui';
```

## Role Definitions

Roles are stored in the `roles` table with a `permissions` JSONB field. The system supports:

### 1. Role Structure
```json
{
  "permissions": {
    "appointments": ["create", "read", "update", "delete"],
    "users": ["read"],
    "settings": ["read"]
  }
}
```

### 2. Default Roles
- **admin**: All permissions across all applications
- **manager**: Appointment management, user viewing
- **staff**: Appointment management only
- **viewer**: Read-only access

### 3. Adding New Permissions
Permissions are flexible and can be extended without schema changes:

```typescript
// Add new permission type
const newPermissions = {
  ...existingPermissions,
  "reports": ["generate", "export"]
};
```

## Security Features

1. **Password Hashing**: BCrypt with 12 rounds
2. **JWT Tokens**: Short-lived access tokens (15 min) + refresh tokens (7 days)
3. **Refresh Token Rotation**: Stored server-side with expiration
4. **Input Validation**: Zod schemas for all endpoints
5. **SQL Injection Protection**: Drizzle ORM with parameterized queries
6. **CORS Configuration**: Configured for secure cross-origin requests

## Testing

### 1. Database Testing
```bash
cd packages/database
npm test
```

### 2. Backend Testing
```bash
cd apps/backend-api
npm run test:e2e
```

### 3. Manual Testing Endpoints

```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@agriculture.gov.et", "password": "SecurePass123", "fullName": "Admin User", "role": "admin"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@agriculture.gov.et", "password": "SecurePass123"}'

# Validate token
curl -X POST http://localhost:8080/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "your-jwt-token"}'
```

## Future Extensions

1. **Email Verification**: Add email confirmation for registration
2. **Password Reset**: Self-service password reset
3. **Two-Factor Authentication**: Add 2FA support
4. **Audit Logging**: Track authentication events
5. **Rate Limiting**: Prevent brute force attacks
6. **Social Login**: OAuth integration with government services

## Troubleshooting

### Common Issues

1. **"Cannot find module '@amm/auth'"**
   - Ensure packages are built: `npm run build`
   - Check TypeScript paths configuration

2. **Database connection errors**
   - Verify DATABASE_URL environment variable
   - Ensure PostgreSQL is running

3. **JWT validation failures**
   - Check JWT_SECRET environment variable
   - Ensure tokens are being sent in Authorization header

4. **Role permission issues**
   - Verify user has correct role assignment
   - Check permissions JSON structure in database

## Support

For issues or questions:
- System Administrator: admin@agriculture.gov.et
- Development Team: dev@agriculture.gov.et

---

**Ministry of Agriculture - Digital Services Division**