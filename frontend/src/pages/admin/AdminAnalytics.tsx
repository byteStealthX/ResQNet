import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyticsData } from '@/data/mockData';
import { ArrowLeft, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { toast } from '@/hooks/use-toast';

export default function AdminAnalytics() {
  const navigate = useNavigate();

  const handleExport = (format: 'pdf' | 'excel') => {
    toast({
      title: `Exporting ${format.toUpperCase()}`,
      description: "Your report is being generated...",
    });
  };

  // Extended data for detailed analytics
  const monthlyData = [
    { month: 'Jan', emergencies: 450, responseTime: 8.2, resolved: 445 },
    { month: 'Feb', emergencies: 420, responseTime: 7.9, resolved: 418 },
    { month: 'Mar', emergencies: 480, responseTime: 8.5, resolved: 475 },
    { month: 'Apr', emergencies: 510, responseTime: 8.1, resolved: 505 },
    { month: 'May', emergencies: 490, responseTime: 7.8, resolved: 488 },
    { month: 'Jun', emergencies: 530, responseTime: 8.3, resolved: 525 },
  ];

  const ambulanceData = [
    { id: 'AMB-001', trips: 45, avgTime: 7.5, rating: 4.8 },
    { id: 'AMB-002', trips: 42, avgTime: 8.1, rating: 4.6 },
    { id: 'AMB-003', trips: 38, avgTime: 8.8, rating: 4.5 },
    { id: 'AMB-004', trips: 51, avgTime: 7.2, rating: 4.9 },
    { id: 'AMB-005', trips: 35, avgTime: 9.1, rating: 4.4 },
  ];

  const hospitalData = [
    { name: 'City General', admissions: 120, avgStay: 2.5, satisfaction: 92 },
    { name: 'Lilavati', admissions: 95, avgStay: 2.8, satisfaction: 88 },
    { name: 'Hiranandani', admissions: 78, avgStay: 2.2, satisfaction: 94 },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Detailed performance metrics and insights</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="response">Response Times</TabsTrigger>
            <TabsTrigger value="ambulances">Ambulances</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="ai">AI Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">2,880</div>
                <div className="text-sm text-muted-foreground">Total Emergencies</div>
                <div className="text-xs text-success mt-1">+12% from last month</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-success">8.1 min</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
                <div className="text-xs text-success mt-1">-0.4 min improvement</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-info">98.5%</div>
                <div className="text-sm text-muted-foreground">Resolution Rate</div>
                <div className="text-xs text-success mt-1">Above 95% target</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-warning">4.7</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
                <div className="text-xs text-success mt-1">+0.2 from last month</div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-bold mb-4">Monthly Trend</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="emergencies" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                    <Area type="monotone" dataKey="resolved" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="response" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4">Response Time by Day</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.responseTimeTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[6, 10]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="time" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-4">Response Time by Hour</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.peakHours}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ambulances" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Fleet Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Vehicle ID</th>
                      <th className="text-left py-3 px-4 font-medium">Trips (Month)</th>
                      <th className="text-left py-3 px-4 font-medium">Avg Response</th>
                      <th className="text-left py-3 px-4 font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ambulanceData.map((amb) => (
                      <tr key={amb.id} className="border-b">
                        <td className="py-3 px-4 font-mono">{amb.id}</td>
                        <td className="py-3 px-4">{amb.trips}</td>
                        <td className="py-3 px-4">{amb.avgTime} min</td>
                        <td className="py-3 px-4">
                          <span className="text-warning">★</span> {amb.rating}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="hospitals" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Hospital Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Hospital</th>
                      <th className="text-left py-3 px-4 font-medium">Admissions</th>
                      <th className="text-left py-3 px-4 font-medium">Avg Stay (days)</th>
                      <th className="text-left py-3 px-4 font-medium">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospitalData.map((hosp) => (
                      <tr key={hosp.name} className="border-b">
                        <td className="py-3 px-4 font-medium">{hosp.name}</td>
                        <td className="py-3 px-4">{hosp.admissions}</td>
                        <td className="py-3 px-4">{hosp.avgStay}</td>
                        <td className="py-3 px-4">
                          <span className={hosp.satisfaction >= 90 ? "text-success" : "text-warning"}>
                            {hosp.satisfaction}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-success">94.2%</div>
                <div className="text-sm text-muted-foreground">Triage Accuracy</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-info">0.8s</div>
                <div className="text-sm text-muted-foreground">Avg Processing Time</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-warning">87%</div>
                <div className="text-sm text-muted-foreground">Confidence Score</div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-bold mb-4">AI Triage Distribution</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Critical', value: 15, color: '#DC2626' },
                        { name: 'High', value: 30, color: '#F59E0B' },
                        { name: 'Medium', value: 35, color: '#3B82F6' },
                        { name: 'Low', value: 20, color: '#10B981' },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Critical', value: 15, color: '#DC2626' },
                        { name: 'High', value: 30, color: '#F59E0B' },
                        { name: 'Medium', value: 35, color: '#3B82F6' },
                        { name: 'Low', value: 20, color: '#10B981' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
