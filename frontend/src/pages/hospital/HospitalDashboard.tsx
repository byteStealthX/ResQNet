import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResourcePanel } from '@/components/dashboard/ResourcePanel';
import { LiveMap } from '@/components/emergency/LiveMap';
import { SeverityBadge, StatusBadge } from '@/components/ui/status-badge';
import { mockEmergencies, mockHospitals, mockAmbulances } from '@/data/mockData';
import { Building2, Users, Clock, Eye, Bed, Activity, Navigation } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function HospitalDashboard() {
  const [selectedEmergency, setSelectedEmergency] = useState<typeof mockEmergencies[0] | null>(null);
  const hospital = mockHospitals[0];
  
  const incomingPatients = mockEmergencies.filter(
    e => e.status === 'dispatched' || e.status === 'en_route'
  );

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-primary';
      case 'high': return 'border-l-warning';
      default: return 'border-l-info';
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header - Compact */}
      <div className="bg-card border-b sticky top-14 z-30">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-success/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-success" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">{hospital.name}</h1>
                <p className="text-xs text-muted-foreground">{hospital.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{hospital.staffOnDuty} on duty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Main Content */}
          <div className="flex-1 space-y-5">
            {/* Incoming Patients */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <h2 className="heading-md">Incoming Patients</h2>
                </div>
                <Badge variant="secondary" className="font-mono">{incomingPatients.length}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {incomingPatients.map((emergency) => (
                  <Card 
                    key={emergency.id}
                    className={cn(
                      "p-4 border-l-4 cursor-pointer card-interactive",
                      getSeverityStyle(emergency.severity)
                    )}
                    onClick={() => setSelectedEmergency(emergency)}
                  >
                    {/* Priority info first */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          className="bg-primary/10 text-primary border-primary/30 font-mono text-xs h-6 px-2"
                        >
                          ETA {emergency.eta}m
                        </Badge>
                        <SeverityBadge severity={emergency.severity as any} />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{emergency.id}</span>
                    </div>

                    {/* Patient info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{emergency.patientName}</span>
                        <span className="text-xs text-muted-foreground">
                          {emergency.age}y, {emergency.gender}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        <span className="text-foreground font-medium">{emergency.symptoms[0]}</span>
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <StatusBadge status={emergency.status as any} />
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Navigation className="w-3 h-3" />
                          <span>{emergency.distance.toFixed(1)} km</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-3 h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmergency(emergency);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      View Details
                    </Button>
                  </Card>
                ))}

                {incomingPatients.length === 0 && (
                  <Card className="col-span-full p-8 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                    <p className="text-sm text-muted-foreground">No incoming patients</p>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Resource Sidebar */}
          <div className="lg:w-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <h2 className="heading-md">Resources</h2>
            </div>
            <ResourcePanel
              beds={hospital.beds}
              equipment={hospital.equipment}
              bloodBank={hospital.bloodBank}
              specialists={hospital.specialists}
            />
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      <Dialog open={!!selectedEmergency} onOpenChange={() => setSelectedEmergency(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedEmergency && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-base">
                  <span className="font-mono">{selectedEmergency.id}</span>
                  <SeverityBadge severity={selectedEmergency.severity as any} />
                  <StatusBadge status={selectedEmergency.status as any} />
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-4">
                <TabsList className="grid w-full grid-cols-4 h-9">
                  <TabsTrigger value="info" className="text-xs">Patient</TabsTrigger>
                  <TabsTrigger value="clinical" className="text-xs">Clinical</TabsTrigger>
                  <TabsTrigger value="preparation" className="text-xs">Prep</TabsTrigger>
                  <TabsTrigger value="tracking" className="text-xs">Track</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="label-text">Name</p>
                      <p className="text-sm font-medium mt-1">{selectedEmergency.patientName}</p>
                    </div>
                    <div>
                      <p className="label-text">Age/Gender</p>
                      <p className="text-sm font-medium mt-1">{selectedEmergency.age} / {selectedEmergency.gender}</p>
                    </div>
                    <div>
                      <p className="label-text">Blood Group</p>
                      <p className="text-sm font-medium mt-1">{selectedEmergency.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="label-text">Phone</p>
                      <p className="text-sm font-medium mt-1">{selectedEmergency.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="label-text mb-2">Medical History</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEmergency.medicalHistory.length > 0 ? (
                        selectedEmergency.medicalHistory.map(h => (
                          <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None reported</span>
                      )}
                    </div>
                  </div>

                  {selectedEmergency.allergies.length > 0 && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="label-text text-primary mb-2">⚠️ Allergies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEmergency.allergies.map(a => (
                          <Badge key={a} className="bg-primary/10 text-primary border-primary/30 text-xs">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="clinical" className="space-y-4 mt-4">
                  <div>
                    <p className="label-text mb-2">Symptoms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEmergency.symptoms.map(s => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="label-text">Conscious</p>
                      <p className="text-sm font-medium mt-1">{selectedEmergency.isConscious ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="label-text">Can Speak</p>
                      <p className="text-sm font-medium mt-1">{selectedEmergency.canSpeak ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preparation" className="space-y-4 mt-4">
                  <div>
                    <label className="label-text">Bed Assignment</label>
                    <Select>
                      <SelectTrigger className="mt-2 h-9">
                        <SelectValue placeholder="Select bed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="er-1">ER Bed 1</SelectItem>
                        <SelectItem value="er-2">ER Bed 2</SelectItem>
                        <SelectItem value="er-3">ER Bed 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="label-text">Equipment Needed</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['Ventilator', 'Defibrillator', 'ECG Monitor', 'IV Setup'].map(eq => (
                        <div key={eq} className="flex items-center gap-2 p-2 border rounded-lg">
                          <input type="checkbox" id={eq} className="rounded" />
                          <label htmlFor={eq} className="text-xs font-medium">{eq}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label-text">Assign Staff</label>
                    <Select>
                      <SelectTrigger className="mt-2 h-9">
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospital.specialists.filter(s => s.available).map(s => (
                          <SelectItem key={s.name} value={s.name}>
                            {s.name} - {s.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="tracking" className="mt-4">
                  <div className="h-[280px] rounded-xl overflow-hidden border">
                    <LiveMap
                      patientLocation={selectedEmergency.location}
                      ambulanceLocation={mockAmbulances.find(a => a.id === selectedEmergency.ambulanceId)?.location}
                      hospitalLocation={hospital.location}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}