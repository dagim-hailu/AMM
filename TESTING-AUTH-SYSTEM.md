# AMM Authentication System - Complete Testing Walkthrough

This document provides a step-by-step guide to test the complete authentication and authorization system for the Ministry of Agriculture Appointment Management System (AMM).

## Prerequisites

### 1. Environment Setup
```bash
# Set required environment variables
export DATABASE_URL="postgres://postgres:password@localhost:5433/amm_db"
export JWT_SECRET="your-secure-jwt-secret-change-in-production"
export JWT_REFRESH_SECRET="your-secure-refresh-secret-change-in-production"

# Or create a .env file in the root directory
cat > .env << EOF
DATABASE_URL="postgres://postgres:password@localhost:5433/amm_db"
JWT_SECRET="your-secure-jwt-secret-change-in-production"
JWT_REFRESH_SECRET="your-secure-refresh-secret-change-in-production"
EOF
```

### 2. Database Requirements
- PostgreSQL running locally (or adjust DATABASE_URL)
- Default credentials: `postgres:password@localhost:5433/amm_db`
- If using Docker, you can start PostgreSQL with:
  ```bash
  docker run -d \
    --name amm-postgres \
    -e POSTGRES_PASSWORD=password \
    -e POSTGRES_DB=amm_db \
    -p 5433:5432 \
    postgres:16
  ```

## Step 1: Build the System

```bash
# From the project root (/home/dhz/Daggim/Projects/K/AMM)
npm run build

# If build fails due to missing dependencies, run:
npm install
```

The build should complete successfully for all packages:
- `@amm/auth` - Authentication backend package
- `@amm/auth-ui` - Authentication UI components
- `@amm/database` - Database schema and migrations
- `backend-api` - NestJS API with auth endpoints
- `admin-dashboard` - Next.js frontend with protected routes

## Step 2: Database Setup

```bash
# Navigate to database package
cd packages/database

# Run database migrations
npx drizzle-kit migrate

# Seed initial roles (admin, manager, staff, viewer)
npm run seed
```

Verify the database tables were created:
```bash
# Connect to PostgreSQL and list tables
psql "postgres://postgres:password@localhost:5433/amm_db" -c "\dt"
```

Expected tables:
- `users` - User credentials and information
- `roles` - Role definitions with permissions
- `applications` - Application registry
- `user_applications` - User-application-role assignments
- `refresh_tokens` - Refresh token storage
- `appointments` - Existing appointment data
- `audit_logs` - Audit trail

## Step 3: Start Services

### Start Backend API (Port 8080)
```bash
cd apps/backend-api
npm run dev &
```

### Start Admin Dashboard (Port 3000)
```bash
cd apps/admin-dashboard
npm run dev &
```

### Verify Services are Running
```bash
# Check backend API health
curl http://localhost:8080/api/health 2>/dev/null || echo "Backend not ready"

# Check admin dashboard
curl -I http://localhost:3000 2>/dev/null | head -1
```

## Step 4: Test Authentication Endpoints

### 4.1 Register a New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@agriculture.gov.et",
    "password": "SecurePass123",
    "fullName": "System Administrator",
    "role": "admin"
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "admin@agriculture.gov.et",
      "fullName": "System Administrator",
      "role": "admin",
      "isActive": true
    },
    "accessToken": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  }
}
```

### 4.2 Login with Credentials
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@agriculture.gov.et",
    "password": "SecurePass123"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "admin@agriculture.gov.et",
      "fullName": "System Administrator",
      "role": "admin",
      "isActive": true
    },
    "accessToken": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  }
}
```

### 4.3 Validate Token
```bash
# Replace ACCESS_TOKEN with actual token from login response
curl -X POST http://localhost:8080/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "ACCESS_TOKEN_HERE"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "uuid-here",
      "email": "admin@agriculture.gov.et",
      "role": "admin"
    }
  }
}
```

### 4.4 Logout
```bash
# Replace REFRESH_TOKEN with actual refresh token
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN_HERE"
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Step 5: Test Frontend Authentication Flow

### 5.1 Access Admin Dashboard
1. Open browser and navigate to: `http://localhost:3000`
2. **Expected Behavior**: You should be redirected to `/login` page
3. Verify the login page displays Ministry of Agriculture branding
4. Check that the form has proper validation (email format, required fields)

### 5.2 Test Registration
1. Navigate to: `http://localhost:3000/register`
2. Fill out the registration form:
   - Full Name: `Test User`
   - Email: `test.user@agriculture.gov.et`
   - Password: `TestPass123`
   - Role: `staff`
3. Click "Create Account"
4. **Expected Behavior**: Redirect to login page with success message

### 5.3 Test Login
1. On login page (`http://localhost:3000/login`):
   - Email: `test.user@agriculture.gov.et`
   - Password: `TestPass123`
2. Click "Sign In"
3. **Expected Behavior**: 
   - Redirect to `/dashboard` or main admin page
   - Auth state should be preserved
   - User menu should show logged-in status

### 5.4 Test Route Protection
1. Try accessing protected routes without login:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/appointments`
2. **Expected Behavior**: Redirect to `/login` with redirect parameter

### 5.5 Test Logout
1. While logged in, find and click logout button
2. **Expected Behavior**:
   - Redirect to login page
   - Auth cookies cleared
   - Protected routes become inaccessible

## Step 6: Test Role-Based Access Control (RBAC)

### 6.1 Create Test Users with Different Roles
```bash
# Register a manager user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@agriculture.gov.et",
    "password": "ManagerPass123",
    "fullName": "Department Manager",
    "role": "manager"
  }'

# Register a staff user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@agriculture.gov.et",
    "password": "StaffPass123",
    "fullName": "Support Staff",
    "role": "staff"
  }'

