import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BloodInventory } from "@/components/BloodInventory";
import { DonorAppointment } from "@/components/DonorAppointment";
import { AppointmentHistory } from "@/components/AppointmentHistory";
import { DonorManagement } from "@/components/DonorManagement";
import { BloodRequestManagement, BloodRequestForm } from "@/components/BloodRequestManagement";
import { NotificationSettings } from "@/components/NotificationSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getUserProfile, getUserRole, logout } from "@/lib/auth";
import { 
  notifyLowStockDonors, 
  sendDonationConfirmation, 
  sendAppointmentReminder 
} from "@/lib/notifications";
import {
  User,
  Droplet,
  Calendar,
  Bell,
  Clock,
  ChevronRight,
  Heart,
  AlertCircle,
  Activity,
  Hospital,
  Settings,
  LogOut,
  Pencil,
  Check,
  X,
  Search,
  Loader2,
  Mail,
  CheckCircle,
  Smartphone
} from 'lucide-react';

// Mock data for blood inventory
const mockBloodStockData = [
  { type: 'A+', units: 45, status: 'normal' },
  { type: 'A-', units: 12, status: 'low' },
  { type: 'B+', units: 38, status: 'normal' },
  { type: 'B-', units: 5, status: 'critical' },
  { type: 'AB+', units: 18, status: 'normal' },
  { type: 'AB-', units: 3, status: 'critical' },
  { type: 'O+', units: 72, status: 'excess' },
  { type: 'O-', units: 9, status: 'low' },
];

