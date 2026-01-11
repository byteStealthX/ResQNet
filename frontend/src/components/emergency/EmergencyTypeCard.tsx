import { cn } from '@/lib/utils';

interface EmergencyTypeCardProps {
  id: string;
  icon: string;
  label: string;
  labelHindi: string;
  color: 'critical' | 'high' | 'medium';
  selected?: boolean;
  onClick: () => void;
}

const colorStyles = {
  critical: 'border-primary hover:bg-primary/10 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground',
  high: 'border-warning hover:bg-warning/10 data-[selected=true]:bg-warning data-[selected=true]:text-warning-foreground',
  medium: 'border-info hover:bg-info/10 data-[selected=true]:bg-info data-[selected=true]:text-info-foreground',
};

export function EmergencyTypeCard({ 
  icon, 
  label, 
  labelHindi, 
  color, 
  selected, 
  onClick 
}: EmergencyTypeCardProps) {
  return (
    <button
      onClick={onClick}
      data-selected={selected}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
        "hover:scale-105 active:scale-95",
        colorStyles[color],
        selected && "ring-2 ring-offset-2"
      )}
    >
      <span className="text-3xl">{icon}</span>
      <div className="text-center">
        <div className="font-semibold text-sm">{label}</div>
        <div className="text-xs opacity-70">{labelHindi}</div>
      </div>
    </button>
  );
}
