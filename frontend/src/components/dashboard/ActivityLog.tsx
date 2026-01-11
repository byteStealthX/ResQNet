import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertCircle, Ambulance, Building2, CheckCircle } from 'lucide-react';

interface LogEntry {
  id: number;
  type: 'emergency' | 'dispatch' | 'arrival' | 'hospital';
  message: string;
  time: Date;
  severity: 'critical' | 'high' | 'info' | 'success' | 'warning';
}

interface ActivityLogProps {
  entries: LogEntry[];
}

const typeIcons = {
  emergency: AlertCircle,
  dispatch: Ambulance,
  arrival: CheckCircle,
  hospital: Building2,
};

const severityStyles = {
  critical: 'text-primary bg-primary/10',
  high: 'text-warning bg-warning/10',
  info: 'text-info bg-info/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
};

export function ActivityLog({ entries }: ActivityLogProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return formatTime(date);
  };

  return (
    <Card className="p-4">
      <h3 className="heading-md mb-4">Activity Log</h3>
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {entries.map((entry) => {
          const Icon = typeIcons[entry.type];
          
          return (
            <div 
              key={entry.id}
              className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                severityStyles[entry.severity]
              )}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed">{entry.message}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {getRelativeTime(entry.time)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}