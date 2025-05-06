
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

import {
  Card,
  CardContent,
  CardDescription,
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import {
  Hospital,
  BloodType,
  PriorityLevel,
  RequestFormValues
} from '@/types/status';
import { cn } from '@/lib/utils';

// Define blood types and priority levels for display purposes
const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PRIORITY_LEVELS: PriorityLevel[] = ["low", "medium", "high", "critical"];

// Priority display mapping for UI
const PRIORITY_DISPLAY: Record<PriorityLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

// Define the form schema
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
  priority: z.enum(PRIORITY_LEVELS, {
    required_error: "Please select a priority level.",
  }),
  requiredBy: z.date({
    required_error: "Please select a required date.",
  }),
  notes: z.string().optional(),
});

interface RequestFormProps {
  hospitals: Hospital[];
  onRequestSubmitted: (requestId: string, priority: PriorityLevel, bloodType: BloodType, units: number, hospitalId: string) => void;
}

export const RequestForm = ({ hospitals, onRequestSubmitted }: RequestFormProps) => {
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      notes: "",
    },
  });

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
        onRequestSubmitted(result[0].id, data.priority, data.bloodType, parseInt(data.units), data.hospitalId);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request");
    }
  };

  return (
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
                          <SelectItem key={priority} value={priority}>
                            {PRIORITY_DISPLAY[priority]}
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
                          className="p-3 pointer-events-auto"
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
  );
};

export default RequestForm;
