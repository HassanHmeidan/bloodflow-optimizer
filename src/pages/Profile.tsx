
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserSettings } from "@/components/UserSettings";
import { requireAuth, getUserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    requireAuth(navigate);
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
                <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
                <p className="text-white/80">
                  Manage your personal information and preferences
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
        
        {/* Profile Content */}
        <div className="container mx-auto px-4 py-8">
          <UserSettings />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
