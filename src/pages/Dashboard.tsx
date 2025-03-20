
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BloodInventory } from "@/components/BloodInventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { motion } from "framer-motion";
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
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');
      
      if (!token) {
        navigate('/auth');
        return;
      }
      
      setUserRole(role);
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  // Mock data for the dashboard
  const donorData = {
    nextEligibleDate: '2023-07-15',
    donationCount: 8,
    upcomingAppointment: '2023-06-28',
    recentDonations: [
      { date: '2023-03-10', location: 'Central Blood Bank', type: 'Whole Blood' },
      { date: '2022-12-05', location: 'Mobile Drive - Tech Campus', type: 'Plasma' },
      { date: '2022-09-18', location: 'Downtown Medical Center', type: 'Whole Blood' },
    ],
    nearbyDrives: [
      { date: '2023-06-20', location: 'Community Center', distance: '2.4 miles' },
      { date: '2023-06-25', location: 'University Campus', distance: '3.7 miles' },
    ]
  };

  const hospitalData = {
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
  };

  const adminData = {
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
                <h1 className="text-2xl font-bold mb-2">
                  {userRole === 'donor' && 'Donor Dashboard'}
                  {userRole === 'hospital' && 'Hospital Dashboard'}
                  {userRole === 'admin' && 'Admin Control Panel'}
                </h1>
                <p className="text-white/80">
                  {userRole === 'donor' && 'Track your donations and find nearby blood drives'}
                  {userRole === 'hospital' && 'Manage blood requests and inventory'}
                  {userRole === 'admin' && 'Monitor system activity and manage users'}
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
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userRole');
                    toast.success("Logged out successfully");
                    navigate('/');
                  }}
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
          {/* Donor Dashboard */}
          {userRole === 'donor' && (
            <div className="animate-slide-up">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="donations">My Donations</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
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
                          <div className="text-2xl font-bold">{donorData.nextEligibleDate}</div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          You'll be eligible to donate whole blood in 23 days
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
                          You've potentially saved up to {donorData.donationCount * 3} lives!
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Upcoming Appointment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Clock className="h-6 w-6 text-bloodRed-600 mr-3" />
                          <div className="text-2xl font-bold">{donorData.upcomingAppointment}</div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm text-gray-500">
                            Central Blood Bank, 10:30 AM
                          </p>
                          <Button variant="ghost" size="sm" className="h-8 text-bloodRed-600 hover:text-bloodRed-700">
                            <Pencil className="h-3 w-3 mr-1" />
                            Change
                          </Button>
                        </div>
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
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-center">
                      <Button variant="ghost" className="w-full justify-between">
                        View Full Donation History
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
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
                            <Button size="sm">Schedule</Button>
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
                      <p className="text-center py-8 text-gray-500">
                        Detailed donation history would be displayed here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="appointments">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Appointments</CardTitle>
                      <CardDescription>Schedule and manage your donation appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center py-8 text-gray-500">
                        Appointment management interface would be displayed here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {/* Hospital Dashboard */}
          {userRole === 'hospital' && (
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Request Blood</CardTitle>
                      <CardDescription>Submit a new blood request</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
                        <p className="text-gray-600 mb-4">
                          The blood request form interface would be displayed here.
                        </p>
                        <Button>Create New Request</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
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
                      <Button variant="ghost" className="w-full justify-between">
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
                      <p className="text-center py-8 text-gray-500">
                        Complete request history would be displayed here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {/* Admin Dashboard */}
          {userRole === 'admin' && (
            <div className="animate-slide-up">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">System Overview</TabsTrigger>
                  <TabsTrigger value="donors">Donor Management</TabsTrigger>
                  <TabsTrigger value="requests">Blood Requests</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
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
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700">
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700">
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
                        <Button variant="ghost" className="w-full justify-between">
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
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700">
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700">
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
                        <Button variant="ghost" className="w-full justify-between">
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
                            <Progress value={system.value} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="donors">
                  <Card>
                    <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
                      <div>
                        <CardTitle>Donor Management</CardTitle>
                        <CardDescription>View and manage all registered donors</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Search donors..."
                            className="pl-8 h-9 w-full sm:w-[250px] rounded-md border border-gray-200 bg-white text-sm focus:border-bloodRed-500 focus:ring-1 focus:ring-bloodRed-500 outline-none"
                          />
                        </div>
                        <Button variant="outline" size="sm" className="h-9">
                          Filter
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-10">
                        <p className="text-gray-600">
                          The donor management interface would be displayed here.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="requests">
                  <Card>
                    <CardHeader>
                      <CardTitle>Blood Request Management</CardTitle>
                      <CardDescription>Process and track blood requests from hospitals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-10">
                        <p className="text-gray-600">
                          The blood request management interface would be displayed here.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="inventory">
                  <BloodInventory />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
