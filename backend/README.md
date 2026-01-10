# ResQNet Backend API

Node.js + Express backend for the ResQNet Emergency Response System.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── database/
│   │   └── connection.js      # Database configuration
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Incident.js         # Incident model
│   │   └── index.js            # Model associations
│   ├── routes/
│   │   ├── auth.routes.js      # Authentication endpoints
│   │   ├── incident.routes.js  # Incident management
│   │   ├── user.routes.js      # User management
│   │   └── resource.routes.js  # Resource management
│   ├── middleware/
│   │   └── auth.js             # JWT authentication
│   └── server.js               # Express server
├── .env.example
├── package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh access token

### Incidents
- `POST /api/v1/incidents` - Report incident
- `GET /api/v1/incidents` - Get all incidents (dispatcher/admin)
- `GET /api/v1/incidents/:id` - Get incident by ID
- `PATCH /api/v1/incidents/:id/status` - Update incident status
- `PATCH /api/v1/incidents/:id/assign` - Assign responder
- `GET /api/v1/incidents/my/reported` - Get my reported incidents
- `GET /api/v1/incidents/my/assigned` - Get assigned incidents

### Users
- `GET /api/v1/users` - Get all users (admin)
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user profile

## 👥 User Roles

- `CITIZEN` - Report incidents
- `DISPATCHER` - Manage and assign incidents
- `RESPONDER` - Respond to assigned incidents
- `HEALTHCARE` - Healthcare facility staff
- `ADMIN` - Full system access

## 🔒 Authentication

API uses JWT tokens:
- Access token: 15 minutes
- Refresh token: 7 days

Include token in requests:
```
Authorization: Bearer <access_token>
```

## 🗄️ Database Models

### User
- id, email, password, firstName, lastName, phone
- role, isActive, lastLogin

### Incident
- id, reporterId, type, severity, status
- title, description, location, address
- assignedResponderId, timestamps

## 🛠️ Development

```bash
# Run development server with auto-reload
npm run dev

# Run tests
npm test

# Seed database
npm run seed
```

## 📝 Environment Variables

See `.env.example` for required configuration.

## 🚨 Emergency Types

- MEDICAL
- FIRE
- POLICE
- ACCIDENT
- NATURAL_DISASTER
- OTHER

## 📊 Status Flow

REPORTED → DISPATCHED → EN_ROUTE → ON_SCENE → RESOLVED
