# ResQNet Backend - Enterprise Emergency Response API

**Production-grade Node.js + TypeScript + Azure backend for ResQNet Emergency Response System**

## 🚀 Features

- **AI-Powered Triage** - Azure OpenAI integration with rule-based fallback
- **Golden Triangle Matching** - Sophisticated algorithm for ambulance & hospital selection
- **Real-Time Tracking** - Socket.IO with Azure Web PubSub abstraction
- **Azure Maps Integration** - Routing, ETA calculation with Haversine fallback
- **SMS Notifications** - Azure Communication Services
- **Role-Based Access Control** - JWT authentication with 4 user roles
- **Geospatial Queries** - MongoDB 2dsphere indexes for location-based searches
- **Enterprise Architecture** - TypeScript strict mode, structured logging, error handling

## 📋 Prerequisites

- **Node.js** 18+ 
- **MongoDB** 4.4+ or **Azure Cosmos DB** (MongoDB API)
- **Azure Account** (optional for full features)

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, set MONGODB_URI

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

## 🔧 Environment Variables

```env
# Required
MONGODB_URI=mongodb://localhost:27017/resqnet
JWT_SECRET=your_secret_key

# Optional - Azure Services
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
AZURE_OPENAI_API_KEY=your_key
AZURE_MAPS_SUBSCRIPTION_KEY=your_maps_key
AZURE_COMMUNICATION_CONNECTION_STRING=your_acs_connection
```

## 📁 Project Structure

```
src/
├── models/          # Mongoose schemas (Emergency, Ambulance, Hospital, User, Resource)
├── controllers/     # Request handlers
├── routes/          # Express routes
├── services/        # Business logic (AI triage, matching, Azure services)
├── middleware/      # Auth, validation, error handling
├── utils/           # Geospatial, ETA calculation, logging
├── config/          # Environment, database, Azure configuration
├── seed/            # Database seeding
└── server.ts        # Express + Socket.IO server
```

## 🔐 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get profile

### Emergencies
- `POST /api/v1/emergencies` - Create emergency (triggers AI triage & dispatch)
- `GET /api/v1/emergencies` - List emergencies
- `GET /api/v1/emergencies/:id` - Get emergency details
- `PATCH /api/v1/emergencies/:id/status` - Update status

### Ambulances
- `GET /api/v1/ambulances` - List ambulances
- `GET /api/v1/ambulances/nearby?latitude=19.07&longitude=72.87` - Find nearby
- `PATCH /api/v1/ambulances/:id/location` - Update location
- `PATCH /api/v1/ambulances/:id/status` - Update status

### Hospitals
- `GET /api/v1/hospitals` - List hospitals
- `GET /api/v1/hospitals/nearby?latitude=19.07&longitude=72.87` - Find nearby
- `PATCH /api/v1/hospitals/:id/capacity` - Update capacity

### Admin
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/system/health` - System health metrics

## 🎭 User Roles

- **patient** - Report emergencies, view own reports
- **paramedic** - Update ambulance location/status, view all emergencies
- **hospital_admin** - Update hospital capacity, view incoming patients
- **admin** - Full system access, analytics dashboard

## 🏥 Sample Credentials (after seeding)

```
Admin:      admin@resqnet.com / Admin@123
Dispatcher: dispatcher@resqnet.com / Dispatch@123
Hospital:   hospital@resqnet.com / Hospital@123
Patient:    patient1@resqnet.com / Patient@123
```

## 🔄 Emergency Flow

1. **Report** - Patient creates emergency via API
2. **Triage** - Azure OpenAI analyzes severity (fallback to rules)
3. **Match** - Golden Triangle algorithm finds best ambulance + hospital
4. **Dispatch** - Resources assigned, ETAs calculated
5. **Notify** - SMS sent to ambulance, hospital, patient
6. **Track** - Real-time Socket.IO updates
7. **Complete** - Status updates through to hospital arrival

## 🧪 Testing

```bash
# Run tests
npm test

# Health check
curl http://localhost:5000/health

# Create emergency (requires auth token)
curl -X POST http://localhost:5000/api/v1/emergencies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...emergency data...}'
```

## 🏗️ Production Deployment

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📊 Key Technologies

- **Express** - Web framework
- **TypeScript** - Type safety
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time communication
- **Joi** - Validation
- **JWT** - Authentication
- **Winston** - Logging
- **Azure SDKs** - OpenAI, Maps, Communication Services

## 🔒 Security

- Helmet.js security headers
- CORS configuration
- Rate limiting
- JWT token expiration
- Password hashing (bcrypt)
- Input validation (Joi)

## 📈 Scalability

- MongoDB geospatial indexing
- Connection pooling
- Async/await throughout
- Structured logging
- Error boundaries
- Azure-ready architecture

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md)

## 📄 License

MIT - See [LICENSE](../LICENSE)

---

**Built for Microsoft Imagine Cup 2026** 🏆
