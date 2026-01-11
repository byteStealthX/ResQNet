import { Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { safetyInstructions } from '@/data/mockData';

interface SafetyInstructionsProps {
  emergencyType: string;
}

export function SafetyInstructions({ emergencyType }: SafetyInstructionsProps) {
  const instructions = safetyInstructions[emergencyType] || safetyInstructions.other;

  return (
    <Card className="p-4 bg-card shadow-card">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <span className="text-lg">💡</span>
        What to do while waiting
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Do's */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-success flex items-center gap-1">
            <Check className="w-3 h-3" />
            DO's
          </div>
          <ul className="space-y-1.5">
            {instructions.dos.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Don'ts */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary flex items-center gap-1">
            <X className="w-3 h-3" />
            DON'Ts
          </div>
          <ul className="space-y-1.5">
            {instructions.donts.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-primary" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
