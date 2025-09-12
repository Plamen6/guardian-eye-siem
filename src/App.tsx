import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/components/LoginPage";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Stream from "./pages/Stream";
import Search from "./pages/Search";
import Rules from "./pages/Rules";
import Alerts from "./pages/Alerts";
import Connectors from "./pages/Connectors";
import Settings from "./pages/Settings";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import BehavioralAnalytics from "./pages/BehavioralAnalytics";
import SOAR from "./pages/SOAR";
import ThreatHunting from "./pages/ThreatHunting";
import IncidentResponse from "./pages/IncidentResponse";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const LoginWrapper = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginWrapper />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="stream" element={<Stream />} />
              <Route path="search" element={<Search />} />
              <Route path="rules" element={<Rules />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="connectors" element={<Connectors />} />
              <Route path="threat-intelligence" element={<ThreatIntelligence />} />
              <Route path="behavioral-analytics" element={<BehavioralAnalytics />} />
              <Route path="soar" element={<SOAR />} />
              <Route path="threat-hunting" element={<ThreatHunting />} />
              <Route path="incident-response" element={<IncidentResponse />} />
              <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">User Management</h1><p>Coming soon...</p></div>} />
              <Route path="lookups" element={<div className="p-6"><h1 className="text-2xl font-bold">Lookup Tables</h1><p>Coming soon...</p></div>} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
