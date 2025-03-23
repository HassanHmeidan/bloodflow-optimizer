
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

const bloodCenters = [
  "Central Blood Bank",
  "Downtown Medical Center",
  "University Hospital",
  "Community Blood Center",
  "Metro Blood Services"
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", 
  "03:00 PM", "04:00 PM", "05:00 PM"
];

export const DonorAppointment = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Load existing appointments from localStorage with user-specific key
  useEffect(() => {
    const userId = localStorage.getItem('authToken');
    const savedAppointments = localStorage.getItem(`appointments_${userId}`);
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !location || !timeSlot) {
      toast.error("Please fill in all fields", {
        description: "All fields are required to schedule an appointment."
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate an API call to our Python backend
    setTimeout(() => {
      try {
        const userId = localStorage.getItem('authToken');
        
        // Create new appointment object
        const newAppointment = {
          id: Date.now(),
          date: format(date, "yyyy-MM-dd"),
          formattedDate: format(date, "MMMM d, yyyy"),
          location,
          timeSlot,
          status: 'confirmed'
        };
        
        // Update state and localStorage with user-specific key
        const updatedAppointments = [...appointments, newAppointment];
        setAppointments(updatedAppointments);
        localStorage.setItem(`appointments_${userId}`, JSON.stringify(updatedAppointments));
        
        // Show success message
        toast.success("Appointment scheduled successfully!", {
          description: `Your appointment is set for ${format(date, "MMMM d, yyyy")} at ${timeSlot}, ${location}.`
        });
        
        // Reset form
        setDate(undefined);
        setLocation("");
        setTimeSlot("");
        
        // Dispatch a custom event for the Dashboard to reload appointments
        window.dispatchEvent(new CustomEvent('appointmentScheduled', { 
          detail: newAppointment 
        }));
      } catch (error) {
        console.error("Error scheduling appointment:", error);
        toast.error("Failed to schedule appointment", {
          description: "An unexpected error occurred. Please try again."
        });
      } finally {
        setLoading(false);
      }
    }, 1500); // Simulate network delay
  };
  
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
                  <SelectItem key={center} value={center}>
                    <div className="flex items-center">
                      <Hospital className="h-4 w-4 mr-2" />
                      {center}
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
            disabled={loading || !date || !location || !timeSlot}
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
