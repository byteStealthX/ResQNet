import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VoiceAssistantButtonProps {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  onActivate: () => void;
  onDeactivate: () => void;
  isSupported: boolean;
  className?: string;
}

export function VoiceAssistantButton({
  isActive,
  isListening,
  isSpeaking,
  transcript,
  onActivate,
  onDeactivate,
  isSupported,
  className,
}: VoiceAssistantButtonProps) {
  if (!isSupported) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn("gap-2", className)}
      >
        <MicOff className="w-4 h-4" />
        Voice Not Supported
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Button
        variant={isActive ? "default" : "outline"}
        onClick={isActive ? onDeactivate : onActivate}
        className={cn(
          "gap-2 transition-all duration-300",
          isActive && "bg-primary shadow-emergency animate-pulse-emergency"
        )}
      >
        {isActive ? (
          <>
            {isListening ? (
              <Mic className="w-4 h-4 animate-pulse" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
            {isSpeaking ? (
              <Volume2 className="w-4 h-4 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            Voice Active
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            Enable Voice SOS
          </>
        )}
      </Button>
      
      {isActive && (
        <div className="flex flex-col items-center gap-1 animate-fade-in">
          <div className="flex items-center gap-2">
            {isListening && (
              <Badge variant="secondary" className="animate-pulse">
                <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
                Listening...
              </Badge>
            )}
            {isSpeaking && (
              <Badge variant="secondary" className="animate-pulse">
                <Volume2 className="w-3 h-3 mr-1" />
                Speaking...
              </Badge>
            )}
          </div>
          
          {transcript && (
            <p className="text-xs text-muted-foreground italic max-w-48 text-center truncate">
              "{transcript}"
            </p>
          )}
          
          <p className="text-xs text-muted-foreground text-center mt-1">
            Say "Help me" or "Emergency"
          </p>
        </div>
      )}
    </div>
  );
}
