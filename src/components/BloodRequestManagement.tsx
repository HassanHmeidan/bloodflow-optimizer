
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, FileText, Check, X, Filter, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface BloodRequest {
  id: number;
  hospital: string;
  date: string;
  bloodType: string;
  units: number;
  urgency: 'normal' | 'urgent' | 'critical';
  status: 'pending' | 'approved' | 'rejected';
}

export const BloodRequestForm = () => {
  const [bloodType, setBloodType] = useState('');
  const [units, setUnits] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodType || !units) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Blood request submitted successfully");
      setBloodType('');
      setUnits('');
      setUrgency('normal');
      setNotes('');
      setLoading(false);
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
  const [requests, setRequests] = useState<BloodRequest[]>([
    { id: 1, hospital: "General Hospital", date: "2023-06-15", bloodType: "A+", units: 2, urgency: "normal", status: "pending" },
    { id: 2, hospital: "Children's Medical", date: "2023-06-14", bloodType: "O-", units: 5, urgency: "urgent", status: "approved" },
    { id: 3, hospital: "Metro Emergency Center", date: "2023-06-13", bloodType: "B+", units: 3, urgency: "critical", status: "pending" },
    { id: 4, hospital: "University Hospital", date: "2023-06-12", bloodType: "AB+", units: 1, urgency: "normal", status: "rejected" },
    { id: 5, hospital: "Community Health", date: "2023-06-10", bloodType: "O+", units: 4, urgency: "urgent", status: "approved" }
  ]);

  const handleApprove = (id: number) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'approved' } : request
    ));
    toast.success("Blood request approved");
  };

  const handleReject = (id: number) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'rejected' } : request
    ));
    toast.error("Blood request rejected");
  };

  const filteredRequests = requests.filter(request => 
    request.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" className="h-9">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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
                      {request.status === 'pending' && (
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
    </div>
  );
};
