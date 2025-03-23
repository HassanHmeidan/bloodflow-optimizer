
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, FileText, Check, X, Filter, PlusCircle, Calendar, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface BloodRequest {
  id: number;
  hospital: string;
  date: string;
  bloodType: string;
  units: number;
  urgency: 'normal' | 'urgent' | 'critical';
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  requester?: string;
  contactPhone?: string;
  patientCount?: number;
}

export const BloodRequestForm = () => {
  const [bloodType, setBloodType] = useState('');
  const [units, setUnits] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [notes, setNotes] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-fill hospital name if user is a hospital
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    if (userRole === 'hospital' && userName) {
      setHospitalName(userName);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodType || !units || !hospitalName) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    
    // Get existing requests
    const existingRequests = JSON.parse(localStorage.getItem('bloodRequests') || '[]');
    const newId = existingRequests.length > 0 ? Math.max(...existingRequests.map((r: any) => r.id)) + 1 : 1;
    
    // Create new request
    const newRequest = {
      id: newId,
      hospital: hospitalName,
      date: new Date().toISOString().split('T')[0],
      bloodType,
      units: parseInt(units),
      urgency,
      status: 'pending',
      notes,
      contactPhone,
      requester: localStorage.getItem('userName') || 'Unknown'
    };
    
    // Save to localStorage
    localStorage.setItem('bloodRequests', JSON.stringify([...existingRequests, newRequest]));
    
    // Fire a notification event
    const event = new CustomEvent('notification', { 
      detail: { 
        message: `New blood request submitted: ${units} units of ${bloodType}`, 
        type: 'success' 
      } 
    });
    window.dispatchEvent(event);
    
    setTimeout(() => {
      toast.success("Blood request submitted successfully");
      setBloodType('');
      setUnits('');
      setUrgency('normal');
      setNotes('');
      setContactPhone('');
      setLoading(false);
      
      // Only reset hospital name if not a hospital user
      if (localStorage.getItem('userRole') !== 'hospital') {
        setHospitalName('');
      }
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Blood</CardTitle>
        <CardDescription>Submit a new blood request to the central blood bank</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hospital">Hospital/Clinic Name <span className="text-red-500">*</span></Label>
            <Input 
              id="hospital" 
              value={hospitalName} 
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="Enter hospital or clinic name"
              disabled={localStorage.getItem('userRole') === 'hospital'}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type <span className="text-red-500">*</span></Label>
              <Select value={bloodType} onValueChange={setBloodType} required>
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="units">Units Required <span className="text-red-500">*</span></Label>
              <Input 
                id="units" 
                type="number" 
                value={units} 
                onChange={(e) => setUnits(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger id="urgency">
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input 
                id="contactPhone" 
                value={contactPhone} 
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Emergency contact number"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Input 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or context"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const BloodRequestManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterBloodType, setFilterBloodType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Get requests from localStorage
  const [requests, setRequests] = useState<BloodRequest[]>(() => {
    const storedRequests = localStorage.getItem('bloodRequests');
    if (storedRequests) {
      return JSON.parse(storedRequests);
    }
    
    // Default requests if none exist
    return [
      { id: 1, hospital: "General Hospital", date: "2023-06-15", bloodType: "A+", units: 2, urgency: "normal", status: "pending" },
      { id: 2, hospital: "Children's Medical", date: "2023-06-14", bloodType: "O-", units: 5, urgency: "urgent", status: "approved" },
      { id: 3, hospital: "Metro Emergency Center", date: "2023-06-13", bloodType: "B+", units: 3, urgency: "critical", status: "pending" },
      { id: 4, hospital: "University Hospital", date: "2023-06-12", bloodType: "AB+", units: 1, urgency: "normal", status: "rejected" },
      { id: 5, hospital: "Community Health", date: "2023-06-10", bloodType: "O+", units: 4, urgency: "urgent", status: "approved" }
    ];
  });
  
  // Save requests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bloodRequests', JSON.stringify(requests));
    
    // Also update the admin data in localStorage for the dashboard
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
    adminData.recentRequests = requests.filter(r => r.status === 'pending').slice(0, 2).map(r => ({
      hospital: r.hospital,
      date: r.date,
      type: r.bloodType,
      units: r.units,
      status: r.status
    }));
    
    localStorage.setItem('adminData', JSON.stringify(adminData));
  }, [requests]);

  const handleApprove = (id: number) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'approved' } : request
    ));
    toast.success("Blood request approved");
    
    // Fire a notification event
    const request = requests.find(r => r.id === id);
    const event = new CustomEvent('notification', { 
      detail: { 
        message: `Blood request from ${request?.hospital} for ${request?.units} units of ${request?.bloodType} has been approved`, 
        type: 'success' 
      } 
    });
    window.dispatchEvent(event);
  };

  const handleReject = (id: number) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'rejected' } : request
    ));
    toast.error("Blood request rejected");
    
    // Fire a notification event
    const request = requests.find(r => r.id === id);
    const event = new CustomEvent('notification', { 
      detail: { 
        message: `Blood request from ${request?.hospital} for ${request?.units} units of ${request?.bloodType} has been rejected`, 
        type: 'error' 
      } 
    });
    window.dispatchEvent(event);
  };
  
  const handleViewDetails = (request: BloodRequest) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };
  
  const handleExport = () => {
    setIsExporting(true);
    
    // Create CSV content
    const headers = ["Hospital", "Date", "Blood Type", "Units", "Urgency", "Status", "Requester", "Contact", "Notes"];
    const csvContent = [
      headers.join(','),
      ...requests.map(request => [
        request.hospital.replace(/,/g, ' '),
        request.date,
        request.bloodType,
        request.units,
        request.urgency,
        request.status,
        request.requester || 'N/A',
        request.contactPhone || 'N/A',
        request.notes ? `"${request.notes.replace(/"/g, '""')}"` : 'N/A'
      ].join(','))
    ].join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'blood_requests_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      toast.success("Blood requests exported successfully");
      setIsExporting(false);
    }, 500);
  };

  const filteredRequests = requests.filter(request => {
    // First, filter by user role if it's a hospital
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    if (userRole === 'hospital' && userName) {
      // Only show this hospital's requests
      if (request.hospital !== userName) {
        return false;
      }
    }
    
    // Filter by search query
    const matchesSearch = 
      request.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.status.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = !filterStatus || request.status === filterStatus;
    
    // Filter by blood type
    const matchesBloodType = !filterBloodType || request.bloodType === filterBloodType;
    
    return matchesSearch && matchesStatus && matchesBloodType;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search requests..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            size="sm" 
            className="h-9"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Filter options */}
      {showFilters && (
        <div className="p-4 border rounded-md bg-gray-50 flex flex-wrap gap-4">
          <div className="space-y-1 w-40">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={filterStatus || "all"} onValueChange={setFilterStatus}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 w-40">
            <Label htmlFor="bloodtype-filter">Blood Type</Label>
            <Select value={filterBloodType || "all"} onValueChange={setFilterBloodType}>
              <SelectTrigger id="bloodtype-filter">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setFilterStatus(null);
                setFilterBloodType(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hospital</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Blood Type</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(request => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.hospital}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>
                    <span className="bg-bloodRed-50 text-bloodRed-700 px-2 py-1 rounded text-xs font-medium">
                      {request.bloodType}
                    </span>
                  </TableCell>
                  <TableCell>{request.units}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.urgency === 'normal' 
                        ? 'bg-blue-50 text-blue-700' 
                        : request.urgency === 'urgent'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                    }`}>
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === 'approved' 
                        ? 'bg-green-50 text-green-700' 
                        : request.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {request.status === 'pending' && localStorage.getItem('userRole') === 'admin' && (
                        <>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs"
                        onClick={() => handleViewDetails(request)}
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No requests found matching your search criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Request Details Dialog */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="sm:max-w-md">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Blood Request Details</DialogTitle>
                <DialogDescription>
                  Request from {selectedRequest.hospital} on {selectedRequest.date}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 py-4 px-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Hospital/Clinic</h3>
                      <p>{selectedRequest.hospital}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date Requested</h3>
                      <p>{selectedRequest.date}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                      <p className="inline-flex bg-bloodRed-50 text-bloodRed-700 px-2 py-1 rounded text-xs font-medium">
                        {selectedRequest.bloodType}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Units Requested</h3>
                      <p>{selectedRequest.units}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Urgency</h3>
                      <p className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        selectedRequest.urgency === 'normal' 
                          ? 'bg-blue-50 text-blue-700' 
                          : selectedRequest.urgency === 'urgent'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                      }`}>
                        {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        selectedRequest.status === 'approved' 
                          ? 'bg-green-50 text-green-700' 
                          : selectedRequest.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                      }`}>
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </p>
                    </div>
                    {selectedRequest.requester && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Requested By</h3>
                        <p>{selectedRequest.requester}</p>
                      </div>
                    )}
                    {selectedRequest.contactPhone && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Contact Phone</h3>
                        <p>{selectedRequest.contactPhone}</p>
                      </div>
                    )}
                    {selectedRequest.notes && (
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">Additional Notes</h3>
                        <p>{selectedRequest.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="flex justify-between">
                {selectedRequest.status === 'pending' && localStorage.getItem('userRole') === 'admin' && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleApprove(selectedRequest.id);
                        setShowRequestDetails(false);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleReject(selectedRequest.id);
                        setShowRequestDetails(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
                <DialogClose asChild>
                  <Button variant={selectedRequest.status === 'pending' ? "outline" : "default"}>
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
