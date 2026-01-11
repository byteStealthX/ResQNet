import { useEffect, useState } from 'react';
import { MapPin, Ambulance, Building2 } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface LiveMapProps {
  patientLocation: Location;
  ambulanceLocation?: Location;
  hospitalLocation?: Location;
  showRoute?: boolean;
}

export function LiveMap({ 
  patientLocation, 
  ambulanceLocation, 
  hospitalLocation,
  showRoute = true 
}: LiveMapProps) {
  const [ambulancePos, setAmbulancePos] = useState(ambulanceLocation);

  // Simulate ambulance movement
  useEffect(() => {
    if (!ambulanceLocation || !patientLocation) return;

    const interval = setInterval(() => {
      setAmbulancePos(prev => {
        if (!prev) return ambulanceLocation;
        
        const dx = (patientLocation.lat - prev.lat) * 0.05;
        const dy = (patientLocation.lng - prev.lng) * 0.05;
        
        return {
          lat: prev.lat + dx,
          lng: prev.lng + dy,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [ambulanceLocation, patientLocation]);

  return (
    <div className="relative w-full h-full min-h-[300px] bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 rounded-xl overflow-hidden">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Route Line */}
      {showRoute && ambulancePos && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--success))" />
            </linearGradient>
          </defs>
          <path
            d="M 30% 70% Q 50% 50% 70% 30%"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeDasharray="10 5"
            fill="none"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* Patient Location */}
      <div 
        className="absolute flex flex-col items-center"
        style={{ left: '70%', top: '30%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="relative">
          <div className="absolute inset-0 w-12 h-12 bg-info/30 rounded-full animate-ping" />
          <div className="relative w-12 h-12 bg-info rounded-full flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6 text-info-foreground" />
          </div>
        </div>
        <span className="mt-2 text-xs font-semibold bg-info text-info-foreground px-2 py-0.5 rounded-full">
          Patient
        </span>
      </div>

      {/* Ambulance Location */}
      {ambulancePos && (
        <div 
          className="absolute flex flex-col items-center transition-all duration-2000"
          style={{ left: '30%', top: '70%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative animate-ambulance">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg rotate-45">
              <Ambulance className="w-7 h-7 text-primary-foreground -rotate-45" />
            </div>
          </div>
          <span className="mt-2 text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            Ambulance
          </span>
        </div>
      )}

      {/* Hospital Location */}
      {hospitalLocation && (
        <div 
          className="absolute flex flex-col items-center"
          style={{ left: '85%', top: '15%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-success-foreground" />
          </div>
          <span className="mt-2 text-xs font-semibold bg-success text-success-foreground px-2 py-0.5 rounded-full">
            Hospital
          </span>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-info rounded-full" />
            <span>Patient Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span>Ambulance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded-full" />
            <span>Hospital</span>
          </div>
        </div>
      </div>
    </div>
  );
}
