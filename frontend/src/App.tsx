import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppNav } from "@/components/layout/AppNav";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Patient App
import EmergencyHome from "./pages/patient/EmergencyHome";
import EmergencySelect from "./pages/patient/EmergencySelect";
import EmergencyTrack from "./pages/patient/EmergencyTrack";

// Paramedic App
import ParamedicLogin from "./pages/paramedic/ParamedicLogin";
import ParamedicDashboard from "./pages/paramedic/ParamedicDashboard";

// Hospital App
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import ResourceManagement from "./pages/hospital/ResourceManagement";

// Admin App
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppNav />
          <Routes>
            {/* Patient Emergency App */}
            <Route path="/" element={<EmergencyHome />} />
            <Route path="/emergency/select" element={<EmergencySelect />} />
            <Route path="/emergency/track/:id" element={<EmergencyTrack />} />

            {/* Paramedic App */}
            <Route path="/paramedic/login" element={<ParamedicLogin />} />
            <Route path="/paramedic/dashboard" element={<ParamedicDashboard />} />

            {/* Hospital App */}
            <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
            <Route path="/hospital/resources" element={<ResourceManagement />} />

            {/* Admin App */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
