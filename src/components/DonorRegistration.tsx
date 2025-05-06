
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from 'sonner';
import { CalendarIcon, Check, User, UserCheck, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

// Define form schema with Zod
const donorFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required.",
  }).refine((date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  }, { message: "Donor must be at least 18 years old." }),
  gender: z.string({
    required_error: "Please select a gender.",
  }),
  bloodType: z.string({
    required_error: "Please select a blood type.",
  }),
  weight: z.string().refine((val) => {
    const weight = parseFloat(val);
    return !isNaN(weight) && weight >= 50;
  }, { message: "Weight must be at least 50kg." }),
  previousDonation: z.enum(["yes", "no"], {
    required_error: "Please select an option.",
  }),
  lastDonationDate: z.date().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  agreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions.",
  }),
});

type DonorFormValues = z.infer<typeof donorFormSchema>;

export const DonorRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<DonorFormValues>({
    resolver: zodResolver(donorFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      bloodType: "",
      weight: "",
      previousDonation: "no",
      agreement: false,
    },
  });
  
  const onSubmit = async (values: DonorFormValues) => {
    setIsSubmitting(true);
    
    try {
      // First check if user already exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', values.email)
        .single();
      
      let userId;
      
      if (existingProfile) {
        userId = existingProfile.id;
        
        // Update the profile
        await supabase
          .from('profiles')
          .update({
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
          })
          .eq('id', userId);
      } else {
        // Create a new auth user first (this is a simplified approach)
        // In a real app, this would be done through the auth signup flow
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
            email: values.email,
          })
          .select();
        
        if (profileError) throw profileError;
        userId = newProfile[0].id;
      }
      
      // Check if donor profile already exists
      const { data: existingDonor } = await supabase
        .from('donor_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      // Medical history in JSON format
      const medicalHistory = {
        weight: parseFloat(values.weight),
        gender: values.gender,
        medical_conditions: values.medicalConditions || "",
        medications: values.medications || "",
      };
      
      if (existingDonor) {
        // Update existing donor profile
        await supabase
          .from('donor_profiles')
          .update({
            blood_type: values.bloodType,
            last_donation_date: values.lastDonationDate ? values.lastDonationDate.toISOString() : null,
            medical_history: medicalHistory,
          })
          .eq('id', existingDonor.id);
      } else {
        // Create new donor profile
        await supabase
          .from('donor_profiles')
          .insert({
            user_id: userId,
            blood_type: values.bloodType as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
            last_donation_date: values.lastDonationDate ? values.lastDonationDate.toISOString() : null,
            eligible_to_donate: true, // Set to true initially, will be verified by staff
            medical_history: medicalHistory,
          });
      }
      
      toast.success("Registration successful!", {
        description: "Thank you for registering as a donor.",
      });
      
      // Reset the form
      form.reset();
      setCurrentStep(1);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const nextStep = () => {
    // Validate current step fields
    if (currentStep === 1) {
      form.trigger(["firstName", "lastName", "email", "phone", "dateOfBirth", "gender"]);
      
      if (
        form.formState.errors.firstName ||
        form.formState.errors.lastName ||
        form.formState.errors.email ||
        form.formState.errors.phone ||
        form.formState.errors.dateOfBirth ||
        form.formState.errors.gender
      ) {
        return;
      }
    } else if (currentStep === 2) {
      form.trigger(["bloodType", "weight", "previousDonation"]);
      if (form.getValues("previousDonation") === "yes") {
        form.trigger(["lastDonationDate"]);
      }
      
      if (
        form.formState.errors.bloodType ||
        form.formState.errors.weight ||
        form.formState.errors.previousDonation ||
        (form.getValues("previousDonation") === "yes" && form.formState.errors.lastDonationDate)
      ) {
        return;
      }
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };
  
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  
  const watchPreviousDonation = form.watch("previousDonation");
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Donor Registration</CardTitle>
        <CardDescription>Join our blood donor community and help save lives</CardDescription>
        
        <div className="relative mt-6">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div 
              className="bg-bloodRed-600 h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between mt-2">
            <div className={`flex flex-col items-center`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-bloodRed-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <User size={16} />
              </div>
              <span className="text-xs mt-1">Personal Info</span>
            </div>
            <div className={`flex flex-col items-center`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-bloodRed-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <FileText size={16} />
              </div>
              <span className="text-xs mt-1">Medical Info</span>
            </div>
            <div className={`flex flex-col items-center`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-bloodRed-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <UserCheck size={16} />
              </div>
              <span className="text-xs mt-1">Confirmation</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
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
                                  format(field.value, "MMMM dd, yyyy")
                                ) : (
                                  <span>Select your date of birth</span>
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
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDER_OPTIONS.map((gender) => (
                              <SelectItem key={gender} value={gender}>
                                {gender}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your blood type" />
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
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your weight in kg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="previousDonation"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Have you donated blood before?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="no" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {watchPreviousDonation === "yes" && (
                  <FormField
                    control={form.control}
                    name="lastDonationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Last Donation Date</FormLabel>
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
                                  format(field.value, "MMMM dd, yyyy")
                                ) : (
                                  <span>Select your last donation date</span>
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
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="medicalConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="List any medical conditions" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Medications (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="List any medications you're currently taking" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Summary of Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p>{form.getValues("firstName")} {form.getValues("lastName")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact</p>
                      <p>{form.getValues("email")}</p>
                      <p>{form.getValues("phone")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Blood Type</p>
                      <p>{form.getValues("bloodType")}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Previous Donor</p>
                      <p>{form.getValues("previousDonation") === "yes" ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-medium text-amber-800 mb-2">Important Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-amber-700 text-sm">
                    <li>You must be at least 18 years old and weigh at least 50kg to donate blood.</li>
                    <li>You must wait at least 56 days between whole blood donations.</li>
                    <li>Please bring a valid ID when you come to donate.</li>
                    <li>A medical professional will perform a brief health screening before your donation.</li>
                  </ul>
                </div>
                
                <FormField
                  control={form.control}
                  name="agreement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4 mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I confirm that all provided information is accurate, and I consent to be contacted about donation opportunities.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {currentStep > 1 && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStep}
          >
            Previous
          </Button>
        )}
        
        {currentStep < 3 ? (
          <Button 
            type="button" 
            onClick={nextStep}
            className="ml-auto"
          >
            Next
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)}
            className="ml-auto bg-bloodRed-600 hover:bg-bloodRed-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Complete Registration
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DonorRegistration;
