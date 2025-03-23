
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, UserPlus, Check, X, Filter } from "lucide-react";

interface Donor {
  id: number;
  name: string;
  email: string;
  bloodType: string;
  status: 'active' | 'pending' | 'inactive';
  lastDonation: string;
}

export const DonorManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [donors, setDonors] = useState<Donor[]>([
    { id: 1, name: "John Smith", email: "john@example.com", bloodType: "O+", status: "active", lastDonation: "2023-05-15" },
    { id: 2, name: "Maria Garcia", email: "maria@example.com", bloodType: "AB+", status: "pending", lastDonation: "2023-06-22" },
    { id: 3, name: "David Lee", email: "david@example.com", bloodType: "B-", status: "pending", lastDonation: "2023-04-10" },
    { id: 4, name: "Sarah Johnson", email: "sarah@example.com", bloodType: "A+", status: "active", lastDonation: "2023-06-05" },
    { id: 5, name: "Michael Brown", email: "michael@example.com", bloodType: "O-", status: "inactive", lastDonation: "2023-03-20" }
  ]);

  const handleApprove = (id: number) => {
    setDonors(donors.map(donor => 
      donor.id === id ? { ...donor, status: 'active' } : donor
    ));
    toast.success("Donor approved successfully");
  };

  const handleReject = (id: number) => {
    setDonors(donors.map(donor => 
      donor.id === id ? { ...donor, status: 'inactive' } : donor
    ));
    toast.error("Donor rejected");
  };

  const filteredDonors = donors.filter(donor => 
    donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" className="h-9">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Donor
          </Button>
        </div>
      </div>

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
    </div>
  );
};
