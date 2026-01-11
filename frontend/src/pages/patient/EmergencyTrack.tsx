import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { MapboxLiveMap } from '@/components/emergency/MapboxLiveMap';
import { AmbulanceInfoCard } from '@/components/emergency/AmbulanceInfoCard';
import { SafetyInstructions } from '@/components/emergency/SafetyInstructions';
import { EmergencyTimeline } from '@/components/emergency/EmergencyTimeline';
import { mockEmergencies, mockAmbulances } from '@/data/mockData';
import { Share2, X, Clock, ArrowLeft, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTextToSpeech, emergencyAlerts } from '@/hooks/useTextToSpeech';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EmergencyTrack() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasAnnouncedDispatch, setHasAnnouncedDispatch] = useState(false);

  const { speak, isSpeaking } = useTextToSpeech({ rate: 1.1 });

  // Find the emergency
  const emergency = mockEmergencies.find(e => e.id === id) || mockEmergencies[0];
  const ambulance = mockAmbulances.find(a => a.id === emergency.ambulanceId);

  // Announce ambulance dispatched on mount
  useEffect(() => {
    if (!hasAnnouncedDispatch) {
      speak(emergencyAlerts.ambulanceDispatched);
      setHasAnnouncedDispatch(true);
    }
  }, [hasAnnouncedDispatch, speak]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    speak("Sharing your location with emergency contacts.");
    toast({
      title: "Share Location",
      description: "Sharing your location via WhatsApp...",
    });
  };

  const handleAnnounceStatus = () => {
    speak(`Ambulance is ${emergency.eta || 5} minutes away. Distance: ${emergency.distance || '2.5'} kilometers.`);
  };

  const handleCancel = () => {
    speak(emergencyAlerts.cancelConfirmed);
    toast({
      title: "Emergency Cancelled",
      description: "Your emergency request has been cancelled.",
      variant: "destructive",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Status Banner */}
      <div className="bg-card border-b sticky top-14 z-30">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{emergency.id}</span>
                  <StatusBadge status={emergency.status as any} pulse />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <Card className="overflow-hidden">
              <div className="h-[350px] relative">
                <MapboxLiveMap
                  patientLocation={emergency.location}
                  ambulanceLocation={ambulance?.location}
                  hospitalLocation={{ lat: 19.1136, lng: 72.8697 }}
                />
                
                {/* Floating Ambulance Card */}
                <div className="absolute bottom-4 left-4 right-4">
                  {ambulance && (
                    <AmbulanceInfoCard
                      vehicleNumber={ambulance.vehicleNumber}
                      driverName={ambulance.driver}
                      driverPhone={ambulance.driverPhone}
                      initialEta={emergency.eta || 5}
                      distance={emergency.distance}
                    />
                  )}
                </div>
              </div>
            </Card>

            {/* Safety Instructions */}
            <SafetyInstructions emergencyType={emergency.type} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-4">Status Updates</h3>
              <EmergencyTimeline
                status={emergency.status as any}
                createdAt={emergency.createdAt}
                eta={emergency.eta}
              />
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAnnounceStatus}
                disabled={isSpeaking}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isSpeaking ? "Speaking..." : "Announce Status"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Location
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Emergency
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Emergency?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this emergency request? 
                      The ambulance will be notified to stop.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Request</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-primary text-primary-foreground"
                    >
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
