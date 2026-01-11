import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Bed, Activity, Droplet, User, AlertCircle } from 'lucide-react';

interface ResourcePanelProps {
  beds: {
    er: { total: number; available: number };
    icu: { total: number; available: number };
    general: { total: number; available: number };
  };
  equipment: {
    ventilators: { total: number; available: number };
    defibrillators: { total: number; available: number };
  };
  bloodBank: Record<string, number>;
  specialists: Array<{ name: string; specialty: string; available: boolean }>;
}

export function ResourcePanel({ beds, equipment, bloodBank, specialists }: ResourcePanelProps) {
  const getUtilization = (available: number, total: number) => {
    return ((total - available) / total) * 100;
  };

  const getStatusStyle = (available: number, total: number) => {
    const utilization = getUtilization(available, total);
    if (utilization >= 90) return { text: 'text-primary', bg: '[&>div]:bg-primary', indicator: 'bg-primary' };
    if (utilization >= 70) return { text: 'text-warning', bg: '[&>div]:bg-warning', indicator: 'bg-warning' };
    return { text: 'text-success', bg: '[&>div]:bg-success', indicator: 'bg-success' };
  };

  const isLow = (available: number, total: number) => {
    return (available / total) <= 0.2;
  };

  return (
    <div className="space-y-3">
      {/* Bed Availability */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bed className="w-4 h-4 text-muted-foreground" />
          <h3 className="heading-sm">Beds</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(beds).map(([type, { total, available }]) => {
            const style = getStatusStyle(available, total);
            const low = isLow(available, total);
            return (
              <div key={type}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="capitalize font-medium">{type === 'er' ? 'ER' : type === 'icu' ? 'ICU' : 'General'}</span>
                    {low && <AlertCircle className="w-3 h-3 text-primary" />}
                  </div>
                  <span className={cn("font-mono font-semibold", style.text)}>
                    {available}/{total}
                  </span>
                </div>
                <Progress 
                  value={getUtilization(available, total)} 
                  className={cn("h-1.5", style.bg)}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Equipment */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <h3 className="heading-sm">Equipment</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(equipment).map(([name, { total, available }]) => {
            const style = getStatusStyle(available, total);
            const low = isLow(available, total);
            return (
              <div 
                key={name} 
                className={cn(
                  "text-center p-2.5 bg-secondary rounded-lg relative",
                  low && "ring-1 ring-primary/30"
                )}
              >
                {low && (
                  <AlertCircle className="w-3 h-3 text-primary absolute top-1.5 right-1.5" />
                )}
                <div className={cn("text-lg font-bold", style.text)}>
                  {available}
                  <span className="text-xs text-muted-foreground font-normal">/{total}</span>
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {name}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Blood Bank */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Droplet className="w-4 h-4 text-primary" />
          <h3 className="heading-sm">Blood Bank</h3>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {Object.entries(bloodBank).map(([type, units]) => {
            const low = units <= 2;
            return (
              <div 
                key={type} 
                className={cn(
                  "text-center p-2 rounded-lg",
                  low ? "bg-primary/10 ring-1 ring-primary/20" : "bg-secondary"
                )}
              >
                <div className={cn(
                  "text-sm font-bold",
                  low ? "text-primary" : "text-foreground"
                )}>
                  {units}
                </div>
                <div className="text-xs text-muted-foreground">{type}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Specialists */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-muted-foreground" />
          <h3 className="heading-sm">Specialists</h3>
        </div>
        <div className="space-y-2">
          {specialists.map((specialist) => (
            <div key={specialist.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0",
                  specialist.available ? "bg-success" : "bg-muted-foreground/40"
                )} />
                <span className="font-medium truncate">{specialist.name}</span>
              </div>
              <span className="text-muted-foreground text-right flex-shrink-0 ml-2">{specialist.specialty}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}