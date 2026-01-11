import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-card border-primary/20',
  success: 'bg-card border-success/20',
  warning: 'bg-card border-warning/20',
  info: 'bg-card border-info/20',
};

const iconBgStyles = {
  default: 'bg-muted',
  primary: 'bg-primary/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  info: 'bg-info/10',
};

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendLabel,
  icon,
  variant = 'default' 
}: KPICardProps) {
  return (
    <Card className={cn("p-4 border transition-all duration-200", variantStyles[variant])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl font-bold mt-1 tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs",
              trend >= 0 ? "text-success" : "text-primary"
            )}>
              {trend >= 0 ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              <span className="font-medium tabular-nums">{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-muted-foreground truncate">{trendLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            iconBgStyles[variant]
          )}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}