
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { supabase } from '@/lib/supabase';
import { useAIDonorMatching, type MatchedDonor } from '@/hooks/useAIDonorMatching';
import { BloodRequestFlow } from '@/components/BloodRequestFlow';
import { 
  CalendarIcon, 
  Clock, 
  Building, 
  Search, 
  CircleAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Users,
  Bell
} from "lucide-react";
import { cn } from '@/lib/utils';
import { BloodRequestStatus } from '@/types/status';

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
type BloodType = typeof BLOOD_TYPES[number];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" }
] as const;

type PriorityLevel = "low" | "medium" | "high" | "critical";

const requestFormSchema = z.object({
  hospitalId: z.string({
    required_error: "Please select a hospital.",
  }),
  bloodType: z.enum(BLOOD_TYPES, {
    required_error: "Please select a blood type.",
  }),
  units: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Please enter a valid number of units.",
  }),
  priority: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select a priority level.",
  }),
  requiredBy: z.date({
    required_error: "Please select a required date.",
  }),
  notes: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

interface Hospital {
  id: string;
  name: string;
}

interface BloodRequest {
  id: string;
  hospital_id: string;
  hospital_name: string;
  blood_type: BloodType;
  units: number;
  priority: PriorityLevel;
  status: BloodRequestStatus;
  request_date: string;
  approval_date?: string;
  fulfillment_date?: string;
  notes?: string;
}

