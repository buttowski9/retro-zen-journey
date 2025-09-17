import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import EnhancedHome from "./pages/EnhancedHome";
import OnboardingFlow from "./pages/OnboardingFlow";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import EnhancedChatCompanion from "./pages/EnhancedChatCompanion";
import ProgressPage from "./pages/ProgressPage";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<EnhancedHome />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/dashboard" element={<EnhancedDashboard />} />
            <Route path="/chat" element={<EnhancedChatCompanion />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
