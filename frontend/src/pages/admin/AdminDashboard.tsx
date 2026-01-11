import { Card } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/KPICard';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { mockEmergencies, mockAmbulances, mockHospitals, mockActivityLog, analyticsData } from '@/data/mockData';
import { AlertCircle, Ambulance, Building2, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const activeEmergencies = mockEmergencies.filter(e => e.status !== 'completed').length;
  const activeAmbulances = mockAmbulances.filter(a => a.status !== 'off_duty').length;
  const avgResponseTime = 8.5;
  const hospitalCapacity = Math.round(
    (mockHospitals.reduce((acc, h) => acc + (h.beds.er.total - h.beds.er.available), 0) /
    mockHospitals.reduce((acc, h) => acc + h.beds.er.total, 0)) * 100
  );

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container max-w-7xl mx-auto px-4 py-5">
        {/* KPI Cards - Consistent sizing */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <KPICard
            title="Active Emergencies"
            value={activeEmergencies}
            trend={15}
            trendLabel="vs yesterday"
            icon={<AlertCircle className="w-4 h-4 text-primary" />}
            variant="primary"
          />
          <KPICard
            title="Avg Response"
            value={`${avgResponseTime}m`}
            subtitle="Under target"
            icon={<Clock className="w-4 h-4 text-success" />}
            variant="success"
          />
          <KPICard
            title="Ambulances"
            value={`${activeAmbulances}/${mockAmbulances.length}`}
            trend={-5}
            trendLabel="from start"
            icon={<Ambulance className="w-4 h-4 text-info" />}
            variant="info"
          />
          <KPICard
            title="Capacity"
            value={`${hospitalCapacity}%`}
            subtitle="All facilities"
            icon={<Building2 className="w-4 h-4 text-warning" />}
            variant="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Real-time Map - Clean */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="heading-md">Real-time Overview</h3>
              </div>
              <div className="h-[240px] bg-gradient-to-br from-info/5 to-success/5 rounded-xl relative overflow-hidden border">
                {/* Grid background */}
                <svg className="absolute inset-0 w-full h-full opacity-10">
                  <pattern id="adminGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground"/>
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#adminGrid)" />
                </svg>

                {/* Emergency Markers */}
                {mockEmergencies.slice(0, 5).map((e, i) => (
                  <div
                    key={e.id}
                    className="absolute w-3 h-3 bg-primary rounded-full animate-subtle-pulse shadow-lg"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 3) * 20}%`,
                    }}
                    title={e.id}
                  />
                ))}

                {/* Ambulance Markers */}
                {mockAmbulances.filter(a => a.status === 'busy').slice(0, 4).map((a, i) => (
                  <div
                    key={a.id}
                    className="absolute w-5 h-5 bg-info rounded-md flex items-center justify-center shadow-lg"
                    style={{
                      left: `${25 + i * 18}%`,
                      top: `${45 + (i % 2) * 15}%`,
                    }}
                  >
                    <Ambulance className="w-2.5 h-2.5 text-info-foreground" />
                  </div>
                ))}

                {/* Hospital Markers */}
                {mockHospitals.slice(0, 3).map((h, i) => (
                  <div
                    key={h.id}
                    className="absolute w-6 h-6 bg-success rounded-lg flex items-center justify-center shadow-lg"
                    style={{
                      left: `${70 + i * 8}%`,
                      top: `${20 + i * 25}%`,
                    }}
                  >
                    <Building2 className="w-3 h-3 text-success-foreground" />
                  </div>
                ))}

                {/* Legend */}
                <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm rounded-lg p-2 text-xs space-y-1.5 border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-muted-foreground">Emergencies ({activeEmergencies})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-info rounded" />
                    <span className="text-muted-foreground">Ambulances ({activeAmbulances})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded" />
                    <span className="text-muted-foreground">Hospitals ({mockHospitals.length})</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Analytics Charts - Cleaner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Response Time Trend */}
              <Card className="p-4">
                <h3 className="heading-sm mb-4">Response Time Trend</h3>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.responseTimeTrend}>
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 10 }} 
                        axisLine={false}
                        tickLine={false}
                        dy={5}
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }} 
                        axisLine={false}
                        tickLine={false}
                        width={25}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="time" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Emergency Types */}
              <Card className="p-4">
                <h3 className="heading-sm mb-4">Emergency Types</h3>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.emergencyTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {analyticsData.emergencyTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-1">
                  {analyticsData.emergencyTypes.map((type) => (
                    <div key={type.type} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                      <span className="text-muted-foreground">{type.type}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Peak Hours */}
              <Card className="p-4 md:col-span-2">
                <h3 className="heading-sm mb-4">Peak Hours</h3>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.peakHours}>
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 10 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }} 
                        axisLine={false}
                        tickLine={false}
                        width={25}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--info))"
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>

          {/* Activity Log Sidebar */}
          <div>
            <ActivityLog entries={mockActivityLog} />
          </div>
        </div>
      </div>
    </div>
  );
}