// Notification system
const setupNotificationListener = () => {
  const handleNotification = (event: CustomEvent) => {
    const { message, type } = event.detail;
    
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  window.addEventListener('notification' as any, handleNotification);
  return () => {
    window.removeEventListener('notification' as any, handleNotification);
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [adminData, setAdminData] = useState<any>(null);

  // Set up notification listener
  useEffect(() => {
    const cleanup = setupNotificationListener();
    return cleanup;
  }, []);

  // Check for authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');
      const name = localStorage.getItem('userName');
      
      if (!token) {
        navigate('/auth');
        return;
      }
      
      setUserRole(role);
      setUserName(name || 'User');
      
      // Load user-specific data - use user-specific keys
      const userId = localStorage.getItem('authToken');
      
      // Load appointments for this specific user
      const savedAppointments = localStorage.getItem(`appointments_${userId}`);
      if (savedAppointments) {
        setAppointments(JSON.parse(savedAppointments));
      }
      
      // Load donations for this specific user
      const savedDonations = localStorage.getItem(`donations_${userId}`);
      if (savedDonations) {
        setDonations(JSON.parse(savedDonations));
      }
      
      // Load admin data if role is admin
      if (role === 'admin') {
        const savedAdminData = localStorage.getItem('adminData');
        if (savedAdminData) {
          setAdminData(JSON.parse(savedAdminData));
        } else {
          // Initialize admin data if it doesn't exist
          const initialAdminData = {
            totalDonors: 1245,
            totalRequests: 86,
            pendingApprovals: 14,
            lowStockAlerts: 3,
            recentDonors: [
              { name: 'John Smith', date: '2023-06-15', type: 'O+', status: 'pending' },
              { name: 'Maria Garcia', date: '2023-06-14', type: 'AB+', status: 'approved' },
              { name: 'David Lee', date: '2023-06-13', type: 'B-', status: 'pending' },
            ],
            recentRequests: [
              { hospital: 'General Hospital', date: '2023-06-15', type: 'A+', units: 2, status: 'pending' },
              { hospital: 'Children\'s Medical', date: '2023-06-14', type: 'O-', units: 5, status: 'approved' },
            ]
          };
          localStorage.setItem('adminData', JSON.stringify(initialAdminData));
          setAdminData(initialAdminData);
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  // Listen for new appointments
  useEffect(() => {
    const handleNewAppointment = (event: CustomEvent) => {
      const userId = localStorage.getItem('authToken');
      const newAppointment = event.detail;
      
      // Update state
      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      
      // Store in localStorage with user-specific key
      localStorage.setItem(`appointments_${userId}`, JSON.stringify(updatedAppointments));
    };

    window.addEventListener('appointmentScheduled' as any, handleNewAppointment);
    
    return () => {
      window.removeEventListener('appointmentScheduled' as any, handleNewAppointment);
    };
  }, [appointments]);

  // Update admin data when it changes in localStorage
  useEffect(() => {
    if (userRole === 'admin') {
      const handleStorageChange = () => {
        const savedAdminData = localStorage.getItem('adminData');
        if (savedAdminData) {
          setAdminData(JSON.parse(savedAdminData));
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [userRole]);

  // Mock data for the dashboard - only used for donor
  const donorData = {
    nextEligibleDate: '2023-07-15',
    donationCount: donations.length || 0,
    upcomingAppointment: appointments.length > 0 ? appointments[appointments.length - 1].formattedDate : null,
    recentDonations: donations.length > 0 ? donations : [],
    nearbyDrives: [
      { date: '2023-06-20', location: 'Community Center', distance: '2.4 miles' },
      { date: '2023-06-25', location: 'University Campus', distance: '3.7 miles' },
    ]
  };

  // Hospital data - load from localStorage if available
  const [hospitalData, setHospitalData] = useState({
    pendingRequests: 3,
    approvedRequests: 12,
    recentRequests: [
      { date: '2023-06-12', type: 'O+', units: 3, status: 'approved' },
      { date: '2023-06-08', type: 'AB-', units: 1, status: 'pending' },
      { date: '2023-06-01', type: 'B+', units: 2, status: 'approved' },
    ],
    inventoryStatus: {
      'A+': 80,
      'B+': 60,
      'O+': 30,
      'AB-': 20,
    }
  });

  // Update hospital data when blood requests change
  useEffect(() => {
    if (userRole === 'hospital') {
      const storedRequests = localStorage.getItem('bloodRequests');
      if (storedRequests) {
        const requests = JSON.parse(storedRequests);
        const hospitalName = localStorage.getItem('userName');
        
        // Filter requests for this hospital
        const hospitalRequests = requests.filter((r: any) => r.hospital === hospitalName);
        
        setHospitalData({
          ...hospitalData,
          pendingRequests: hospitalRequests.filter((r: any) => r.status === 'pending').length,
          approvedRequests: hospitalRequests.filter((r: any) => r.status === 'approved').length,
          recentRequests: hospitalRequests.slice(0, 3).map((r: any) => ({
            date: r.date,
            type: r.bloodType,
            units: r.units,
            status: r.status
          }))
        });
      }
    }
  }, [userRole, hospitalData]);

  const handleApprove = (id: number, type: 'donor' | 'request') => {
    if (type === 'donor') {
      // Get the current admin data
      const currentAdminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      
      // Find the donor in recentDonors
      const donorIndex = currentAdminData.recentDonors.findIndex((d: any) => 
        d.name === adminData.recentDonors[id].name && 
        d.date === adminData.recentDonors[id].date
      );
      
      if (donorIndex !== -1) {
        // Update the donor status
        currentAdminData.recentDonors[donorIndex].status = 'approved';
        
        // Update localStorage
        localStorage.setItem('adminData', JSON.stringify(currentAdminData));
        
        // Update state
        setAdminData(currentAdminData);
        
        // Update donor list in donor management
        const donors = JSON.parse(localStorage.getItem('adminDonors') || '[]');
        const donorToUpdate = donors.find((d: any) => d.name === adminData.recentDonors[id].name);
        
        if (donorToUpdate) {
          donorToUpdate.status = 'approved';
          localStorage.setItem('adminDonors', JSON.stringify(donors));
        }
        
        toast.success(`Approved ${adminData.recentDonors[id].name}`);
      }
    } else {
      // Get the current admin data
      const currentAdminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      
      // Find the request in recentRequests
      const requestIndex = currentAdminData.recentRequests.findIndex((r: any) => 
        r.hospital === adminData.recentRequests[id].hospital && 
        r.date === adminData.recentRequests[id].date
      );
      
      if (requestIndex !== -1) {
        // Update the request status
        currentAdminData.recentRequests[requestIndex].status = 'approved';
        
        // Update localStorage
        localStorage.setItem('adminData', JSON.stringify(currentAdminData));
        
        // Update state
        setAdminData(currentAdminData);
        
        // Update request list in blood request management
        const requests = JSON.parse(localStorage.getItem('bloodRequests') || '[]');
        const requestToUpdate = requests.find((r: any) => 
          r.hospital === adminData.recentRequests[id].hospital && 
          r.date === adminData.recentRequests[id].date
        );
        
        if (requestToUpdate) {
          requestToUpdate.status = 'approved';
          localStorage.setItem('bloodRequests', JSON.stringify(requests));
        }
        
        toast.success(`Approved request from ${adminData.recentRequests[id].hospital}`);
      }
    }
  };

  const handleReject = (id: number, type: 'donor' | 'request') => {
    if (type === 'donor') {
      // Get the current admin data
      const currentAdminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      
      // Remove the donor from recentDonors
      currentAdminData.recentDonors = currentAdminData.recentDonors.filter((_: any, index: number) => index !== id);
      
      // Update localStorage
      localStorage.setItem('adminData', JSON.stringify(currentAdminData));
      
      // Update state
      setAdminData(currentAdminData);
      
      // Update donor list in donor management
      const donors = JSON.parse(localStorage.getItem('adminDonors') || '[]');
      const donorToUpdate = donors.find((d: any) => d.name === adminData.recentDonors[id].name);
      
      if (donorToUpdate) {
        donorToUpdate.status = 'rejected';
        localStorage.setItem('adminDonors', JSON.stringify(donors));
      }
      
      toast.error(`Rejected ${adminData.recentDonors[id].name}`);
    } else {
      // Get the current admin data
      const currentAdminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      
      // Remove the request from recentRequests
      currentAdminData.recentRequests = currentAdminData.recentRequests.filter((_: any, index: number) => index !== id);
      
      // Update localStorage
      localStorage.setItem('adminData', JSON.stringify(currentAdminData));
      
      // Update state
      setAdminData(currentAdminData);
      
      // Update request list in blood request management
      const requests = JSON.parse(localStorage.getItem('bloodRequests') || '[]');
      const requestToUpdate = requests.find((r: any) => 
        r.hospital === adminData.recentRequests[id].hospital && 
        r.date === adminData.recentRequests[id].date
      );
      
      if (requestToUpdate) {
        requestToUpdate.status = 'rejected';
        localStorage.setItem('bloodRequests', JSON.stringify(requests));
      }
      
      toast.error(`Rejected request from ${adminData.recentRequests[id].hospital}`);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  // Function to handle low stock alerts - for admin panel
  const handleLowStockAlert = async (bloodType: string) => {
    const type = bloodType as any; // Type assertion for the function parameter
    
    try {
      // Get the current inventory
      const stock = mockBloodStockData.find(item => item.type === bloodType);
      
      if (!stock) {
        toast.error(`Blood type ${bloodType} not found in inventory`);
        return;
      }
      
      await notifyLowStockDonors(type, stock.units, 20);
      
      toast.success(`Low stock alert sent for ${bloodType}`, {
        description: "Eligible donors have been notified"
      });
    } catch (error) {
      console.error("Error sending low stock alert:", error);
      toast.error("Failed to send low stock alert");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-bloodRed-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Donor Dashboard
  if (userRole === 'donor') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-16">
          {/* Dashboard Header */}
          <div className="bg-gradient-to-r from-bloodRed-600 to-bloodRed-800 text-white py-8 px-4">
            <div className="container mx-auto">
              <motion.div
                className="flex flex-col md:flex-row justify-between items-start md:items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <h1 className="text-2xl font-bold mb-2">Donor Dashboard</h1>
                  <p className="text-white/80">
                    Welcome back, {userName}! Track your donations and find nearby blood drives
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={() => navigate('/profile')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="animate-slide-up">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="donations">My Donations</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Next Eligible Donation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Calendar className="h-6 w-6 text-bloodRed-600 mr-3" />
                          <div className="text-2xl font-bold">
                            {donations.length > 0 ? donorData.nextEligibleDate : "You're eligible now!"}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {donations.length > 0 
                            ? "You'll be eligible to donate whole blood in 23 days" 
                            : "Schedule your first donation today"}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Donation Count</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Droplet className="h-6 w-6 text-bloodRed-600 mr-3" />
                          <div className="text-2xl font-bold">{donorData.donationCount}</div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {donorData.donationCount > 0 
                            ? `You've potentially saved up to ${donorData.donationCount * 3} lives!`
                            : "Make your first donation to start saving lives"}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Upcoming Appointment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {appointments.length > 0 ? (
                          <>
                            <div className="flex items-center">
                              <Clock className="h-6 w-6 text-bloodRed-600 mr-3" />
                              <div className="text-2xl font-bold">{appointments[appointments.length - 1].formattedDate}</div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-sm text-gray-500">
                                {appointments[appointments.length - 1].location}, {appointments[appointments.length - 1].timeSlot}
                              </p>
                              <Button variant="ghost" size="sm" className="h-8 text-bloodRed-600 hover:text-bloodRed-700">
                                <Pencil className="h-3 w-3 mr-1" />
                                Change
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4">
                            <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-gray-600">No upcoming appointments</p>
                            <Button 
                              onClick={() => document.getElementById('appointments-tab')?.click()}
                              variant="link" 
                              className="text-bloodRed-600 mt-1"
                            >
                              Schedule now
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recent Donations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Donations</CardTitle>
                      <CardDescription>Your donation history for the past year</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {donations.length > 0 ? (
                        <div className="space-y-4">
                          {donorData.recentDonations.map((donation, index) => (
                            <div key={index} className="flex items-start">
                              <div className="w-12 h-12 rounded-full bg-bloodRed-50 flex items-center justify-center flex-shrink-0 mr-4">
                                <Droplet className="h-6 w-6 text-bloodRed-600" />
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between">
                                  <p className="font-medium">{donation.date}</p>
                                  <span className="text-sm bg-bloodRed-50 text-bloodRed-700 px-2 py-1 rounded">
                                    {donation.type}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{donation.location}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Droplet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">No donation history yet</p>
                          <p className="text-sm text-gray-500">
                            Your donation history will appear here after your first donation
                          </p>
                        </div>
                      )}
                    </CardContent>
                    {donations.length > 0 && (
                      <CardFooter className="border-t pt-4 flex justify-center">
                        <Button variant="ghost" className="w-full justify-between">
                          View Full Donation History
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                  
                  {/* Nearby Blood Drives */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Nearby Blood Drives</CardTitle>
                      <CardDescription>Donation opportunities in your area</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {donorData.nearbyDrives.map((drive, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-medBlue-50 flex items-center justify-center flex-shrink-0 mr-3">
                                <Hospital className="h-5 w-5 text-medBlue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{drive.location}</p>
                                <p className="text-sm text-gray-600">{drive.date} • {drive.distance}</p>
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => {
                                document.getElementById('appointments-tab')?.click();
                                toast.info("Select this location in the appointment form", {
                                  description: drive.location
                                });
                              }}
                            >
                              Schedule
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="donations">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Donation History</CardTitle>
                      <CardDescription>Track all your previous donations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {donations.length > 0 ? (
                        <div className="space-y-6">
                          {/* Donation history details would go here */}
                          <p>Your detailed donation history would be displayed here.</p>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Droplet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">No donations yet</h3>
                          <p className="text-gray-500 max-w-md mx-auto mb-6">
                            Your donation journey starts with scheduling your first appointment. 
                            Each donation can save up to 3 lives!
                          </p>
                          <Button 
                            onClick={() => document.getElementById('appointments-tab')?.click()}
                            className="bg-bloodRed-600 hover:bg-bloodRed-700"
                          >
                            Schedule First Donation
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent id="appointments-tab" value="appointments">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DonorAppointment />
                    <AppointmentHistory />
                  </div>
                </TabsContent>
                
                {/* New Notifications Tab */}
                <TabsContent value="notifications">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <NotificationSettings />
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Bell className="h-5 w-5 mr-2" />
                          Recent Notifications
                        </CardTitle>
                        <CardDescription>
                          Your latest alerts and communications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* We'll show mock notifications or actual ones if they exist */}
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start p-3 border rounded-lg">
                              <div className="w-8 h-8 rounded-full bg-bloodRed-50 flex items-center justify-center mr-3">
                                {i === 0 ? (
                                  <Bell className="h-4 w-4 text-bloodRed-600" />
                                ) : i === 1 ? (
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Droplet className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {i === 0 
                                    ? "Urgent: Blood Type O- Needed" 
                                    : i === 1 
                                    ? "Appointment Reminder" 
                                    : "Thank You for Donating"}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {i === 0
                                    ? "Your blood type is in high demand. Please consider donating soon."
                                    : i === 1
                                    ? "Your donation appointment is scheduled for tomorrow at 2:00 PM."
                                    : "Your recent donation has helped save lives. Thank you!"}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {i === 0
                                    ? "2 hours ago"
                                    : i === 1
                                    ? "1 day ago"
                                    : "1 week ago"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 flex justify-center">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate('/dashboard/notifications')}
                          >
                            View All Notifications
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // Hospital Dashboard
  if (userRole === 'hospital') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-16">
          {/* Dashboard Header */}
          <div className="bg-gradient-to-r from-bloodRed-600 to-bloodRed-800 text-white py-8 px-4">
            <div className="container mx-auto">
              <motion.div
                className="flex flex-col md:flex-row justify-between items-start md:items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <h1 className="text-2xl font-bold mb-2">Hospital Dashboard</h1>
                  <p className="text-white/80">
                    Welcome back, {userName}! Manage blood requests and inventory
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={() => navigate('/profile')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Dashboard Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="animate-slide-up">
              <Tabs defaultValue="requests" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="requests">Blood Requests</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="history">Request History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="requests" className="space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Clock className="h-6 w-6 text-amber-500 mr-3" />
                          <div className="text-2xl font-bold">{hospitalData.pendingRequests}</div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Requests awaiting approval from blood bank
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Approved Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Check className="h-6 w-6 text-green-600 mr-3" />
                          <div className="text-2xl font-bold">{hospitalData.approvedRequests}</div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Total approved requests in the last 30 days
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* New Request Form */}
                  <BloodRequestForm />
                  
                  {/* Recent Requests */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Requests</CardTitle>
                      <CardDescription>Status of your recent blood requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {hospitalData.recentRequests.map((request, index) => (
                          <div key={index} className="flex items-start">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-4 ${
                              request.status === 'approved' 
                                ? 'bg-green-50' 
                                : request.status === 'pending' 
                                ? 'bg-amber-50'
                                : 'bg-red-50'
                            }`}>
                              {request.status === 'approved' && <Check className="h-6 w-6 text-green-600" />}
                              {request.status === 'pending' && <Clock className="h-6 w-6 text-amber-500" />}
                              {request.status === 'rejected' && <X className="h-6 w-6 text-red-600" />}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <p className="font-medium">{request.date}</p>
                                <span className="text-sm bg-bloodRed-50 text-bloodRed-700 px-2 py-1 rounded">
                                  {request.type} • {request.units} units
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 capitalize">
                                Status: {request.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-center">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between"
                        onClick={() => navigate('/dashboard/requests')}
                      >
                        View All Requests
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="inventory">
                  <Card>
                    <CardHeader>
                      <CardTitle>Blood Inventory Status</CardTitle>
                      <CardDescription>Current availability for each blood type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {Object.entries(hospitalData.inventoryStatus).map(([type, level]) => (
                          <div key={type} className="space-y-2">
                            <div className="flex justify-between">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-bloodRed-50 flex items-center justify-center mr-3">
                                  <span className="font-medium text-bloodRed-700">{type}</span>
                                </div>
                                <span>Blood Type {type}</span>
                              </div>
                              <span className={`text-sm font-medium ${
                                level < 30 
                                  ? 'text-red-600' 
                                  : level < 70 
                                  ? 'text-amber-600'
                                  : 'text-green-600'
                              }`}>
                                {level}% Available
                              </span>
                            </div>
                            <Progress value={level} className={`h-2 ${
                              level < 30 
                                ? 'bg-red-100' 
                                : level < 70 
                                ? 'bg-amber-100'
                                : 'bg-green-100'
                            }`} />
                            {level < 30 && (
                              <div className="flex items-center text-sm text-red-600">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span>Low stock alert - consider placing a request</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-6">
                    <BloodInventory />
                  </div>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Request History</CardTitle>
                      <CardDescription>All blood requests history and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BloodRequestManagement />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // Admin Dashboard
  if (userRole === 'admin' && adminData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-16">
          {/* Dashboard Header */}
          <div className="bg-gradient-to-r from-bloodRed-600 to-bloodRed-800 text-white py-8 px-4">
            <div className="container mx-auto">
              <motion.div
                className="flex flex-col md:flex-row justify-between items-start md:items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <h1 className="text-2xl font-bold mb-2">Admin Control Panel</h1>
                  <p className="text-white/80">
                    Welcome back, {userName}! Monitor system activity and manage users
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={() => navigate('/profile')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Admin Dashboard Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="animate-slide-up">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">System Overview</TabsTrigger>
                  <TabsTrigger value="donors">Donor Management</TabsTrigger>
                  <TabsTrigger value="requests">Blood Requests</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Donors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <User className="h-6 w-6 text-medBlue-600 mr-3" />
                          <div className="text-2xl font-bold">{adminData.totalDonors}</div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Active registered donors
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Blood Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Heart className="h-6 w-6 text-bloodRed-600 mr-3" />
                          <div className="text-2xl font-bold">{adminData.totalRequests}</div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Total requests this month
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending Approvals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Clock className="h-6 w-6 text-amber-500 mr-3" />
                          <div className="text-2xl font-bold">{adminData.pendingApprovals}</div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Requiring administrator action
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Low Stock Alerts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                          <div className="text-2xl font-bold">{adminData.lowStockAlerts}</div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Blood types with critical levels
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recent Activity Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Donor Registrations</CardTitle>
                        <CardDescription>New donors awaiting approval</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {adminData.recentDonors.map((donor, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mr-3">
                                  <User className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{donor.name}</p>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span>{donor.date}</span>
                                    <span className="mx-2">•</span>
                                    <span className="bg-bloodRed-50 text-bloodRed-600 px-2 py-0.5 rounded">
                                      {donor.type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span className={`text-sm font-medium px-2 py-1 rounded ${
                                  donor.status === 'approved' 
                                    ? 'bg-green-50 text-green-600' 
                                    : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {donor.status.charAt(0).toUpperCase() + donor.status.slice(1)}
                                </span>
                                {donor.status === 'pending' && (
                                  <div className="flex space-x-1 ml-2">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                                      onClick={() => handleApprove(index, 'donor')}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => handleReject(index, 'donor')}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex justify-center">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between"
                          onClick={() => navigate('/dashboard/donors')}
                        >
                          View All Donors
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Blood Requests</CardTitle>
                        <CardDescription>Hospital requests requiring action</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {adminData.recentRequests.map((request, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-medBlue-50 flex items-center justify-center flex-shrink-0 mr-3">
                                  <Hospital className="h-5 w-5 text-medBlue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{request.hospital}</p>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <span>{request.date}</span>
                                    <span className="mx-2">•</span>
                                    <span className="bg-bloodRed-50 text-bloodRed-600 px-2 py-0.5 rounded">
                                      {request.type} • {request.units} units
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span className={`text-sm font-medium px-2 py-1 rounded ${
                                  request.status === 'approved' 
                                    ? 'bg-green-50 text-green-600' 
                                    : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                                {request.status === 'pending' && (
                                  <div className="flex space-x-1 ml-2">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                                      onClick={() => handleApprove(index, 'request')}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                      onClick={() => handleReject(index, 'request')}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex justify-center">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between"
                          onClick={() => navigate('/dashboard/requests')}
                        >
                          View All Requests
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                  
                  {/* System Health */}
                  <Card>
                    <CardHeader>
                      <CardTitle>System Health</CardTitle>
                      <CardDescription>Status of critical system components</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: 'Database Connectivity', status: 'operational', value: 100 },
                          { name: 'API Performance', status: 'operational', value: 95 },
                          { name: 'AI Matching Service', status: 'operational', value: 98 },
                          { name: 'Notification System', status: 'degraded', value: 82 },
                        ].map((system) => (
                          <div key={system.name} className="p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium">{system.name}</div>
                              <div className={`text-sm px-2 py-1 rounded-full ${
                                system.status === 'operational' 
                                  ? 'bg-green-50 text-green-600' 
                                  : system.status === 'degraded'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-red-50 text-red-600'
                              }`}>
                                {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                              </div>
                            </div>
                            <Progress value={system.value} className={`h-2 ${
                              system.status === 'operational' 
                                ? 'bg-green-100' 
                                : system.status === 'degraded'
                                ? 'bg-amber-100'
                                : 'bg-red-100'
                            }`} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="donors">
                  <Card>
                    <CardHeader>
                      <CardTitle>Donor Management</CardTitle>
                      <CardDescription>Manage donor accounts and information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DonorManagement />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="requests">
                  <Card>
                    <CardHeader>
                      <CardTitle>Blood Request Management</CardTitle>
                      <CardDescription>Review and process blood requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BloodRequestManagement />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="inventory">
                  <Card>
                    <CardHeader>
                      <CardTitle>Blood Inventory Management</CardTitle>
                      <CardDescription>Track and manage blood inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BloodInventory />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* New Notifications Tab for Admin */}
                <TabsContent value="notifications">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Low Stock Alerts</CardTitle>
                        <CardDescription>
                          Send notifications to eligible donors for low blood stock
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {mockBloodStockData
                            .filter(stock => stock.status === 'critical' || stock.status === 'low')
                            .map((stock, index) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                    stock.status === 'critical' ? 'bg-red-50' : 'bg-amber-50'
                                  }`}>
                                    <Droplet className={`h-5 w-5 ${
                                      stock.status === 'critical' ? 'text-red-600' : 'text-amber-600'
                                    }`} />
                                  </div>
                                  <div>
                                    <p className="font-medium">Blood Type {stock.type}</p>
                                    <div className="flex items-center">
                                      <span className="text-sm text-gray-600">{stock.units} units available</span>
                                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                        stock.status === 'critical' 
                                          ? 'bg-red-100 text-red-700' 
                                          : 'bg-amber-100 text-amber-700'
                                      }`}>
                                        {stock.status.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  size="sm"
                                  onClick={() => handleLowStockAlert(stock.type)}
                                >
                                  <Mail className="h-3.5 w-3.5 mr-2" />
                                  Send Alert
                                </Button>
                              </div>
                            ))}
                        </div>
                        
                        {mockBloodStockData.filter(stock => stock.status === 'critical' || stock.status === 'low').length === 0 && (
                          <div className="flex flex-col items-center justify-center text-center py-6">
                            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                            <h3 className="text-lg font-medium">All Blood Types at Healthy Levels</h3>
                            <p className="text-gray-600 mt-1">No critical or low stock alerts at this time</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>
                          Configure system-wide notification preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-base">Automatic Notifications</Label>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <p className="font-medium">Critical Stock Alerts</p>
                                <p className="text-gray-500">Automatically notify donors when inventory falls below critical levels</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <p className="font-medium">Appointment Reminders</p>
                                <p className="text-gray-500">Send reminders 24 hours before scheduled appointments</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <p className="font-medium">Donation Thank You</p>
                                <p className="text-gray-500">Send thank you messages after successful donations</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <Button 
                              variant="outline" 
                              className="w-full justify-between"
                              onClick={() => navigate('/dashboard/notifications')}
                            >
                              View Notification History
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this dashboard.</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