export const HospitalRequestDashboard = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showDonorMatching, setShowDonorMatching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { findMatchingDonors, matchedDonors, notifyDonors, isLoading: isMatching, error } = useAIDonorMatching();
  
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      notes: "",
    },
  });
  
  // Fetch hospitals and blood requests
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch hospitals
        const { data: hospitalsData, error: hospitalsError } = await supabase
          .from('hospitals')
          .select('id, name')
          .eq('status', 'active');
          
        if (hospitalsError) throw hospitalsError;
        setHospitals(hospitalsData);
        
        // Fetch blood requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('blood_requests')
          .select(`
            id,
            hospital_id,
            blood_type,
            units,
            priority,
            status,
            request_date,
            approval_date,
            fulfillment_date,
            notes
          `)
          .order('request_date', { ascending: false });
          
        if (requestsError) throw requestsError;
        
        // Get hospital names
        const requestsWithHospitals = await Promise.all(requestsData.map(async (request) => {
          const { data: hospital } = await supabase
            .from('hospitals')
            .select('name')
            .eq('id', request.hospital_id)
            .single();
            
          return {
            ...request,
            hospital_name: hospital?.name || 'Unknown Hospital',
            blood_type: request.blood_type as BloodType,
            priority: request.priority as PriorityLevel,
            status: request.status as BloodRequestStatus
          } as BloodRequest;
        }));
        
        setRequests(requestsWithHospitals);
        setFilteredRequests(requestsWithHospitals);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up realtime subscription for requests
    const channel = supabase
      .channel('blood-requests-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'blood_requests' 
      }, () => {
        fetchData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Filter requests based on tab and search
  useEffect(() => {
    let filtered = [...requests];
    
    // Filter by tab
    if (currentTab === 'pending') {
      filtered = filtered.filter(req => req.status === 'pending');
    } else if (currentTab === 'approved') {
      filtered = filtered.filter(req => req.status === 'approved');
    } else if (currentTab === 'fulfilled') {
      filtered = filtered.filter(req => req.status === 'fulfilled');
    } else if (currentTab === 'cancelled') {
      filtered = filtered.filter(req => req.status === 'cancelled' || req.status === 'rejected');
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        req => 
          req.blood_type.toLowerCase().includes(query) ||
          req.hospital_name.toLowerCase().includes(query) ||
          req.id.toLowerCase().includes(query) ||
          req.status.toLowerCase().includes(query)
      );
    }
    
    setFilteredRequests(filtered);
  }, [requests, currentTab, searchQuery]);
  
  const onSubmit = async (data: RequestFormValues) => {
    try {
      const { data: result, error } = await supabase
        .from('blood_requests')
        .insert({
          hospital_id: data.hospitalId,
          blood_type: data.bloodType,
          units: parseInt(data.units),
          priority: data.priority,
          status: 'pending',
          request_date: new Date().toISOString(),
          notes: data.notes,
        })
        .select();
        
      if (error) throw error;
      
      toast.success("Blood request submitted successfully");
      form.reset();
      
      // If high or critical priority, find matching donors immediately
      if (data.priority === 'high' || data.priority === 'critical') {
        // Find the hospital name
        const hospital = hospitals.find(h => h.id === data.hospitalId);
        
        await findMatchingDonors({
          bloodType: data.bloodType,
          location: hospital?.name || "",
          unitsNeeded: parseInt(data.units)
        });
        
        // Show AI matching dialog
        setSelectedRequest(result[0].id);
        setShowDonorMatching(true);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request");
    }
  };
  
  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('blood_requests')
        .update({
          status: 'approved',
          approval_date: new Date().toISOString(),
        })
        .eq('id', requestId);
        
      if (error) throw error;
      
      toast.success("Request approved");
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as BloodRequestStatus, approval_date: new Date().toISOString() } 
          : req
      ));
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };
  
  const handleFulfillRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('blood_requests')
        .update({
          status: 'fulfilled',
          fulfillment_date: new Date().toISOString(),
        })
        .eq('id', requestId);
        
      if (error) throw error;
      
      toast.success("Request fulfilled");
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'fulfilled' as BloodRequestStatus, fulfillment_date: new Date().toISOString() } 
          : req
      ));
    } catch (error) {
      console.error("Error fulfilling request:", error);
      toast.error("Failed to fulfill request");
    }
  };
  
  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('blood_requests')
        .update({
          status: 'rejected',
        })
        .eq('id', requestId);
        
      if (error) throw error;
      
      toast.success("Request rejected");
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as BloodRequestStatus } 
          : req
      ));
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Low</span>;
      case 'medium':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Medium</span>;
      case 'high':
        return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">High</span>;
      case 'critical':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Critical</span>;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: BloodRequestStatus) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full"><Clock className="h-3 w-3" /> Pending</span>;
      case 'approved':
        return <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"><CheckCircle2 className="h-3 w-3" /> Approved</span>;
      case 'fulfilled':
        return <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"><CheckCircle2 className="h-3 w-3" /> Fulfilled</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"><XCircle className="h-3 w-3" /> Cancelled</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"><AlertTriangle className="h-3 w-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  const handleNotifySelectedDonors = async (selectedDonorIds: string[]) => {
    if (!selectedRequest) return;
    
    const request = requests.find(r => r.id === selectedRequest);
    if (!request) return;
    
    try {
      // Use the notifyDonors function from the hook
      const success = await notifyDonors(selectedDonorIds, {
        requestId: request.id,
        bloodType: request.blood_type,
        units: request.units,
        urgency: request.priority,
        hospitalName: request.hospital_name
      });
      
      if (success) {
        setShowDonorMatching(false);
      }
    } catch (error) {
      console.error("Error notifying donors:", error);
      toast.error("Failed to notify donors", {
        description: "Please try again later."
      });
    }
  };
  

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* New Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>New Blood Request</CardTitle>
            <CardDescription>Submit a new request for blood units</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="hospitalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a hospital" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hospitals.map((hospital) => (
                            <SelectItem key={hospital.id} value={hospital.id}>
                              {hospital.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOOD_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Units Needed</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Enter number of units"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRIORITY_LEVELS.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requiredBy"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Required By</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                // Disable dates in the past
                                return date < new Date();
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional information about this request"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-2">
                  <Button type="submit" className="w-full bg-bloodRed-600 hover:bg-bloodRed-700">
                    Submit Request
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Blood Type Availability Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Blood Availability</CardTitle>
            <CardDescription>Available units by blood type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {BLOOD_TYPES.map((type) => (
                <div key={type} className="bg-white border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-bloodRed-600">{type}</div>
                  <div className="text-3xl font-bold mt-2">
                    {/* This would be fetched from the actual inventory */}
                    {Math.floor(Math.random() * 20)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">units</div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Legend:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Sufficient (10+ units)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Low (5-9 units)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Critical (&lt;5 units)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                  <span>No units available</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Blood Request List */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Blood Requests</CardTitle>
              <CardDescription>Manage and track blood requests</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search requests..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Tabs defaultValue="all" onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-bloodRed-600 rounded-full border-t-transparent"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No requests found</h3>
              <p className="mt-1 text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "There are no blood requests that match your criteria"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedRequest(request.id)}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="p-4 flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-medium">{request.hospital_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Request #{request.id.substring(0, 8)} • {new Date(request.request_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(request.status)}
                          {getPriorityBadge(request.priority)}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-bloodRed-50 border border-bloodRed-200 rounded-lg px-3 py-1.5">
                            <span className="text-bloodRed-600 font-semibold">{request.blood_type}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Units:</span>{" "}
                            <span className="font-medium">{request.units}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveRequest(request.id);
                                }}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectRequest(request.id);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFulfillRequest(request.id);
                              }}
                            >
                              Mark Fulfilled
                            </Button>
                          )}
                          {(request.priority === 'high' || request.priority === 'critical') && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequest(request.id);
                                findMatchingDonors({
                                  bloodType: request.blood_type,
                                  location: request.hospital_name,
                                  unitsNeeded: request.units,
                                });
                                setShowDonorMatching(true);
                              }}
                            >
                              <Users className="h-3.5 w-3.5" />
                              Find Donors
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Request Detail Modal */}
      {selectedRequest && !showDonorMatching && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Request Details</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400"
                  onClick={() => setSelectedRequest(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              {requests.find(r => r.id === selectedRequest) && (
                <div>
                  <BloodRequestFlow 
                    requestId={selectedRequest}
                    hospitalName={requests.find(r => r.id === selectedRequest)!.hospital_name}
                    bloodType={requests.find(r => r.id === selectedRequest)!.blood_type}
                    units={requests.find(r => r.id === selectedRequest)!.units}
                    priority={requests.find(r => r.id === selectedRequest)!.priority}
                    status={requests.find(r => r.id === selectedRequest)!.status}
                    requestDate={requests.find(r => r.id === selectedRequest)!.request_date}
                    approvalDate={requests.find(r => r.id === selectedRequest)!.approval_date}
                    fulfillmentDate={requests.find(r => r.id === selectedRequest)!.fulfillment_date}
                  />
                  
                  {requests.find(r => r.id === selectedRequest)!.notes && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                      <h3 className="font-medium mb-2">Notes</h3>
                      <p className="text-sm">{requests.find(r => r.id === selectedRequest)!.notes}</p>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-between">
                    {requests.find(r => r.id === selectedRequest)!.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleApproveRequest(selectedRequest)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve Request
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                          onClick={() => handleRejectRequest(selectedRequest)}
                        >
                          Reject Request
                        </Button>
                      </div>
                    )}
                    {requests.find(r => r.id === selectedRequest)!.status === 'approved' && (
                      <Button 
                        onClick={() => handleFulfillRequest(selectedRequest)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark as Fulfilled
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const request = requests.find(r => r.id === selectedRequest)!;
                        findMatchingDonors({
                          bloodType: request.blood_type,
                          location: request.hospital_name,
                          unitsNeeded: request.units,
                        });
                        setShowDonorMatching(true);
                      }}
                    >
                      Find Matching Donors
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* AI Donor Matching Modal */}
      {selectedRequest && showDonorMatching && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDonorMatching(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">AI Donor Matching</h2>
                  <p className="text-muted-foreground">
                    {requests.find(r => r.id === selectedRequest)?.hospital_name} • {' '}
                    {requests.find(r => r.id === selectedRequest)?.blood_type} • {' '}
                    {requests.find(r => r.id === selectedRequest)?.units} units
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400"
                  onClick={() => setShowDonorMatching(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              {isMatching ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin h-10 w-10 border-2 border-bloodRed-600 rounded-full border-t-transparent mb-4"></div>
                  <p className="text-center text-muted-foreground">Finding compatible donors...</p>
                </div>
              ) : (
                <div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
                      <p className="font-medium">Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  
                  {matchedDonors.length === 0 ? (
                    <div className="text-center py-12">
                      <CircleAlert className="h-12 w-12 mx-auto text-amber-500 mb-3" />
                      <h3 className="text-lg font-medium">No compatible donors found</h3>
                      <p className="text-muted-foreground mt-2">
                        Try expanding your search criteria or check if there are any available donors for this blood type.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <p className="font-medium">Found {matchedDonors.length} potential donors.</p>
                        <p className="text-sm text-muted-foreground">
                          Select donors to notify about this urgent request.
                        </p>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3 text-left">Name</th>
                              <th className="px-4 py-3 text-left">Blood Type</th>
                              <th className="px-4 py-3 text-left">Last Donation</th>
                              <th className="px-4 py-3 text-left">Distance</th>
                              <th className="px-4 py-3 text-left">Score</th>
                              <th className="px-4 py-3 text-left">Eligibility</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matchedDonors.map((donor) => (
                              <tr key={donor.id} className="border-t hover:bg-muted/50">
                                <td className="px-4 py-3">
                                  <div className="font-medium">{donor.name}</div>
                                  {donor.email && (
                                    <div className="text-xs text-muted-foreground">{donor.email}</div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-mono">{donor.bloodType}</span>
                                </td>
                                <td className="px-4 py-3">
                                  {donor.lastDonation === 'Never' 
                                    ? <span className="text-green-600">Never donated</span> 
                                    : new Date(donor.lastDonation).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  {donor.distance ? `${donor.distance} km` : 'Unknown'}
                                </td>
                                <td className="px-4 py-3">
                                  {donor.score}
                                </td>
                                <td className="px-4 py-3">
                                  {donor.eligibilityLevel === 'high' && (
                                    <span className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">High</span>
                                  )}
                                  {donor.eligibilityLevel === 'medium' && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs py-1 px-2 rounded-full">Medium</span>
                                  )}
                                  {donor.eligibilityLevel === 'low' && (
                                    <span className="bg-red-100 text-red-800 text-xs py-1 px-2 rounded-full">Low</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-6 flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setShowDonorMatching(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-bloodRed-600 hover:bg-bloodRed-700"
                          onClick={() => handleNotifySelectedDonors(matchedDonors.map(d => d.id))}
                        >
                          Notify All Donors
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalRequestDashboard;
