import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockHospitals } from '@/data/mockData';
import { Bed, Check, X, User, Pill, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type BedStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

interface BedInfo {
  id: string;
  status: BedStatus;
  patient?: string;
}

export default function ResourceManagement() {
  const navigate = useNavigate();
  const hospital = mockHospitals[0];
  
  // Generate bed grid
  const [beds] = useState<BedInfo[]>(() => {
    const bedList: BedInfo[] = [];
    for (let i = 1; i <= 15; i++) {
      const rand = Math.random();
      let status: BedStatus = 'available';
      if (rand > 0.8) status = 'available';
      else if (rand > 0.2) status = 'occupied';
      else status = 'reserved';
      
      bedList.push({
        id: `ER-${i.toString().padStart(2, '0')}`,
        status,
        patient: status === 'occupied' ? `Patient ${i}` : undefined,
      });
    }
    return bedList;
  });

  const statusColors: Record<BedStatus, string> = {
    available: 'bg-success/20 border-success text-success hover:bg-success/30',
    occupied: 'bg-primary/20 border-primary text-primary',
    reserved: 'bg-warning/20 border-warning text-warning',
    maintenance: 'bg-muted border-muted-foreground text-muted-foreground',
  };

  const statusIcons: Record<BedStatus, React.ReactNode> = {
    available: <Check className="w-4 h-4" />,
    occupied: <User className="w-4 h-4" />,
    reserved: <Bed className="w-4 h-4" />,
    maintenance: <X className="w-4 h-4" />,
  };

  const bedCounts = beds.reduce((acc, bed) => {
    acc[bed.status] = (acc[bed.status] || 0) + 1;
    return acc;
  }, {} as Record<BedStatus, number>);

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/hospital/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Resource Management</h1>
            <p className="text-muted-foreground">{hospital.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bed Grid */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Bed className="w-5 h-5" />
                  ER Bed Grid
                </h2>
                <div className="flex gap-4 text-sm">
                  {Object.entries(bedCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        status === 'available' && "bg-success",
                        status === 'occupied' && "bg-primary",
                        status === 'reserved' && "bg-warning",
                        status === 'maintenance' && "bg-muted-foreground"
                      )} />
                      <span className="capitalize">{status}: {count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {beds.map((bed) => (
                  <button
                    key={bed.id}
                    className={cn(
                      "aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                      statusColors[bed.status],
                      bed.status === 'available' && "cursor-pointer"
                    )}
                  >
                    {statusIcons[bed.status]}
                    <span className="text-xs font-bold">{bed.id}</span>
                    {bed.patient && (
                      <span className="text-[10px] opacity-70 truncate max-w-full px-1">
                        {bed.patient}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Equipment & Staff */}
          <div className="space-y-6">
            {/* Equipment */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Equipment Status</h3>
              <div className="space-y-3">
                {Object.entries(hospital.equipment).map(([name, { total, available }]) => (
                  <div key={name} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="capitalize font-medium">{name}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-bold",
                        available === 0 ? "text-primary" : available <= 2 ? "text-warning" : "text-success"
                      )}>
                        {available}/{total}
                      </span>
                      {available === total && <Check className="w-4 h-4 text-success" />}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Staff */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Staff On Duty
              </h3>
              <div className="space-y-3">
                {hospital.specialists.map((specialist) => (
                  <div key={specialist.name} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <div className="font-medium">{specialist.name}</div>
                      <div className="text-xs text-muted-foreground">{specialist.specialty}</div>
                    </div>
                    <Badge variant={specialist.available ? "default" : "secondary"}>
                      {specialist.available ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Critical Medicine */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Critical Medicine
              </h3>
              <div className="space-y-2">
                {['Epinephrine', 'Atropine', 'Dopamine', 'Nitroglycerin'].map((med, i) => (
                  <div key={med} className="flex items-center justify-between text-sm">
                    <span>{med}</span>
                    <Badge variant={i > 2 ? "destructive" : "secondary"}>
                      {i > 2 ? 'Low' : 'In Stock'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
