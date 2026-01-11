import { Phone, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface AmbulanceInfoCardProps {
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  initialEta: number;
  distance: number;
}

export function AmbulanceInfoCard({ 
  vehicleNumber, 
  driverName, 
  driverPhone, 
  initialEta, 
  distance 
}: AmbulanceInfoCardProps) {
  const [eta, setEta] = useState(initialEta);
  const [currentDistance, setCurrentDistance] = useState(distance);

  // Simulate ETA countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => Math.max(0, prev - 0.02));
      setCurrentDistance(prev => Math.max(0, prev - 0.01));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-sm shadow-card-lg border-2 border-primary/20">
      <div className="flex items-start justify-between gap-4">
        {/* Ambulance Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-lg">🚑</span>
            </div>
            <div>
              <div className="font-bold text-sm">{vehicleNumber}</div>
              <div className="text-xs text-muted-foreground">{driverName}</div>
            </div>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <Navigation className="w-4 h-4" />
            <span>{currentDistance.toFixed(1)} km away</span>
          </div>
        </div>

        {/* ETA Display */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">ETA</span>
          </div>
          <div className="text-3xl font-black text-primary">
            {Math.ceil(eta)}
          </div>
          <div className="text-xs font-medium text-muted-foreground">mins</div>
        </div>
      </div>

      {/* Call Button */}
      <Button 
        className="w-full mt-4 bg-success-gradient text-success-foreground hover:opacity-90"
        onClick={() => window.open(`tel:${driverPhone}`)}
      >
        <Phone className="w-4 h-4 mr-2" />
        Call Driver
      </Button>
    </Card>
  );
}
