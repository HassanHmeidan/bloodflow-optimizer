
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DonorManagement } from "@/components/DonorManagement";
import { requireAuth, getUserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

const DonorManagementPage = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await requireAuth(navigate);
        const role = getUserRole();
        setUserRole(role);
        
        // Only admin should access this page
        if (role !== 'admin') {
          navigate('/dashboard');
        }
      } catch (error) {
        // Navigate to auth if not authenticated
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Listen for real-time changes to donor profiles
  useEffect(() => {
    const channel = supabase
      .channel('public:donor_profiles')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'donor_profiles'
      }, () => {
        // Invalidate the donors query to trigger a refresh
        queryClient.invalidateQueries({ queryKey: ['donors'] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-16 pb-12">
          {/* Dashboard Header */}
          <div className="bg-gradient-to-r from-bloodRed-600 to-bloodRed-800 text-white py-8 px-4">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Donor Management</h1>
                  <p className="text-white/80">
                    View and manage all blood donors in the system
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 md:mt-0 bg-white/10 border-white/20 hover:bg-white/20 text-white"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="container mx-auto px-4 py-8">
            <DonorManagement />
          </div>
        </main>
        
        <Footer />
      </div>
    </QueryClientProvider>
  );
};

export default DonorManagementPage;
