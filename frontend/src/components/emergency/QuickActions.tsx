import { Phone, FileText, Users, Mic, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  onCall108: () => void;
  onMedicalHistory: () => void;
  onEmergencyContacts: () => void;
  onVoiceTrigger: () => void;
}

const actionButtonStyles = "flex flex-col items-center gap-2.5 h-auto py-5 rounded-2xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-card hover:shadow-lg";

export function QuickActions({ onCall108, onMedicalHistory, onEmergencyContacts, onVoiceTrigger }: QuickActionsProps) {
  return (
    <div className="w-full space-y-4">
      {/* Primary CTA - Call Emergency */}
      <Button
        onClick={onCall108}
        className={cn(
          "w-full h-16 rounded-2xl font-bold text-lg transition-all duration-300",
          "bg-success hover:bg-success/90 text-success-foreground",
          "shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
          "flex items-center justify-center gap-3"
        )}
      >
        <div className="w-10 h-10 rounded-full bg-success-foreground/20 flex items-center justify-center">
          <Phone className="w-5 h-5" />
        </div>
        <span>Call 108 Now</span>
        <ArrowRight className="w-5 h-5 ml-auto" />
      </Button>

      {/* Secondary Actions Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={onMedicalHistory}
          className={cn(
            actionButtonStyles,
            "bg-card border-2 border-info/30 text-info hover:bg-info hover:text-info-foreground hover:border-info"
          )}
        >
          <div className="w-11 h-11 rounded-xl bg-info/10 flex items-center justify-center transition-colors group-hover:bg-info-foreground/20">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold">Medical History</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onEmergencyContacts}
          className={cn(
            actionButtonStyles,
            "bg-card border-2 border-warning/30 text-warning hover:bg-warning hover:text-warning-foreground hover:border-warning"
          )}
        >
          <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center transition-colors group-hover:bg-warning-foreground/20">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold">Contacts</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={onVoiceTrigger}
          className={cn(
            actionButtonStyles,
            "bg-card border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary"
          )}
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary-foreground/20">
            <Mic className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold">Voice SOS</span>
        </Button>
      </div>
    </div>
  );
}
