# ResQNet Frontend - React Emergency Response Dashboard

Complete emergency response dispatch and monitoring dashboard built with modern web technologies.

## Features

- **Real-Time Emergency Monitoring** - Live dashboard with Socket.IO
- **Interactive Map** - Mapbox GL integration for ambulance tracking
- **AI-Powered Triage** - Integration with Azure OpenAI backend
- **Dispatch Console** - Ambulance and hospital assignment interface
- **Analytics Dashboard** - Emergency response metrics and charts
- **Role-Based Access** - Patient, Paramedic, Hospital Admin, and Admin roles

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** + **shadcn/ui** - Modern UI components
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Framer Motion** - Animations
- **Mapbox GL** - Interactive maps
- **Recharts** - Data visualization
- **Socket.IO Client** - Real-time updates

## Backend Integration

This frontend connects to the ResQNet backend API at `http://localhost:5000/api/v1`

### Environment Variables

Create a `.env` file:

```env
# Backend API
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=http://localhost:5000

# Mapbox (for map features)
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

### Running with Backend

1. Start the backend server:
   ```bash
   cd ../backend
   npm run dev
   ```

2. Start the frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open http://localhost:5173

### Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and configs
├── pages/          # Route pages
├── services/       # API service layer
└── types/          # TypeScript definitions
```

## Features

### For Patients
- Report emergencies with location
- Track ambulance arrival in real-time
- View emergency history

### For Paramedics
- View all active emergencies
- Update ambulance status and location
- Navigate to emergency locations

### For Hospital Admins
- View incoming patients
- Update bed capacity
- Manage hospital resources

### For System Admins
- Monitor all emergencies
- View system analytics
- Manage users and resources

## API Integration

The frontend integrates with these backend endpoints:

- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user
- `POST /emergencies` - Create emergency
- `GET /emergencies` - List emergencies
- `GET /ambulances/nearby` - Find nearby ambulances
- `PATCH /ambulances/:id/location` - Update location
- `GET /hospitals` - List hospitals
- `GET /admin/dashboard/stats` - Analytics

## Socket.IO Events

Real-time updates via Socket.IO:

- `emergency:created` - New emergency reported
- `emergency:updated` - Emergency status changed
- `ambulance:location` - Ambulance position updated
- `ambulance:assigned` - Ambulance dispatched
- `hospital:assigned` - Hospital assigned

## Status

✅ **Ready for Development** - Integrated with ResQNet backend
