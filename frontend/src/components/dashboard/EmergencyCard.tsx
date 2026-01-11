import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, SeverityBadge } from '@/components/ui/status-badge';
import { MapPin, Clock, Phone, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencyCardProps {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'dispatched' | 'en_route' | 'arrived' | 'completed';
  location: string;
  distance: number;
  eta?: number;
  createdAt: Date;
  onAccept?: () => void;
  onView?: () => void;
  showAcceptButton?: boolean;
  compact?: boolean;
}

const typeIcons: Record<string, string> = {
  heart: '🫀',
  accident: '🤕',
  breathing: '🤒',
  stroke: '🧠',
  pregnancy: '🤰',
  burns: '🔥',
  bleeding: '🩸',
  unconscious: '😵',
  other: '⚡',
};

export function EmergencyCard({
  id,
  patientName,
  age,
  gender,
  type,
  severity,
  status,
  location,
  distance,
  eta,
  createdAt,
  onAccept,
  onView,
  showAcceptButton = false,
  compact = false,
}: EmergencyCardProps) {
  const timeAgo = Math.floor((Date.now() - createdAt.getTime()) / 60000);

  return (
    <Card className={cn(
      "p-4 border shadow-card transition-all hover:shadow-card-lg",
      severity === 'critical' && "border-l-4 border-l-primary",
      severity === 'high' && "border-l-4 border-l-warning",
      severity === 'medium' && "border-l-4 border-l-info"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{typeIcons[type] || '⚡'}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{id}</span>
              <SeverityBadge severity={severity} />
            </div>
            <p className="text-sm mt-0.5">
              {patientName}, {age} {gender}
            </p>
          </div>
        </div>
        <StatusBadge status={status} pulse={status === 'en_route'} />
      </div>

      {!compact && (
        <>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{timeAgo} mins ago</span>
              </div>
              <span>•</span>
              <span>{distance.toFixed(1)} km</span>
              {eta && (
                <>
                  <span>•</span>
                  <span className="font-medium text-foreground">ETA {eta} min</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {showAcceptButton && status === 'pending' && (
              <Button 
                className="flex-1 bg-success-gradient text-success-foreground hover:opacity-90"
                onClick={onAccept}
              >
                ACCEPT
              </Button>
            )}
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onView}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
