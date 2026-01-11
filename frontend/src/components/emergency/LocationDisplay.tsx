import { MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface LocationDisplayProps {
  onLocationUpdate?: (location: { lat: number; lng: number; address: string }) => void;
}

export function LocationDisplay({ onLocationUpdate }: LocationDisplayProps) {
  const [address, setAddress] = useState('Detecting location...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate location detection
    const timer = setTimeout(() => {
      setAddress('42, MG Road, Andheri West, Mumbai 400053');
      setIsLoading(false);
      onLocationUpdate?.({
        lat: 19.1196,
        lng: 72.8472,
        address: '42, MG Road, Andheri West, Mumbai 400053'
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [onLocationUpdate]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full p-3 bg-card rounded-xl border border-border transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-info" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Your Location
            </span>
            {isLoading ? (
              <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
            )}
          </div>
          <p className="text-sm font-medium mt-0.5 text-foreground truncate">
            {isLoading ? 'Detecting...' : address}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="flex-shrink-0 h-8 w-8 hover:bg-secondary"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}