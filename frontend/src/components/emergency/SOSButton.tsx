import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SOSButtonProps {
  onTrigger: () => void;
  holdDuration?: number;
}

export function SOSButton({ onTrigger, holdDuration = 3000 }: SOSButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isHolding) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
        setProgress(newProgress);
        setCountdown(Math.ceil((holdDuration - elapsed) / 1000));
        
        if (elapsed >= holdDuration) {
          clearInterval(interval);
          onTrigger();
          setIsHolding(false);
          setProgress(0);
          setCountdown(3);
        }
      }, 50);
    } else {
      setProgress(0);
      setCountdown(3);
    }

    return () => clearInterval(interval);
  }, [isHolding, holdDuration, onTrigger]);

  const handleStart = useCallback(() => {
    setIsHolding(true);
  }, []);

  const handleEnd = useCallback(() => {
    setIsHolding(false);
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring - breathing animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className={cn(
            "w-[75vw] h-[75vw] max-w-[340px] max-h-[340px] rounded-full",
            "bg-primary/5 border border-primary/10",
            !isHolding && "animate-sos-ring"
          )} 
          style={{ animationDelay: '0s' }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className={cn(
            "w-[68vw] h-[68vw] max-w-[300px] max-h-[300px] rounded-full",
            "bg-primary/8 border border-primary/15",
            !isHolding && "animate-sos-ring"
          )} 
          style={{ animationDelay: '0.6s' }}
        />
      </div>

      {/* Main SOS Button */}
      <button
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        className={cn(
          "relative w-[55vw] h-[55vw] max-w-[240px] max-h-[240px] rounded-full",
          "bg-emergency-gradient shadow-emergency",
          "flex flex-col items-center justify-center",
          "transition-all duration-200 ease-out",
          "select-none touch-none focus-ring",
          isHolding 
            ? "scale-95 shadow-2xl" 
            : "animate-sos-breathe hover:scale-[1.02]"
        )}
        style={{
          background: isHolding 
            ? `conic-gradient(from 0deg, hsl(0 72% 40%) ${progress}%, hsl(0 72% 51%) ${progress}%)`
            : undefined
        }}
      >
        {/* Inner subtle ring */}
        <div className="absolute inset-3 rounded-full bg-primary/20 backdrop-blur-sm" />
        <div className="absolute inset-5 rounded-full bg-primary/10" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-primary-foreground">
          <span className="text-4xl md:text-5xl font-black tracking-widest">SOS</span>
          {isHolding ? (
            <div className="mt-3 flex flex-col items-center">
              <span className="text-5xl md:text-6xl font-black animate-countdown tabular-nums">{countdown}</span>
              <span className="text-xs mt-2 opacity-70 font-medium">Release to cancel</span>
            </div>
          ) : (
            <span className="text-xs mt-3 opacity-80 font-medium tracking-wide">
              EMERGENCY
            </span>
          )}
        </div>
      </button>
    </div>
  );
}