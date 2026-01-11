import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Mic, 
  Phone, 
  MapPin, 
  Shield, 
  ChevronRight, 
  ChevronLeft,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 'welcome',
    icon: Shield,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    title: 'Welcome to\nEmergency Response',
    description: 'Your safety companion that connects you to emergency services instantly, 24/7.',
    highlight: 'Fast. Reliable. Life-saving.',
  },
  {
    id: 'sos',
    icon: AlertCircle,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    title: 'One-Touch SOS',
    description: 'Press and hold the SOS button for 3 seconds to immediately alert emergency services with your location.',
    highlight: 'Average response time: 8 minutes',
  },
  {
    id: 'voice',
    icon: Mic,
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    title: 'Voice Commands',
    description: 'Can\'t reach your phone? Simply say "Help me" or "Emergency" to trigger an SOS alert hands-free.',
    highlight: 'Works even with screen locked',
  },
  {
    id: 'location',
    icon: MapPin,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    title: 'Auto Location Sharing',
    description: 'Your precise GPS location is automatically shared with responders, ensuring they find you quickly.',
    highlight: 'High-accuracy GPS tracking',
  },
  {
    id: 'ready',
    icon: Heart,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    title: 'You\'re All Set!',
    description: 'You now have instant access to emergency services. Stay safe, and remember—help is always just one tap away.',
    highlight: 'Your safety is our priority',
  },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  const goToNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (!isFirstSlide) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Skip button */}
      {!isLastSlide && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onComplete}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: 'backOut' }}
              className={cn(
                'w-28 h-28 rounded-3xl flex items-center justify-center mb-8 shadow-lg',
                slide.iconBg
              )}
            >
              <slide.icon className={cn('w-14 h-14', slide.iconColor)} />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-3xl font-bold text-foreground whitespace-pre-line leading-tight"
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-4 text-muted-foreground text-base leading-relaxed"
            >
              {slide.description}
            </motion.p>

            {/* Highlight */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <span className="text-sm font-semibold text-primary">
                {slide.highlight}
              </span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="px-8 pb-12 pt-6">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-4">
          {!isFirstSlide && (
            <Button
              variant="outline"
              size="lg"
              onClick={goToPrev}
              className="flex-1 h-14 rounded-2xl"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}
          <Button
            size="lg"
            onClick={goToNext}
            className={cn(
              'h-14 rounded-2xl font-semibold transition-all',
              isFirstSlide ? 'flex-1' : 'flex-[2]',
              isLastSlide && 'bg-success hover:bg-success/90'
            )}
          >
            {isLastSlide ? (
              <>
                Get Started
                <Heart className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
