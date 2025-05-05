
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Hospital, CalendarIcon, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const DonorAppointment = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [donorId, setDonorId] = useState<string>("");
  const [bloodType, setBloodType] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch donation centers
  const { data: bloodCenters = [] } = useQuery({
    queryKey: ['donationCenters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donation_centers')
        .select('id, name');
        
      if (error) {
        console.error("Error fetching donation centers:", error);
        toast.error("Failed to load donation centers");
        return [];
      }
      
      return data;
    }
  });

  // Get current user and their donor profile
  const { data: userDonorProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['currentDonorProfile'],
    queryFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return null;
      }
      
      // Get donor profile
      const { data: donorProfile, error: donorError } = await supabase
        .from('donor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (donorError && donorError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error fetching donor profile:", donorError);
        return null;
      }
      
      setDonorId(donorProfile?.id || '');
      setBloodType(donorProfile?.blood_type || '');
      
      return {
        userId: user.id,
        profile,
        donorProfile
      };
    }
  });

  // Fetch existing appointments for this user
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', userDonorProfile?.donorProfile?.id],
    enabled: !!userDonorProfile?.donorProfile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donation_appointments')
        .select(`
          id,
          appointment_date,
          time_slot,
          status,
          centers:center_id (
            name
          )
        `)
        .eq('donor_id', userDonorProfile.donorProfile.id)
        .order('appointment_date', { ascending: false });
        
      if (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
        return [];
      }
      
      return data.map(appt => ({
        id: appt.id,
        date: new Date(appt.appointment_date).toISOString().split('T')[0],
        formattedDate: format(new Date(appt.appointment_date), "MMMM d, yyyy"),
        location: appt.centers?.name || 'Unknown',
        timeSlot: appt.time_slot,
        status: appt.status
      }));
    }
  });

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async () => {
      if (!date || !location || !timeSlot || !donorId) {
        throw new Error("Required information is missing");
      }
      
      // Create appointment
      const { data, error } = await supabase
        .from('donation_appointments')
        .insert({
          donor_id: donorId,
          center_id: location,
          appointment_date: date.toISOString(),
          time_slot: timeSlot,
          status: 'scheduled'
        })
        .select();
        
      if (error) throw error;
      
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      
      // Reset form
      setDate(undefined);
      setLocation("");
      setTimeSlot("");
      
      // Show success message
      toast.success("Appointment scheduled successfully!");
      
      // Dispatch a custom event for the Dashboard to reload appointments
      window.dispatchEvent(new CustomEvent('appointmentScheduled', { 
        detail: {
          id: data.id,
          date: format(new Date(data.appointment_date), "yyyy-MM-dd"),
          formattedDate: format(new Date(data.appointment_date), "MMMM d, yyyy"),
          location: bloodCenters.find(c => c.id === data.center_id)?.name,
          timeSlot: data.time_slot,
          status: data.status
        }
      }));
    },
    onError: (error) => {
      console.error("Error scheduling appointment:", error);
      toast.error("Failed to schedule appointment");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !location || !timeSlot) {
      toast.error("Please fill in all fields", {
        description: "All fields are required to schedule an appointment."
      });
      return;
    }
    
    if (!donorId) {
      toast.error("You must be registered as a donor", {
        description: "Please complete your donor profile first."
      });
      return;
    }
    
    createAppointment.mutate();
  };

  // Generate time slots
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", 
    "12:00 PM", "01:00 PM", "02:00 PM", 
    "03:00 PM", "04:00 PM", "05:00 PM"
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a Donation Appointment</CardTitle>
        <CardDescription>Select your preferred date, time and location</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Donation Center</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location" className="w-full">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {bloodCenters.map((center) => (
                  <SelectItem key={center.id} value={center.id}>
                    <div className="flex items-center">
                      <Hospital className="h-4 w-4 mr-2" />
                      {center.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Appointment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!date && 'text-muted-foreground'}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => {
                    // Disable dates in the past and more than 30 days in the future
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 30);
                    
                    return date < today || date > maxDate;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeSlot">Time Slot</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot} disabled={!date}>
              <SelectTrigger id="timeSlot" className="w-full">
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-bloodRed-600 hover:bg-bloodRed-700 mt-4"
            disabled={createAppointment.isPending || !date || !location || !timeSlot || !donorId}
          >
            {createAppointment.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Schedule Appointment'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col text-sm text-gray-500 border-t pt-4">
        <div className="flex items-start mb-2">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p>You can cancel or reschedule up to 24 hours before your appointment.</p>
        </div>
        <div className="flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p>Please bring a valid ID and arrive 15 minutes before your appointment.</p>
        </div>
      </CardFooter>
    </Card>
  );
};
