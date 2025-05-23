import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Donate from "./pages/Donate";
import Request from "./pages/Request";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import DonorManagementPage from "./pages/DonorManagementPage";
import BloodRequestsPage from "./pages/BloodRequestsPage";
import { Chatbot } from "./components/Chatbot";
import NotificationHistoryPage from "./pages/NotificationHistoryPage";
import { SupabaseProvider } from "./contexts/SupabaseContext";
import BloodDonationDashboard from "./pages/BloodDonationDashboard";

// This frontend connects to a Python backend API
// The backend would typically be built with frameworks like:
// - Flask
// - FastAPI
// - Django

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ScrollToTop component to handle scrolling to top on navigation
// and also handle scrolling to anchor if present in URL
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // First scroll to top
    window.scrollTo(0, 0);
    
    // Then handle hash (if any) with a slight delay to ensure page is loaded
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, [pathname, hash]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Core Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/request" element={<Request />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin/Dashboard Routes */}
            <Route path="/dashboard/donors" element={<DonorManagementPage />} />
            <Route path="/dashboard/requests" element={<BloodRequestsPage />} />
            <Route path="/dashboard/inventory" element={<Dashboard />} />
            <Route path="/dashboard/analytics" element={<Dashboard />} />
            <Route path="/dashboard/notifications" element={<NotificationHistoryPage />} />
            
            {/* Common redirect routes for the resources in footer */}
            <Route path="/guidelines" element={<About />} />
            <Route path="/blood-types" element={<About />} />
            <Route path="/health-info" element={<About />} />
            <Route path="/process" element={<Donate />} />
            <Route path="/research" element={<About />} />
            <Route path="/privacy" element={<About />} />
            <Route path="/terms" element={<About />} />
            <Route path="/cookies" element={<About />} />
            <Route path="/faqs" element={<About />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/blood-dashboard" element={<BloodDonationDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* The Chatbot is placed here to ensure it's available on all pages */}
          <Chatbot />
        </BrowserRouter>
      </TooltipProvider>
    </SupabaseProvider>
  </QueryClientProvider>
);

export default App;
