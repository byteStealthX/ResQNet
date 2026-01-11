import { Settings2, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const presetInfo: Record<string, { name: string; description: string; color: string }> = {
  emergency: {
    name: 'Emergency Red',
    description: 'Default emergency theme',
    color: 'bg-red-500',
  },
  ocean: {
    name: 'Ocean Blue',
    description: 'Calm and professional',
    color: 'bg-sky-500',
  },
  forest: {
    name: 'Forest Green',
    description: 'Natural and soothing',
    color: 'bg-green-600',
  },
  sunset: {
    name: 'Sunset Orange',
    description: 'Warm and inviting',
    color: 'bg-orange-500',
  },
  purple: {
    name: 'Royal Purple',
    description: 'Bold and modern',
    color: 'bg-purple-500',
  },
};

export function ThemeCustomizer() {
  const { colorPreset, setColorPreset, colorPresets } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Customize theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Theme Customization
          </DialogTitle>
          <DialogDescription>
            Choose a color theme for the app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <h4 className="text-sm font-medium">Color Presets</h4>
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(colorPresets).map((preset) => {
              const info = presetInfo[preset];
              const isActive = colorPreset === preset;
              
              return (
                <button
                  key={preset}
                  onClick={() => setColorPreset(preset)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    isActive
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    info.color
                  )}>
                    {isActive && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{info.name}</p>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="flex-1 text-xs text-muted-foreground">
            Theme changes are saved automatically
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
