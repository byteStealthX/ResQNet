import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LiveMap } from '@/components/emergency/LiveMap';
import { SafetyInstructions } from '@/components/emergency/SafetyInstructions';
import { SeverityBadge, StatusBadge } from '@/components/ui/status-badge';
import { mockEmergencies, mockAmbulances } from '@/data/mockData';
import { 
  MapPin, 
  Phone, 
  Check, 
  Truck,
  Building2,
  Stethoscope,
  Navigation,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ParamedicStatus = 'available' | 'busy' | 'off_duty';

export default function ParamedicDashboard() {
  const [status, setStatus] = useState<ParamedicStatus>('available');
  const [activeEmergency, setActiveEmergency] = useState(mockEmergencies[0]);
  const [stage, setStage] = useState<'arriving' | 'at_patient' | 'en_route_hospital'>('arriving');

  const pendingEmergencies = mockEmergencies.filter(e => e.status === 'pending');
  const currentAmbulance = mockAmbulances[0];

  const handleAcceptEmergency = (emergency: typeof mockEmergencies[0]) => {
    setActiveEmergency(emergency);
    setStatus('busy');
    toast({
      title: "Emergency Accepted",
      description: `Navigating to ${emergency.patientName}`,
    });
  };

  const handleStageChange = (newStage: typeof stage) => {
    setStage(newStage);
    const messages = {
      at_patient: "Arrived at patient location",
      en_route_hospital: "Patient loaded, en route to hospital",
    };
    if (messages[newStage as keyof typeof messages]) {
      toast({
        title: "Status Updated",
        description: messages[newStage as keyof typeof messages],
      });
    }
  };

  const statusConfig = {
    available: { color: 'bg-success', text: 'Available' },
    busy: { color: 'bg-warning', text: 'Busy' },
    off_duty: { color: 'bg-muted-foreground', text: 'Off Duty' },
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-primary bg-primary/5';
      case 'high': return 'border-l-warning bg-warning/5';
      default: return 'border-l-info bg-info/5';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header - Clean and compact */}
      <div className="bg-card border-b sticky top-14 z-30">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-info/10 text-info text-sm font-medium">VS</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">Vijay Sharma</div>
                <Badge variant="outline" className="font-mono text-xs h-5">
                  {currentAmbulance.vehicleNumber}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>Andheri West</span>
              </div>
              <div className="flex rounded-lg overflow-hidden border">
                {(['available', 'busy', 'off_duty'] as ParamedicStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors",
                      status === s 
                        ? `${statusConfig[s].color} text-white` 
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {statusConfig[s].text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Emergency Queue Sidebar - Better hierarchy */}
          <div className="lg:w-[300px] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-md">Emergency Queue</h2>
              <Badge variant="secondary" className="font-mono">{pendingEmergencies.length}</Badge>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {pendingEmergencies.map((emergency) => (
                <Card 
                  key={emergency.id}
                  className={cn(
                    "p-3 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-card",
                    getSeverityStyle(emergency.severity)
                  )}
                  onClick={() => handleAcceptEmergency(emergency)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {emergency.type === 'heart' ? '🫀' : 
                         emergency.type === 'accident' ? '🤕' : '⚡'}
                      </span>
                      <div>
                        <p className="font-semibold text-sm">{emergency.patientName}</p>
                        <p className="text-xs text-muted-foreground">{emergency.age}y, {emergency.gender}</p>
                      </div>
                    </div>
                    <SeverityBadge severity={emergency.severity as any} />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{emergency.distance.toFixed(1)} km</span>
                    </div>
                    <Button size="sm" className="h-7 text-xs px-3">
                      Accept
                    </Button>
                  </div>
                </Card>
              ))}
              {pendingEmergencies.length === 0 && (
                <Card className="p-6 text-center text-muted-foreground">
                  <Stethoscope className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No pending emergencies</p>
                </Card>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-5">
            {activeEmergency ? (
              <Card className="p-5">
                {/* Patient Header - Scannable */}
                <div className="flex items-start justify-between mb-5 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {activeEmergency.type === 'heart' ? '🫀' : 
                       activeEmergency.type === 'accident' ? '🤕' : '⚡'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="heading-lg">{activeEmergency.patientName}</h2>
                        <SeverityBadge severity={activeEmergency.severity as any} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activeEmergency.age}y • {activeEmergency.gender} • {activeEmergency.bloodGroup}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                </div>

                {/* Patient Details - Chips for scannability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="space-y-4">
                    {/* Symptoms */}
                    <div>
                      <p className="label-text mb-2">Symptoms</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeEmergency.symptoms.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Medical History */}
                    <div>
                      <p className="label-text mb-2">History</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeEmergency.medicalHistory.length > 0 ? (
                          activeEmergency.medicalHistory.map((h) => (
                            <Badge key={h} variant="outline" className="text-xs">{h}</Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Allergies - Prominent if present */}
                    {activeEmergency.allergies.length > 0 && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-primary" />
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Allergies</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeEmergency.allergies.map((a) => (
                            <Badge key={a} className="bg-primary/10 text-primary border-primary/30 text-xs">{a}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Guidance */}
                  <SafetyInstructions emergencyType={activeEmergency.type} />
                </div>

                {/* Navigation Map */}
                <div className="h-[180px] rounded-xl overflow-hidden mb-5 border">
                  <LiveMap
                    patientLocation={activeEmergency.location}
                    ambulanceLocation={currentAmbulance.location}
                    hospitalLocation={{ lat: 19.1136, lng: 72.8697 }}
                  />
                </div>

                {/* Equipment Checklist - Compact */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {['Oxygen', 'AED', 'Spine Board', 'First Aid'].map((item, i) => (
                    <div 
                      key={item}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border text-xs font-medium",
                        i < 2 ? "bg-success/10 border-success/20 text-success" : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {i < 2 ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <div className="w-3.5 h-3.5 border rounded" />
                      )}
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Stage Actions - Clear progression */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleStageChange('at_patient')}
                    disabled={stage !== 'arriving'}
                    variant={stage === 'arriving' ? 'default' : 'outline'}
                    className={cn(
                      stage === 'at_patient' && "bg-success hover:bg-success/90"
                    )}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Arrived
                  </Button>
                  <Button
                    onClick={() => handleStageChange('en_route_hospital')}
                    disabled={stage !== 'at_patient'}
                    variant={stage === 'at_patient' ? 'default' : 'outline'}
                    className={cn(
                      stage === 'en_route_hospital' && "bg-success hover:bg-success/90"
                    )}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Patient Loaded
                  </Button>
                  <Button
                    variant="outline"
                    disabled={stage !== 'en_route_hospital'}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    At Hospital
                  </Button>
                  <Button variant="ghost" className="ml-auto">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Doctor
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Navigation className="w-10 h-10 mx-auto mb-4 text-muted-foreground opacity-40" />
                <h3 className="heading-md mb-2">No Active Emergency</h3>
                <p className="text-sm text-muted-foreground">
                  Accept an emergency from the queue to begin
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}