
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, UserPlus, Check, X, Filter, Info } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Donor {
  id: number;
  name: string;
  email: string;
  bloodType: string;
  status: 'active' | 'pending' | 'inactive';
  lastDonation: string;
  phone?: string;
  address?: string;
  age?: number;
  medicalHistory?: string;
}

export const DonorManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterBloodType, setFilterBloodType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddingDonor, setIsAddingDonor] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showDonorDetails, setShowDonorDetails] = useState(false);

  const [newDonor, setNewDonor] = useState({
    name: '',
    email: '',
    bloodType: '',
    phone: '',
    address: '',
    age: '',
  });
  
  // Get admin data from localStorage to share between components
  const [donors, setDonors] = useState<Donor[]>(() => {
    const storedDonors = localStorage.getItem('adminDonors');
    if (storedDonors) {
      return JSON.parse(storedDonors);
    }
    
    // Default donors if none exist in localStorage
    return [
      { id: 1, name: "John Smith", email: "john@example.com", bloodType: "O+", status: "active", lastDonation: "2023-05-15", phone: "555-123-4567", address: "123 Main St", age: 35 },
      { id: 2, name: "Maria Garcia", email: "maria@example.com", bloodType: "AB+", status: "pending", lastDonation: "2023-06-22", phone: "555-234-5678", address: "456 Oak Ave", age: 29 },
      { id: 3, name: "David Lee", email: "david@example.com", bloodType: "B-", status: "pending", lastDonation: "2023-04-10", phone: "555-345-6789", address: "789 Pine Rd", age: 42 },
      { id: 4, name: "Sarah Johnson", email: "sarah@example.com", bloodType: "A+", status: "active", lastDonation: "2023-06-05", phone: "555-456-7890", address: "101 Cedar Ln", age: 31 },
      { id: 5, name: "Michael Brown", email: "michael@example.com", bloodType: "O-", status: "inactive", lastDonation: "2023-03-20", phone: "555-567-8901", address: "202 Elm St", age: 47 }
    ];
  });

  // Save donors to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminDonors', JSON.stringify(donors));
    
    // Also update the admin data in localStorage for the dashboard
    const adminData = {
      totalDonors: donors.length,
      totalRequests: 86,
      pendingApprovals: donors.filter(d => d.status === 'pending').length,
      lowStockAlerts: 3,
      recentDonors: donors.filter(d => d.status === 'pending').slice(0, 3).map(d => ({
        name: d.name,
        date: d.lastDonation,
        type: d.bloodType,
        status: d.status
      })),
      recentRequests: [
        { hospital: 'General Hospital', date: '2023-06-15', type: 'A+', units: 2, status: 'pending' },
        { hospital: 'Children\'s Medical', date: '2023-06-14', type: 'O-', units: 5, status: 'approved' },
      ]
    };
    
    localStorage.setItem('adminData', JSON.stringify(adminData));
  }, [donors]);

  const handleApprove = (id: number) => {
    setDonors(donors.map(donor => 
      donor.id === id ? { ...donor, status: 'active' } : donor
    ));
    toast.success("Donor approved successfully");
    
    // Fire a notification event
    const event = new CustomEvent('notification', { 
      detail: { 
        message: `Donor ${donors.find(d => d.id === id)?.name} has been approved`, 
        type: 'success' 
      } 
    });
    window.dispatchEvent(event);
  };

  const handleReject = (id: number) => {
    setDonors(donors.map(donor => 
      donor.id === id ? { ...donor, status: 'inactive' } : donor
    ));
    toast.error("Donor rejected");
    
    // Fire a notification event
    const event = new CustomEvent('notification', { 
      detail: { 
        message: `Donor ${donors.find(d => d.id === id)?.name} has been rejected`, 
        type: 'error' 
      } 
    });
    window.dispatchEvent(event);
  };

  const handleAddDonor = () => {
    if (!newDonor.name || !newDonor.email || !newDonor.bloodType) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const newId = donors.length > 0 ? Math.max(...donors.map(d => d.id)) + 1 : 1;
    
    const donor: Donor = {
      id: newId,
      name: newDonor.name,
      email: newDonor.email,
      bloodType: newDonor.bloodType,
      status: 'pending',
      lastDonation: 'N/A',
      phone: newDonor.phone,
      address: newDonor.address,
      age: parseInt(newDonor.age) || undefined
    };
    
    setDonors([...donors, donor]);
    setIsAddingDonor(false);
    
    // Reset form
    setNewDonor({
      name: '',
      email: '',
      bloodType: '',
      phone: '',
      address: '',
      age: '',
    });
    
    toast.success("New donor added successfully");
    
    // Fire a notification event
    const event = new CustomEvent('notification', { 
      detail: { 
        message: `New donor ${newDonor.name} has been added`, 
        type: 'success' 
      } 
    });
    window.dispatchEvent(event);
  };

  const handleViewDetails = (donor: Donor) => {
    setSelectedDonor(donor);
    setShowDonorDetails(true);
  };
  
  const handleExport = () => {
    // Create CSV content
    const headers = ["Name", "Email", "Blood Type", "Status", "Last Donation", "Phone", "Address", "Age"];
    const csvContent = [
      headers.join(','),
      ...donors.map(donor => [
        donor.name,
        donor.email,
        donor.bloodType,
        donor.status,
        donor.lastDonation,
        donor.phone || 'N/A',
        donor.address ? `"${donor.address.replace(/"/g, '""')}"` : 'N/A',
        donor.age || 'N/A'
      ].join(','))
    ].join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'donors_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Donors data exported successfully");
  };

  const filteredDonors = donors.filter(donor => {
    // Filter by search query
    const matchesSearch = 
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = !filterStatus || donor.status === filterStatus;
    
    // Filter by blood type
    const matchesBloodType = !filterBloodType || donor.bloodType === filterBloodType;
    
    return matchesSearch && matchesStatus && matchesBloodType;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search donors..."
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
            variant="outline"
            size="sm" 
            className="h-9"
            onClick={handleExport}
          >
            Export
          </Button>
          <Button 
            size="sm" 
            className="h-9"
            onClick={() => setIsAddingDonor(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Donor
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Blood Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Donation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDonors.length > 0 ? (
              filteredDonors.map(donor => (
                <TableRow key={donor.id}>
                  <TableCell className="font-medium">{donor.name}</TableCell>
                  <TableCell>{donor.email}</TableCell>
                  <TableCell>
                    <span className="bg-bloodRed-50 text-bloodRed-700 px-2 py-1 rounded text-xs font-medium">
                      {donor.bloodType}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      donor.status === 'active' 
                        ? 'bg-green-50 text-green-700' 
                        : donor.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                    }`}>
                      {donor.status.charAt(0).toUpperCase() + donor.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{donor.lastDonation}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {donor.status === 'pending' && (
                        <>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleApprove(donor.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleReject(donor.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs"
                        onClick={() => handleViewDetails(donor)}
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No donors found matching your search criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Add Donor Dialog */}
      <Dialog open={isAddingDonor} onOpenChange={setIsAddingDonor}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Donor</DialogTitle>
            <DialogDescription>
              Enter the details of the new donor. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  value={newDonor.name} 
                  onChange={(e) => setNewDonor({...newDonor, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={newDonor.email} 
                  onChange={(e) => setNewDonor({...newDonor, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type *</Label>
                <Select 
                  value={newDonor.bloodType} 
                  onValueChange={(value) => setNewDonor({...newDonor, bloodType: value})}
                >
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={newDonor.phone} 
                  onChange={(e) => setNewDonor({...newDonor, phone: e.target.value})}
                  placeholder="555-123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={newDonor.address} 
                  onChange={(e) => setNewDonor({...newDonor, address: e.target.value})}
                  placeholder="123 Main St, City, State, Zip"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={newDonor.age} 
                  onChange={(e) => setNewDonor({...newDonor, age: e.target.value})}
                  placeholder="30"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddDonor}>Add Donor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Donor Details Dialog */}
      <Dialog open={showDonorDetails} onOpenChange={setShowDonorDetails}>
        <DialogContent className="sm:max-w-md">
          {selectedDonor && (
            <>
              <DialogHeader>
                <DialogTitle>Donor Details</DialogTitle>
                <DialogDescription>
                  Detailed information for {selectedDonor.name}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 py-4 px-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p>{selectedDonor.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p>{selectedDonor.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                      <p className="inline-flex bg-bloodRed-50 text-bloodRed-700 px-2 py-1 rounded text-xs font-medium">
                        {selectedDonor.bloodType}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        selectedDonor.status === 'active' 
                          ? 'bg-green-50 text-green-700' 
                          : selectedDonor.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                      }`}>
                        {selectedDonor.status.charAt(0).toUpperCase() + selectedDonor.status.slice(1)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p>{selectedDonor.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Age</h3>
                      <p>{selectedDonor.age || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Address</h3>
                      <p>{selectedDonor.address || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Last Donation</h3>
                      <p>{selectedDonor.lastDonation}</p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Medical History</h3>
                      <p>{selectedDonor.medicalHistory || 'No medical history available'}</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