# Register a viewer user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viewer@agriculture.gov.et",
    "password": "ViewerPass123",
    "fullName": "Read-Only Viewer",
    "role": "viewer"
  }'
```

### 6.2 Test Permission Levels
1. **Admin Role**: Should have access to all features
2. **Manager Role**: Should manage appointments and view users
3. **Staff Role**: Should manage appointments only
4. **Viewer Role**: Should have read-only access

### 6.3 Test Permission Checks in Frontend
```javascript
// Example of using the auth hook
import { useAuth } from '@/lib/auth';

function MyComponent() {
  const { user, hasRole } = useAuth();
  
  // Check if user has specific role
  if (!hasRole(['admin', 'manager'])) {
    return <div>Access Denied</div>;
  }
  
  // Show admin-only features
  return <div>Admin Dashboard Content</div>;
}
```

## Step 7: Test Security Features

### 7.1 Password Security
- Test with weak password (should fail validation)
- Test password hashing (verify passwords are not stored in plain text)
- Test password complexity requirements

### 7.2 Token Security
- Verify JWT tokens expire properly
- Test refresh token rotation
- Verify tokens cannot be tampered with

### 7.3 Input Validation
- Test SQL injection attempts (should be blocked by Drizzle ORM)
- Test XSS attempts (should be sanitized by React)
- Test malformed JSON payloads

## Step 8: Test Edge Cases

### 8.1 Invalid Credentials
```bash
# Wrong password
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@agriculture.gov.et",
    "password": "WrongPassword"
  }'
```
**Expected**: 401 Unauthorized with appropriate error message

### 8.2 Duplicate Registration
```bash
# Try registering same email twice
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@agriculture.gov.et",
    "password": "AnotherPassword123",
    "fullName": "Duplicate User",
    "role": "admin"
  }'
```
**Expected**: 409 Conflict with "User already exists" error

### 8.3 Expired Token
1. Set JWT token to expire quickly (for testing)
2. Try accessing protected endpoint with expired token
3. **Expected**: 401 Unauthorized, should prompt for re-authentication

### 8.4 Invalid Token Format
```bash
curl -X POST http://localhost:8080/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "invalid-token-format"
  }'
```
**Expected**: 400 Bad Request with validation error

## Step 9: Integration Testing

### 9.1 Test with Existing Appointment API
```bash
# Get appointments (requires authentication)
curl -X GET http://localhost:8080/api/appointments \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"

# Create appointment (requires authentication)
curl -X POST http://localhost:8080/api/appointments \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "requestorName": "Test User",
    "organization": "Test Org",
    "country": "Ethiopia",
    "city": "Addis Ababa",
    "issueDescription": "Test appointment",
    "mobile": "+251911234567",
    "email": "test@example.com",
    "suggestedTime": "2024-12-01T10:00:00Z"
  }'
```

### 9.2 Test Middleware Protection
- Verify unauthenticated users cannot access protected routes
- Verify authenticated users can access appropriate routes
- Test redirect behavior after login

## Step 10: Performance & Load Testing

### 10.1 Concurrent Login Attempts
```bash
# Simple load test with Apache Bench
ab -n 100 -c 10 -p login_data.json -T "application/json" \
   http://localhost:8080/api/auth/login
```

Create `login_data.json`:
```json
{
  "email": "admin@agriculture.gov.et",
  "password": "SecurePass123"
}
```

### 10.2 Database Performance
- Verify database queries are optimized
- Check for N+1 query problems
- Test with multiple concurrent users

## Troubleshooting Guide

### Common Issues and Solutions

**1. "Cannot find module '@amm/auth-ui'"**
```bash
# Build auth packages
cd packages/auth && npm run build
cd ../auth-ui && npm run build

# Clear TypeScript cache
cd ../.. && rm -rf node_modules/.cache
```

**2. Database Connection Errors**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5433

# Verify DATABASE_URL
echo $DATABASE_URL
```

**3. JWT Validation Failures**
```bash
# Check JWT_SECRET environment variable
echo $JWT_SECRET

# Ensure tokens are properly formatted
# JWT should have three parts separated by dots
```

**4. CORS Issues**
- Verify CORS is configured in backend API
- Check frontend is making requests to correct origin
- Ensure credentials are included in requests

**5. Build Failures**
```bash
# Clear all build artifacts
npm run clean

# Reinstall dependencies
npm install

# Rebuild
npm run build
```

## Verification Checklist

- [ ] Database migrations run successfully
- [ ] Initial roles seeded in database
- [ ] Backend API starts without errors
- [ ] Admin dashboard starts without errors
- [ ] Registration endpoint works
- [ ] Login endpoint works
- [ ] Token validation endpoint works
- [ ] Logout endpoint works
- [ ] Frontend login page accessible
- [ ] Frontend registration page accessible
- [ ] Route protection works (unauthenticated redirect)
- [ ] Role-based access works
- [ ] Auth state persists across page refreshes
- [ ] Logout clears auth state
- [ ] Security headers present
- [ ] Password hashing verified
- [ ] Input validation works

## Support

If you encounter issues not covered in this guide:

1. **Check logs**:
   ```bash
   # Backend logs
   cd apps/backend-api && npm run dev 2>&1 | tail -50
   
   # Frontend logs
   cd apps/admin-dashboard && npm run dev 2>&1 | tail -50
   ```

2. **Verify environment variables** are set correctly

3. **Check database connectivity** and schema

4. **Review TypeScript compilation errors** if any

5. **Contact**: Ministry of Agriculture Digital Services Division
   - Email: dev@agriculture.gov.et
   - Phone: +251-11-xxx-xxxx

---

**Ministry of Agriculture - Appointment Management System**  
*Secure, Role-Based Authentication System - Version 1.0*