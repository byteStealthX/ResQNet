import { cn } from "@/lib/utils";

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'success' | 'info' | 'warning';
type Status = 'pending' | 'dispatched' | 'en_route' | 'arrived' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  severity?: Severity;
  status?: Status;
  children?: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

const severityStyles: Record<Severity, string> = {
  critical: 'bg-primary text-primary-foreground',
  high: 'bg-warning text-warning-foreground',
  medium: 'bg-info text-info-foreground',
  low: 'bg-success text-success-foreground',
  success: 'bg-success text-success-foreground',
  info: 'bg-info text-info-foreground',
  warning: 'bg-warning text-warning-foreground',
};

const statusStyles: Record<Status, string> = {
  pending: 'bg-warning/20 text-warning border border-warning',
  dispatched: 'bg-info/20 text-info border border-info',
  en_route: 'bg-primary/20 text-primary border border-primary',
  arrived: 'bg-success/20 text-success border border-success',
  completed: 'bg-success text-success-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<Status, string> = {
  pending: 'Pending',
  dispatched: 'Dispatched',
  en_route: 'En Route',
  arrived: 'Arrived',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function StatusBadge({ severity, status, children, className, pulse }: StatusBadgeProps) {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide";
  
  return (
    <span 
      className={cn(
        baseStyles,
        severity && severityStyles[severity],
        status && statusStyles[status],
        pulse && 'animate-status-blink',
        className
      )}
    >
      {status ? statusLabels[status] : children}
    </span>
  );
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const labels: Record<Severity, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    success: 'Success',
    info: 'Info',
    warning: 'Warning',
  };

  return (
    <StatusBadge severity={severity} className={className}>
      {labels[severity]}
    </StatusBadge>
  );
}
