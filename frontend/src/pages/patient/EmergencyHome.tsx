import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { SOSButton } from '@/components/emergency/SOSButton';
import { QuickActions } from '@/components/emergency/QuickActions';
import { LocationDisplay } from '@/components/emergency/LocationDisplay';
import { VoiceAssistantButton } from '@/components/emergency/VoiceAssistantButton';
import { useVoiceSOSAssistant } from '@/hooks/useVoiceSOSAssistant';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { toast } from '@/hooks/use-toast';

export default function EmergencyHome() {
  const { isCompleted, isLoading, completeOnboarding } = useOnboarding();
  const navigate = useNavigate();

  const handleSOSTrigger = () => {
    toast({
      title: "Emergency Triggered!",
      description: "Redirecting to emergency type selection...",
      variant: "destructive",
    });
    navigate('/emergency/select');
  };

  const handleCall108 = () => {
    window.open('tel:108');
  };

  const handleMedicalHistory = () => {
    toast({
      title: "Medical History",
      description: "Opening your medical records...",
    });
  };

  const handleEmergencyContacts = () => {
    toast({
      title: "Emergency Contacts",
      description: "Viewing your emergency contacts...",
    });
  };

  const voiceAssistant = useVoiceSOSAssistant({
    onSOSTrigger: handleSOSTrigger,
    onCall108: handleCall108,
  });

  const handleVoiceTrigger = () => {
    if (voiceAssistant.isActive) {
      voiceAssistant.deactivate();
    } else {
      voiceAssistant.activate();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show onboarding if not completed
  if (!isCompleted) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      {/* Minimal Header */}
      <header className="px-6 pt-6 pb-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">EmergencyHub</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-subtle-pulse" />
            <span className="text-xs font-medium text-success">Ready</span>
          </div>
        </div>
      </header>

      {/* Voice Assistant - Compact */}
      <div className="px-6 pb-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <VoiceAssistantButton
          isActive={voiceAssistant.isActive}
          isListening={voiceAssistant.isListening}
          isSpeaking={voiceAssistant.isSpeaking}
          transcript={voiceAssistant.transcript}
          onActivate={voiceAssistant.activate}
          onDeactivate={voiceAssistant.deactivate}
          isSupported={voiceAssistant.isSupported}
          className="w-full"
        />
      </div>

      {/* Main SOS Area - Centered with reduced visual noise */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
        {/* Clear instruction with high contrast */}
        <div className="text-center mb-6">
          <p className="text-base font-semibold text-foreground tracking-wide">
            Press & Hold for 3 seconds
          </p>
        </div>
        
        <SOSButton onTrigger={handleSOSTrigger} />
        
        {/* Reassurance microcopy */}
        <div className="mt-8 text-center max-w-[280px]">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Help is coordinated automatically.
            <br />
            <span className="text-xs opacity-70">Your location will be shared with responders.</span>
          </p>
        </div>
      </div>

      {/* Bottom Section - Compact and clean */}
      <div className="px-6 pb-6 space-y-3 animate-slide-up" style={{ animationDelay: '250ms' }}>
        {/* Location Card */}
        <LocationDisplay />
        
        {/* Quick Actions */}
        <QuickActions
          onCall108={handleCall108}
          onMedicalHistory={handleMedicalHistory}
          onEmergencyContacts={handleEmergencyContacts}
          onVoiceTrigger={handleVoiceTrigger}
        />
      </div>
    </div>
  );
}