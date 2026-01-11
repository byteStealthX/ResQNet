import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmergencyTypeCard } from '@/components/emergency/EmergencyTypeCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, ArrowLeft } from 'lucide-react';
import { emergencyTypes } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

export default function EmergencySelect() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isConscious, setIsConscious] = useState(true);
  const [canSpeak, setCanSpeak] = useState(true);

  const handleGetHelp = () => {
    if (!selectedType) {
      toast({
        title: "Please select emergency type",
        description: "Choose the type of emergency to get appropriate help.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Emergency Dispatched!",
      description: "Help is on the way. Tracking your ambulance...",
    });

    // Navigate to tracking with a mock emergency ID
    navigate('/emergency/track/EMG-2024-001');
  };

  const handleVoiceInput = () => {
    toast({
      title: "Voice Input",
      description: "Listening... Describe your emergency.",
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">What's the Emergency?</h1>
            <p className="text-sm text-muted-foreground">Select the type of emergency</p>
          </div>
        </div>

        {/* Emergency Types Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {emergencyTypes.map((type) => (
            <EmergencyTypeCard
              key={type.id}
              {...type}
              selected={selectedType === type.id}
              onClick={() => setSelectedType(type.id)}
            />
          ))}
        </div>

        {/* Quick Inputs */}
        <div className="bg-card rounded-xl border p-4 space-y-4 mb-6">
          <h3 className="font-semibold text-sm">Quick Assessment</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="conscious" className="text-sm">
              Is patient conscious?
            </Label>
            <Switch
              id="conscious"
              checked={isConscious}
              onCheckedChange={setIsConscious}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="speak" className="text-sm">
              Can patient speak?
            </Label>
            <Switch
              id="speak"
              checked={canSpeak}
              onCheckedChange={setCanSpeak}
            />
          </div>
        </div>

        {/* Voice Input */}
        <Button
          variant="outline"
          onClick={handleVoiceInput}
          className="w-full mb-4 h-12"
        >
          <Mic className="w-5 h-5 mr-2" />
          Describe Emergency (Voice)
        </Button>

        {/* Get Help Button */}
        <Button
          onClick={handleGetHelp}
          className="w-full h-14 text-lg font-bold bg-emergency-gradient text-primary-foreground shadow-emergency hover:opacity-90"
        >
          GET HELP NOW
        </Button>
      </div>
    </div>
  );
}
