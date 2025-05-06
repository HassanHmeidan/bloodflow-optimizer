import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Check, ChevronsUpDown, UserPlus, UserMinus, UserCheck, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DonorStatus, AppointmentStatus } from "@/types/status";

export const DonorManagement = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [bloodType, setBloodType] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [donorId, setDonorId] = useState<string>("");
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [medicalHistory, setMedicalHistory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch donors
  const { data: donors = [], isLoading: loadingDonors } = useQuery({
    queryKey: ['donors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donor_profiles')
        .select(`
          id,
          blood_type,
          last_donation_date,
          eligible_to_donate,
          medical_history,
          user_id,
          profiles (
            first_name,
            last_name,
            email
          )
        `);
        
      if (error) {
        console.error("Error fetching donors:", error);
        toast.error("Failed to load donors");
        return [];
      }
      
      return data.map(donor => ({
        id: donor.id,
        name: donor.profiles?.first_name + ' ' + donor.profiles?.last_name,
        email: donor.profiles?.email,
        bloodType: donor.blood_type,
        lastDonationDate: donor.last_donation_date ? format(new Date(donor.last_donation_date), 'MMMM dd, yyyy') : 'Never',
        eligibleToDonate: donor.eligible_to_donate,
        medicalHistory: donor.medical_history,
        userId: donor.user_id,
        status: donor.eligible_to_donate ? 'active' : 'inactive' // derive status from eligibility
      }));
    }
  });

  // Create donor mutation
  const createDonor = useMutation({
    mutationFn: async () => {
      if (!name || !email || !bloodType) {
        throw new Error("Required information is missing");
      }
      
      // Get user
      let { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
        
      if (!existingUser) {
        toast.error("User not found", {
          description: "Please register the user first."
        });
        return;
      }
      
      // Create donor profile
      const { data, error } = await supabase
        .from('donor_profiles')
        .insert({
          user_id: existingUser.id,
          blood_type: bloodType,
          eligible_to_donate: isEligible,
          medical_history: medicalHistory ? JSON.parse(medicalHistory) : null
        })
        .select();
        
      if (error) throw error;
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      
      // Reset form
      setName("");
      setEmail("");
      setBloodType("");
      setIsEligible(false);
      setMedicalHistory("");
      
      // Show success message
      toast.success("Donor created successfully!");
    },
    onError: (error) => {
      console.error("Error creating donor:", error);
      toast.error("Failed to create donor");
    }
  });

  // Update donor mutation
  const updateDonor = useMutation({
    mutationFn: async () => {
      if (!donorId) {
        throw new Error("Donor ID is missing");
      }
      
      // Update donor profile
      const { error } = await supabase
        .from('donor_profiles')
        .update({
          blood_type: bloodType,
          eligible_to_donate: isEligible,
          medical_history: medicalHistory ? JSON.parse(medicalHistory) : null
        })
        .eq('id', donorId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      
      // Reset form
      setName("");
      setEmail("");
      setBloodType("");
      setIsEligible(false);
      setMedicalHistory("");
      
      // Show success message
      toast.success("Donor updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating donor:", error);
      toast.error("Failed to update donor");
    }
  });

  // Delete donor mutation
  const deleteDonor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('donor_profiles')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      
      // Reset form
      setName("");
      setEmail("");
      setBloodType("");
      setIsEligible(false);
      setMedicalHistory("");
      
      // Show success message
      toast.success("Donor deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting donor:", error);
      toast.error("Failed to delete donor");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (donorId) {
      updateDonor.mutate();
    } else {
      createDonor.mutate();
    }
  };

  const handleEdit = (donor: any) => {
    setDonorId(donor.id);
    setName(donor.name);
    setEmail(donor.email);
    setBloodType(donor.bloodType);
    setIsEligible(donor.eligibleToDonate);
    setMedicalHistory(JSON.stringify(donor.medicalHistory));
    setUserId(donor.userId);
    setStatus(donor.status);
  };

  const handleDelete = (id: string) => {
    deleteDonor.mutate(id);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Donor Management</CardTitle>
        <CardDescription>Create, update, and manage donor profiles</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter name" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter email" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bloodType">Blood Type</Label>
            <Select value={bloodType} onValueChange={setBloodType}>
              <SelectTrigger id="bloodType">
                <SelectValue placeholder="Select blood type" />
              </SelectTrigger>
              <SelectContent>
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
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="isEligible">Eligible to Donate</Label>
            <Input 
              type="checkbox"
              id="isEligible"
              checked={isEligible}
              onChange={(e) => setIsEligible(e.target.checked)}
              className="w-5 h-5"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History (JSON)</Label>
            <Input
              type="text"
              id="medicalHistory"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder='Enter medical history in JSON format, e.g., {"allergies": "pollen", "medications": "none"}'
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-bloodRed-600 hover:bg-bloodRed-700 mt-4"
            disabled={createDonor.isPending || updateDonor.isPending}
          >
            {createDonor.isPending || updateDonor.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              donorId ? 'Update Donor' : 'Create Donor'
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter>
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Donation</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingDonors ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center">
                    Loading donors...
                  </td>
                </tr>
              ) : (
                donors.map((donor) => (
                  <tr key={donor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donor.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.bloodType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.lastDonationDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donor.status === "pending" ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          <Clock className="mr-1.5 h-4 w-4" />
                          Pending
                        </span>
                      ) : (donor.status as unknown) === "active" || (donor.status as unknown) === "inactive" ? (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${donor.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {donor.status === "active" ? <UserCheck className="mr-1.5 h-4 w-4" /> : <UserX className="mr-1.5 h-4 w-4" />}
                          {donor.status === "active" ? "Active" : "Inactive"}
                        </span>
                      ) : (
                        <span>{donor.status}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(donor)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(donor.id)}>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardFooter>
    </Card>
  );
};

import { CalendarIcon, Check, Clock, Hospital } from "lucide-react";
