import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import Session from "./pages/Session";
import HelpSupport from "./pages/HelpSupport";
import SafetyCenter from "./pages/SafetyCenter";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import ContactPage from "./pages/ContactPage";
import CommunicationHub from "./pages/CommunicationHub";
import Journey from "./pages/Journey";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
    <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
    <Route path="/chat/:matchId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
    <Route path="/session/:matchId" element={<ProtectedRoute><Session /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
    <Route path="/safety" element={<ProtectedRoute><SafetyCenter /></ProtectedRoute>} />
    <Route path="/guidelines" element={<ProtectedRoute><CommunityGuidelines /></ProtectedRoute>} />
    <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
    <Route path="/messages" element={<ProtectedRoute><CommunicationHub /></ProtectedRoute>} />
    <Route path="/journey" element={<ProtectedRoute><Journey /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

