import { Check, Ambulance, Clock, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  label: string;
  time: Date | null;
  status: 'completed' | 'active' | 'pending';
  icon: 'check' | 'ambulance' | 'clock' | 'hospital';
}

interface EmergencyTimelineProps {
  status: 'pending' | 'dispatched' | 'en_route' | 'arrived' | 'completed';
  createdAt: Date;
  eta?: number;
}

export function EmergencyTimeline({ status, createdAt, eta }: EmergencyTimelineProps) {
  const getEvents = (): TimelineEvent[] => {
    const statusOrder = ['pending', 'dispatched', 'en_route', 'arrived', 'completed'];
    const currentIndex = statusOrder.indexOf(status);

    return [
      {
        id: 'received',
        label: 'Emergency received',
        time: createdAt,
        status: 'completed',
        icon: 'check',
      },
      {
        id: 'dispatched',
        label: 'Ambulance dispatched',
        time: currentIndex >= 1 ? new Date(createdAt.getTime() + 60000) : null,
        status: currentIndex >= 1 ? 'completed' : 'pending',
        icon: 'check',
      },
      {
        id: 'en_route',
        label: 'En route to patient',
        time: currentIndex >= 2 ? new Date(createdAt.getTime() + 120000) : null,
        status: currentIndex >= 2 ? (currentIndex === 2 ? 'active' : 'completed') : 'pending',
        icon: 'ambulance',
      },
      {
        id: 'eta',
        label: eta ? `ETA ${eta} mins` : 'Arriving soon',
        time: null,
        status: currentIndex >= 3 ? 'completed' : (currentIndex === 2 ? 'active' : 'pending'),
        icon: 'clock',
      },
    ];
  };

  const events = getEvents();

  const getIcon = (icon: string, status: string) => {
    const iconClass = cn(
      "w-4 h-4",
      status === 'completed' && "text-success",
      status === 'active' && "text-primary",
      status === 'pending' && "text-muted-foreground"
    );

    switch (icon) {
      case 'ambulance':
        return <Ambulance className={iconClass} />;
      case 'clock':
        return <Clock className={iconClass} />;
      case 'hospital':
        return <Building2 className={iconClass} />;
      default:
        return <Check className={iconClass} />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="space-y-0">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-3">
          {/* Timeline Line */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border-2",
              event.status === 'completed' && "bg-success/10 border-success",
              event.status === 'active' && "bg-primary/10 border-primary animate-pulse",
              event.status === 'pending' && "bg-muted border-muted-foreground/30"
            )}>
              {getIcon(event.icon, event.status)}
            </div>
            {index < events.length - 1 && (
              <div className={cn(
                "w-0.5 h-8 my-1",
                event.status === 'completed' ? "bg-success" : "bg-muted-foreground/30"
              )} />
            )}
          </div>

          {/* Event Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <span className={cn(
                "font-medium text-sm",
                event.status === 'pending' && "text-muted-foreground"
              )}>
                {event.label}
              </span>
              {event.time && (
                <span className="text-xs text-muted-foreground">
                  {formatTime(event.time)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
