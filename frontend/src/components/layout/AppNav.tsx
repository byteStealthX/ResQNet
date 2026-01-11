import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  Stethoscope, 
  Building2, 
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ThemeCustomizer } from '@/components/theme/ThemeCustomizer';

const apps = [
  { path: '/', label: 'Patient', icon: AlertCircle, color: 'text-primary' },
  { path: '/paramedic/dashboard', label: 'Paramedic', icon: Stethoscope, color: 'text-info' },
  { path: '/hospital/dashboard', label: 'Hospital', icon: Building2, color: 'text-success' },
  { path: '/admin/dashboard', label: 'Admin', icon: LayoutDashboard, color: 'text-warning' },
];

export function AppNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentApp = () => {
    if (location.pathname.startsWith('/paramedic')) return 'Paramedic';
    if (location.pathname.startsWith('/hospital')) return 'Hospital';
    if (location.pathname.startsWith('/admin')) return 'Admin';
    return 'Patient';
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-b transition-transform duration-300",
        "md:translate-y-0",
        isOpen ? "translate-y-0" : "-translate-y-full md:translate-y-0"
      )}>
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emergency-gradient rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:block">EmergencyHub</span>
            </Link>

            {/* App Switcher */}
            <div className="flex items-center gap-1">
              {apps.map((app) => {
                const isActive = 
                  (app.path === '/' && !location.pathname.startsWith('/paramedic') && !location.pathname.startsWith('/hospital') && !location.pathname.startsWith('/admin')) ||
                  (app.path !== '/' && location.pathname.startsWith(app.path.split('/')[1] ? `/${app.path.split('/')[1]}` : app.path));

                return (
                  <Link
                    key={app.path}
                    to={app.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive 
                        ? "bg-secondary text-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <app.icon className={cn("w-4 h-4", isActive && app.color)} />
                    <span className="hidden sm:block">{app.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Theme Controls */}
            <div className="flex items-center gap-1">
              <ThemeCustomizer />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
