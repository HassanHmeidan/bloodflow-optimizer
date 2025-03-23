
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, UserCheck, X, AlertCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Appointment {
  id: number;
  date: string;
  formattedDate: string;
  location: string;
  timeSlot: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'missed';
}

export const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load appointments from localStorage
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
    setLoading(false);
    
    // Listen for new appointments
    const handleNewAppointment = (event: CustomEvent) => {
      const newAppointment = event.detail;
      setAppointments(prev => [...prev, newAppointment]);
    };

    window.addEventListener('appointmentScheduled' as any, handleNewAppointment);
    
    return () => {
      window.removeEventListener('appointmentScheduled' as any, handleNewAppointment);
    };
  }, []);

  const handleCancel = (id: number) => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === id ? { ...appointment, status: 'cancelled' as const } : appointment
    );
    
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    
    toast.success("Appointment cancelled successfully");
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirmed':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      case 'missed':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'missed':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
          <CardDescription>Your donation appointments</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-3"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment History</CardTitle>
        <CardDescription>Track all your donation appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        {appointment.formattedDate || appointment.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        {appointment.timeSlot}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        {appointment.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="capitalize">{appointment.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {appointment.status === 'confirmed' && (
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-sm"
                          >
                            Reschedule
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-sm text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleCancel(appointment.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {(appointment.status === 'completed' || appointment.status === 'missed' || appointment.status === 'cancelled') && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-sm"
                        >
                          View Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No appointments yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              You haven't scheduled any donation appointments yet. 
              Schedule your first appointment to start saving lives!
            </p>
            <Button>Schedule Appointment</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
