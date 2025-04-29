import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AlertCircle, FileText, CalendarClock, ShieldAlert, Stethoscope, Clipboard, Building } from 'lucide-react';
import { isAuthenticated, getUserRole } from "@/lib/auth";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels = ["Normal", "Urgent", "Emergency"];

const Request = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated and is a hospital
    const authenticated = isAuthenticated();
    const userRole = getUserRole();
    
    setIsAuthorized(authenticated && userRole === 'hospital');
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Double-check authorization before submitting
    if (!isAuthorized) {
      toast.error("Authorization required", {
        description: "Only hospitals can submit blood requests. Please sign in with a hospital account.",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Blood request submitted successfully", {
        description: "We've initiated our AI-matching process to find eligible donors. You'll be notified as soon as matches are found.",
        duration: 5000,
      });
      setLoading(false);
    }, 1500);
  };
  
  const handleSignIn = () => {
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-r from-bloodRed-600 to-bloodRed-800 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Building className="h-16 w-16 mx-auto mb-6 text-white" />
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">Request Blood</h1>
                <p className="text-xl text-white/80">
                  Secure request system for verified Lebanese hospitals. Our AI will help match your request with eligible donors.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Request Form */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {!isAuthorized ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center"
                >
                  <ShieldAlert className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-3">Hospital Authentication Required</h2>
                  <p className="text-gray-600 mb-6">
                    For patient safety and security, only verified Lebanese hospital accounts can submit blood requests. 
                    Please sign in with your hospital credentials to continue.
                  </p>
                  <Button 
                    onClick={handleSignIn}
                    className="bg-bloodRed-600 hover:bg-bloodRed-700"
                  >
                    Sign In as Hospital
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white p-8 rounded-xl shadow-sm border border-gray-200"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="patientName">Patient Name</Label>
                        <Input id="patientName" placeholder="Full name of patient" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hospitalName">Hospital/Clinic Name</Label>
                        <Input id="hospitalName" placeholder="Name of medical facility" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type Needed</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            {bloodTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="units">Units Required</Label>
                        <Input id="units" type="number" min="1" max="10" placeholder="Number of units" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Urgency Level</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency level" />
                          </SelectTrigger>
                          <SelectContent>
                            {urgencyLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="requiredBy">Required By Date</Label>
                        <Input id="requiredBy" type="date" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea id="address" placeholder="Full address for blood delivery in Lebanon" rows={3} required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="medicalCase">Medical Case Description</Label>
                      <Textarea id="medicalCase" placeholder="Brief description of the medical case" rows={4} required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Person</Label>
                      <Input id="contactName" placeholder="Name of primary contact person" required />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input id="contactPhone" type="tel" placeholder="+961 XX XXX XXX" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input id="contactEmail" type="email" placeholder="Email address" required />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start">
                      <Stethoscope className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>AI-Assisted Processing:</strong> Our system uses artificial intelligence to match your request with the most suitable donors based on blood type, location, and availability. This speeds up the fulfillment process significantly.
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <strong>Important:</strong> Please provide accurate information to ensure fast processing. 
                        For emergency cases, we recommend also calling our emergency hotline at +961 1 123 456.
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-bloodRed-600 hover:bg-bloodRed-700"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit Blood Request"}
                    </Button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold mb-4">Hospital Request Process</h2>
                <p className="text-gray-600">
                  How our AI-powered system processes blood requests from Lebanese hospitals.
                </p>
              </motion.div>
              
              <div className="space-y-8">
                {[
                  {
                    number: 1,
                    title: "Submit Request",
                    description: "Hospital submits a verified request with all required patient and medical information.",
                    icon: FileText,
                  },
                  {
                    number: 2,
                    title: "AI-Powered Matching",
                    description: "Our intelligent system analyzes the request and matches it with available inventory and suitable donors throughout Lebanon.",
                    icon: Clipboard,
                  },
                  {
                    number: 3,
                    title: "Rapid Processing",
                    description: "Requests are prioritized based on urgency level, with emergency needs fast-tracked to nearby centers in Beirut and across Lebanon.",
                    icon: CalendarClock,
                  },
                  {
                    number: 4,
                    title: "Confirmation & Delivery",
                    description: "You'll receive a confirmation with delivery details and real-time tracking information throughout Lebanon's regions.",
                    icon: AlertCircle,
                  },
                ].map((step, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="bg-white h-12 w-12 rounded-full flex items-center justify-center shadow-sm border border-gray-200 mr-4 flex-shrink-0">
                      <span className="font-bold text-bloodRed-600">{step.number}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Request;
