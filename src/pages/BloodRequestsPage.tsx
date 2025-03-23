
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BloodRequestManagement } from "@/components/BloodRequestManagement";
import { requireAuth, getUserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BloodRequestsPage = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await requireAuth(navigate);
        const role = getUserRole();
        setUserRole(role);
        
        // Only admin or hospital roles should access this page
        if (role !== 'admin' && role !== 'hospital') {
          navigate('/dashboard');
        }
      } catch (error) {
        // Navigate to auth if not authenticated
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16 pb-12">
        {/* Dashboard Header */}
        <div className="bg-gradient-to-r from-bloodRed-600 to-bloodRed-800 text-white py-8 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold mb-2">Blood Request Management</h1>
                <p className="text-white/80">
                  View and manage all blood requests in the system
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
          <BloodRequestManagement />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BloodRequestsPage;
