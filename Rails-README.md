# Rails Backend Option

The current implementation uses **NestJS (Node.js)** for the backend, following the Hexagonal Architecture specified in the requirements document. However, if you prefer a **Rails** backend, here's how to adapt the system:

## Option 1: Rails API Backend (Recommended Migration Path)

### Create a new Rails API:
```bash
# Create new Rails API app
rails new amm-rails-api --api --database=postgresql --skip-test

# Add required gems to Gemfile:
# gem 'redis'
# gem 'sidekiq'
# gem 'puma'
# gem 'rack-cors'
# gem 'jwt'

# Set up database configuration
```

### Port the Domain Logic:
The Hexagonal Architecture makes this straightforward:

1. **Copy domain entities** (`Appointment`, `RequestorDetails`) to `app/models/`
2. **Port use cases** to Rails service objects in `app/services/`
3. **Implement repositories** using ActiveRecord in `app/repositories/`
4. **Create controllers** in `app/controllers/api/v1/`
5. **Set up event publishing** with Redis/Sidekiq

### Docker Configuration:
Update `docker-compose.yml` to include:
```yaml
rails-backend:
  build: ./amm-rails-api
  ports:
    - "3003:3000"
  environment:
    - DATABASE_URL=postgresql://postgres:password@postgres:5432/amm_db
    - REDIS_URL=redis://redis:6379
  depends_on:
    - postgres
    - redis
```

## Option 2: Full Rails Stack (Monolithic)

Replace both frontends with Rails views:

```bash
# Create full Rails app with frontend
rails new amm-full-stack --database=postgresql

# Add frontend frameworks:
# gem 'stimulus-rails'
# gem 'turbo-rails'
# gem 'importmap-rails'
# OR
# gem 'react-rails'
# gem 'webpacker'

# Build the same UI using Rails views or React components
```

## Option 3: Hybrid Approach (Current + Rails)

Keep the existing Next.js frontends but replace NestJS with Rails:

1. **Maintain** `public-web` and `admin-dashboard` as they are
2. **Replace** `backend-api` with Rails API
3. **Update** frontend API URLs to point to Rails backend

## Migration Benefits with Current Architecture

The existing Hexagonal Architecture provides clear separation:

1. **Domain Layer** (Ruby classes) - Business logic remains identical
2. **Application Layer** (Service objects) - Use cases map directly
3. **Infrastructure Layer** (ActiveRecord, Redis adapters) - Rails excels here
4. **Presentation Layer** (Rails controllers) - Replaces NestJS controllers

## Quick Start with Rails

A minimal Rails implementation would include:

```ruby
# app/models/appointment.rb
class Appointment < ApplicationRecord
  enum state: { pending: 0, confirmed: 1, rescheduled: 2, completed: 3, cancelled: 4 }
  
  validates :requestor_name, :email, :mobile, presence: true
  validates :state, presence: true
  
  # State machine methods (confirm, reschedule, cancel, complete)
  # Business hours validation
  # Event publishing callbacks
end

# app/controllers/api/v1/appointments_controller.rb
module Api::V1
  class AppointmentsController < ApplicationController
    def create
      # Use service object to handle business logic
      result = CreateAppointmentService.new(appointment_params).call
      render json: result
    end
    
    def confirm
      # Confirm logic
    end
  end
end
```

## Why the Current NestJS Implementation?

The existing implementation was chosen because:

1. **Matches requirement documents** which specify NestJS + Next.js
2. **Hexagonal Architecture** is already properly implemented
3. **TypeScript** provides type safety across frontend and backend
4. **Monorepo structure** with Turborepo is optimized for this stack
5. **Performance** - Node.js is well-suited for high-concurrency appointment systems

## Recommendation

**Stick with the current NestJS backend** because:
- It fully implements all requirements
- It's already Dockerized and working
- It maintains architectural consistency
- It's production-ready

If Rails is a hard requirement, we can migrate the backend while keeping the frontends. The domain logic is cleanly separated, making this migration feasible.

## Next Steps

To proceed with Rails:
1. Let me know if you want to migrate the backend to Rails
2. Specify if you want a full Rails stack or Rails API only
3. Provide any Rails-specific patterns or gems you prefer

Otherwise, the current Dockerized NestJS + Next.js stack is complete and ready for use.