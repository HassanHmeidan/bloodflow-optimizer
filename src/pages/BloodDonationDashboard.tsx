
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DonorRegistration from "@/components/DonorRegistration";
import { DonorManagement } from "@/components/DonorManagement";
import { BloodInventoryTracking } from "@/components/BloodInventoryTracking";
import LiveTrackingDashboard from "@/components/LiveTrackingDashboard";
import HospitalRequestDashboard from "@/components/HospitalRequestDashboard";
import { usePredictiveDemand } from "@/hooks/usePredictiveDemand";
import { Buildings, CalendarCheck, Clock, Droplet, LineChart, Map, Package, UserCheck } from "lucide-react";

export const BloodDonationDashboard = () => {
  const [currentTab, setCurrentTab] = useState("overview");
  const { demandForecasts, loading: loadingForecasts } = usePredictiveDemand();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Blood Donation System</h1>
        <p className="text-muted-foreground mb-6">
          Comprehensive platform for donor management, blood inventory tracking, and hospital requests
        </p>
        
        <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="donors" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden md:inline">Donors</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden md:inline">Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Buildings className="h-4 w-4" />
              <span className="hidden md:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden md:inline">Register</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Summary Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Donors
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,482</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Blood Units Available
                  </CardTitle>
                  <Droplet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">687</div>
                  <p className="text-xs text-muted-foreground">Updated 15 minutes ago</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Requests
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">3 critical priority</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Appointments
                  </CardTitle>
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">38</div>
                  <p className="text-xs text-muted-foreground">Next 7 days</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Blood Type Summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Inventory by Blood Type</CardTitle>
                  <CardDescription>Current available units by blood type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                      <div key={type} className="bg-white border rounded-lg p-4 text-center">
                        <div className="text-xl font-bold text-bloodRed-600">{type}</div>
                        <div className="text-3xl font-bold mt-2">
                          {/* This would be fetched from the actual inventory */}
                          {Math.floor(Math.random() * 20) + 10}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">units</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* AI Demand Prediction */}
              <Card>
                <CardHeader>
                  <CardTitle>Predictive Demand</CardTitle>
                  <CardDescription>AI-powered demand forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingForecasts ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-bloodRed-600 rounded-full border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {demandForecasts?.slice(0, 3).map((forecast) => (
                        <div key={forecast.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-bloodRed-600">{forecast.blood_type}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              forecast.urgency_level === 'critical' ? 'bg-red-100 text-red-800' :
                              forecast.urgency_level === 'high' ? 'bg-orange-100 text-orange-800' :
                              forecast.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {forecast.urgency_level.charAt(0).toUpperCase() + forecast.urgency_level.slice(1)}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-muted-foreground">Short-term</div>
                              <div className="font-semibold">{forecast.short_term_demand} units</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Medium-term</div>
                              <div className="font-semibold">{forecast.medium_term_demand} units</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!demandForecasts || demandForecasts.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          No forecast data available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions from the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex justify-between">
                          <p className="font-medium">
                            {[
                              "New donor registered",
                              "Blood donation recorded",
                              "Hospital request approved",
                              "Blood units delivered",
                              "Appointment scheduled"
                            ][i % 5]}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(Date.now() - i * 3600000).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {[
                            "John Doe registered as a new donor",
                            "2 units of A+ blood collected from Maria Garcia",
                            "Lebanon Hospital's request for 5 units of O- approved",
                            "3 units of B+ delivered to Beirut Medical Center",
                            "Ahmed Hassan scheduled an appointment for tomorrow"
                          ][i % 5]}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Alerts & Notifications</CardTitle>
                  <CardDescription>Important system notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="font-medium text-red-800">Critical Low Stock Alert</div>
                      <p className="text-sm text-red-700 mt-1">
                        O- blood type is critically low with only 3 units left
                      </p>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="font-medium text-amber-800">Expiring Units Warning</div>
                      <p className="text-sm text-amber-700 mt-1">
                        8 units of A+ will expire in the next 72 hours
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="font-medium text-blue-800">New High Priority Request</div>
                      <p className="text-sm text-blue-700 mt-1">
                        Tripoli Medical Center needs 4 units of AB+ urgently
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="font-medium text-green-800">Successful Delivery</div>
                      <p className="text-sm text-green-700 mt-1">
                        6 units successfully delivered to American University Hospital
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="donors">
            <DonorManagement />
          </TabsContent>
          
          <TabsContent value="inventory">
            <BloodInventoryTracking />
          </TabsContent>
          
          <TabsContent value="tracking">
            <LiveTrackingDashboard />
          </TabsContent>
          
          <TabsContent value="requests">
            <HospitalRequestDashboard />
          </TabsContent>
          
          <TabsContent value="register">
            <div className="max-w-4xl mx-auto">
              <DonorRegistration />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default BloodDonationDashboard;
