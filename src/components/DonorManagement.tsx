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
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Update the status type to match what's actually in the database
type DonorStatus = 'active' | 'inactive' | 'pending';

interface Donor {
  id: string;
  name: string;
  email: string;
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  status: DonorStatus;
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
  const queryClient = useQueryClient();

  const [newDonor, setNewDonor] = useState({
    name: '',
    email: '',
    bloodType: '',
    phone: '',
    address: '',
    age: '',
  });
  
  // Fetch donors from Supabase
  const { data: donors = [], isLoading } = useQuery({
    queryKey: ['donors'],
    queryFn: async () => {
      // First get donor profiles
      const { data: donorData, error } = await supabase
        .from('donor_profiles')
        .select(`
          id,
          user_id,
          blood_type,
          last_donation_date,
          eligible_to_donate,
          medical_history
        `);
        
      if (error) {
        console.error("Error fetching donors:", error);
        toast.error("Failed to load donor data");
        return [];
      }
      
      // Then get profile information for each user_id
      const donorsWithProfiles = await Promise.all(
        donorData.map(async (donor) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', donor.user_id)
            .single();
          
          const firstName = profileData?.first_name || '';
          const lastName = profileData?.last_name || '';
          const name = `${firstName} ${lastName}`.trim() || 'Unknown';
          
          // Safely handle medical history
          let age: number | undefined = undefined;
          if (donor.medical_history && typeof donor.medical_history === 'object') {
            // Safely access 'age' property
            const history = donor.medical_history as Record<string, any>;
            age = typeof history.age === 'number' ? history.age : undefined;
          }
          
          // Set the status based on eligible_to_donate, using the correct status type
          // Map eligible_to_donate to 'active' or 'inactive' - no longer using 'pending'
          const status: DonorStatus = donor.eligible_to_donate ? 'active' : 'inactive';
          
          return {
            id: donor.id,
            name: name,
            email: profileData?.email || 'N/A',
            bloodType: donor.blood_type as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
            status: status,
            lastDonation: donor.last_donation_date ? new Date(donor.last_donation_date).toISOString().split('T')[0] : 'N/A',
            phone: profileData?.phone || 'N/A',
            address: 'N/A', // Not stored in the current schema
            age: age,
            medicalHistory: JSON.stringify(donor.medical_history || {}) || 'None'
          };
        })
      );
      
      return donorsWithProfiles;
    }
  });

  // Update donor status mutation
  const updateDonorStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('donor_profiles')
        .update({ 
          eligible_to_donate: status === 'active'
        })
        .eq('id', id);
        
      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
    onError: (error) => {
      console.error("Error updating donor status:", error);
      toast.error("Failed to update donor status");
    }
  });

  // Add new donor mutation
  const addDonor = useMutation({
    mutationFn: async (donor: any) => {
      // Generate a UUID for the user
      const userId = crypto.randomUUID();
      
      // First create a profile with UUID
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: donor.name.split(' ')[0],
          last_name: donor.name.split(' ').slice(1).join(' '),
          email: donor.email,
          phone: donor.phone || null
        });
        
      if (profileError) throw profileError;
      
      // Then create donor profile
      const { error: donorError } = await supabase
        .from('donor_profiles')
        .insert({
          user_id: userId,
          blood_type: donor.bloodType as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
          eligible_to_donate: true,
          medical_history: donor.age ? { age: parseInt(donor.age) } : null
        });
        
      if (donorError) throw donorError;
      
      return donor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      setIsAddingDonor(false);
      toast.success("New donor added successfully");
      
      // Reset form
      setNewDonor({
        name: '',
        email: '',
        bloodType: '',
        phone: '',
        address: '',
        age: '',
      });
    },
    onError: (error) => {
      console.error("Error adding new donor:", error);
      toast.error("Failed to add new donor");
    }
  });

  const handleApprove = (id: string) => {
    updateDonorStatus.mutate({ id, status: 'active' });
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

  const handleReject = (id: string) => {
    updateDonorStatus.mutate({ id, status: 'inactive' });
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
    
    addDonor.mutate(newDonor);
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
    const matchesStatus = !filterStatus || filterStatus === 'all' || donor.status === filterStatus;
    
    // Filter by blood type
    const matchesBloodType = !filterBloodType || filterBloodType === 'all' || donor.bloodType === filterBloodType;
    
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading donor data...
                </TableCell>
              </TableRow>
            ) : filteredDonors.length > 0 ? (
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
                        : donor.status === 'inactive'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                    }`}>
                      {donor.status.charAt(0).toUpperCase() + donor.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{donor.lastDonation}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {/* Add approve/reject buttons for all donors, regardless of status */}
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
            <Button onClick={handleAddDonor} disabled={addDonor.isPending}>
              {addDonor.isPending ? "Adding..." : "Add Donor"}
            </Button>
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
                          : selectedDonor.status === 'inactive'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
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
