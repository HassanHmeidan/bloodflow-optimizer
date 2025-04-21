
import { toast } from "sonner";
import { supabase } from "./supabase";

type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
type NotificationType = 'email' | 'sms' | 'app';
type NotificationEvent = 'donation' | 'appointment' | 'lowStock' | 'eligibility' | 'request';

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  app: boolean;
  bulkNotifications: boolean;
}

interface NotificationData {
  recipient: string;
  subject?: string;
  message: string;
  event: NotificationEvent;
  bloodType?: BloodType;
  units?: number;
}

// Function to check if the email is valid
const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Real email sending implementation 
const sendRealEmail = async (to: string, subject: string, body: string): Promise<boolean> => {
  try {
    // Get email configuration from Supabase
    const { data: config, error: configError } = await supabase
      .from('email_configuration')
      .select('*')
      .single();
    
    if (configError || !config) {
      console.error("Email configuration not found:", configError);
      return false;
    }

    // Call Supabase Edge Function to send email
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        body,
        from: config.sender_email || 'noreply@blooddonation.com'
      }
    });

    if (error) {
      throw new Error(`Email service error: ${error.message}`);
    }

    console.log("Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Error sending real email:", error);
    return false;
  }
};

// Send email notification
export const sendEmailNotification = async (data: NotificationData): Promise<boolean> => {
  console.log(`Sending email notification to ${data.recipient}`);
  console.log(`Subject: ${data.subject}`);
  console.log(`Message: ${data.message}`);
  
  // Validate email
  if (!isValidEmail(data.recipient)) {
    console.error("Invalid email address:", data.recipient);
    toast.error("Failed to send email notification", {
      description: "Invalid email address provided."
    });
    return false;
  }
  
  try {
    // Get email sending configuration from Supabase
    const { data: appSettings, error: settingsError } = await supabase
      .from('app_settings')
      .select('use_real_email_service')
      .single();
    
    if (settingsError) {
      console.error("Could not fetch app settings:", settingsError);
    }
    
    const useRealEmailService = appSettings?.use_real_email_service || false;
    let success = false;

    if (useRealEmailService) {
      // Send real email using Supabase Edge Function
      success = await sendRealEmail(
        data.recipient, 
        data.subject || `Notification: ${data.event}`, 
        data.message
      );
      
      if (success) {
        toast.success("Email notification sent", {
          description: `Email sent to ${data.recipient}`
        });
      } else {
        toast.error("Failed to send email notification", {
          description: "Email service error. Please check your configuration."
        });
      }
    } else {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      success = true;
      
      toast.success("Email notification sent", {
        description: `[SIMULATED] Email sent to ${data.recipient}`
      });
    }
    
    // Save notification to Supabase
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error("User not authenticated");
      return success;
    }
    
    await supabase.from('notifications').insert({
      recipient_id: user.user.id,
      subject: data.subject,
      message: data.message,
      event_type: data.event,
      blood_type: data.bloodType,
      units: data.units,
      is_bulk: false,
      status: success ? 'sent' : 'failed',
      sent_at: new Date().toISOString()
    });
    
    return success;
  } catch (error) {
    console.error("Error sending email notification:", error);
    toast.error("Failed to send email notification", {
      description: "An error occurred while sending the email."
    });
    return false;
  }
};

// Function to send bulk notifications
export const sendBulkNotification = async (recipients: string[], subject: string, message: string, event: NotificationEvent, details?: { bloodType?: BloodType, units?: number }): Promise<boolean> => {
  if (recipients.length === 0) {
    console.log("No recipients provided for bulk notification");
    return false;
  }
  
  try {
    // Get email sending configuration
    const { data: appSettings, error: settingsError } = await supabase
      .from('app_settings')
      .select('use_real_email_service')
      .single();
    
    if (settingsError) {
      console.error("Could not fetch app settings:", settingsError);
    }
    
    const useRealEmailService = appSettings?.use_real_email_service || false;
    
    // For real emails, call the Supabase Edge Function for bulk sending
    if (useRealEmailService) {
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          recipients,
          subject,
          message,
          event,
          bloodType: details?.bloodType,
          units: details?.units
        }
      });
      
      if (error) {
        throw new Error(`Bulk email service error: ${error.message}`);
      }
      
      console.log("Bulk email response:", data);
    } else {
      // Simulate delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    toast.success("Bulk notification sent", {
      description: `Notification sent to ${recipients.length} recipients`
    });
    
    // Save a single entry to notification history for the bulk send
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error("User not authenticated");
      return true;
    }
    
    await supabase.from('notifications').insert({
      recipient_id: user.user.id,
      subject,
      message,
      event_type: event,
      blood_type: details?.bloodType,
      units: details?.units,
      is_bulk: true,
      status: 'sent',
      sent_at: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Error sending bulk notification:", error);
    toast.error("Failed to send bulk notification", {
      description: "An error occurred while sending notifications."
    });
    return false;
  }
};

// Function to notify donors about low blood stock
export const notifyLowStockDonors = async (bloodType: BloodType, currentUnits: number, threshold: number): Promise<void> => {
  try {
    // In a real app, fetch eligible donors from Supabase
    const { data: eligibleDonors, error } = await supabase
      .from('donor_profiles')
      .select('user_id, blood_type')
      .eq('eligible_to_donate', true);
    
    if (error) {
      throw error;
    }
    
    if (!eligibleDonors || eligibleDonors.length === 0) {
      console.log(`No eligible donors found for blood type ${bloodType}`);
      return;
    }
    
    // Filter donors based on compatible blood types
    const compatibleDonors = eligibleDonors.filter(donor => {
      if (bloodType === 'O-') return donor.blood_type === 'O-';
      if (bloodType === 'O+') return ['O+', 'O-'].includes(donor.blood_type as BloodType);
      if (bloodType === 'A-') return ['A-', 'O-'].includes(donor.blood_type as BloodType);
      if (bloodType === 'A+') return ['A+', 'A-', 'O+', 'O-'].includes(donor.blood_type as BloodType);
      if (bloodType === 'B-') return ['B-', 'O-'].includes(donor.blood_type as BloodType);
      if (bloodType === 'B+') return ['B+', 'B-', 'O+', 'O-'].includes(donor.blood_type as BloodType);
      if (bloodType === 'AB-') return ['AB-', 'A-', 'B-', 'O-'].includes(donor.blood_type as BloodType);
      return true; // AB+ can receive from anyone
    });
    
    if (compatibleDonors.length === 0) {
      console.log(`No compatible donors found for blood type ${bloodType}`);
      return;
    }
    
    // Get user emails for the compatible donors
    const userIds = compatibleDonors.map(donor => donor.user_id);
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .in('user_id', userIds);
    
    if (usersError || !users) {
      console.error("Error fetching donor emails:", usersError);
      return;
    }
    
    // Map donor IDs to emails
    const recipientEmails = users.map(user => user.email).filter(Boolean) as string[];
    
    if (recipientEmails.length === 0) {
      console.log("No valid recipient emails found");
      return;
    }
    
    const subject = `Urgent: ${bloodType} Blood Stock is Low`;
    const message = `Our ${bloodType} blood supply is critically low with only ${currentUnits} units available. As someone with compatible blood type, your donation would be incredibly valuable right now. Please consider scheduling a donation appointment soon.`;
    
    // Send as a single bulk notification instead of individual notifications
    const success = await sendBulkNotification(
      recipientEmails,
      subject,
      message,
      'lowStock',
      { bloodType, units: currentUnits }
    );
    
    if (success) {
      toast.success(`Notified ${recipientEmails.length} eligible donors about low ${bloodType} stock`);
    }
  } catch (error) {
    console.error("Error notifying donors:", error);
    toast.error("Failed to send low stock notifications");
  }
};

// Function to notify donors about successful donation
export const sendDonationConfirmation = async (donorEmail: string, bloodType: BloodType, donationDate: string, location: string): Promise<void> => {
  const subject = "Thank You for Your Blood Donation";
  const message = `Thank you for your generous blood donation (type ${bloodType}) on ${donationDate} at ${location}. Your donation can save up to 3 lives. You will be eligible to donate again in 56 days.`;
  
  await sendEmailNotification({
    recipient: donorEmail,
    subject,
    message,
    event: 'donation',
    bloodType
  });
};

// Function to notify users about upcoming appointments
export const sendAppointmentReminder = async (userEmail: string, appointmentDate: string, location: string, timeSlot: string): Promise<void> => {
  const subject = "Reminder: Upcoming Blood Donation Appointment";
  const message = `This is a reminder about your upcoming blood donation appointment on ${appointmentDate} at ${location} during the ${timeSlot} time slot. Please remember to bring a valid ID and stay hydrated.`;
  
  await sendEmailNotification({
    recipient: userEmail,
    subject,
    message,
    event: 'appointment'
  });
};

// Function to notify hospitals about approved blood requests
export const sendRequestApprovalNotification = async (hospitalEmail: string, bloodType: BloodType, units: number, approvalDate: string): Promise<void> => {
  const subject = "Blood Request Approved";
  const message = `Your request for ${units} units of ${bloodType} blood has been approved on ${approvalDate}. The blood units are being prepared for delivery to your facility.`;
  
  await sendEmailNotification({
    recipient: hospitalEmail,
    subject,
    message,
    event: 'request',
    bloodType,
    units
  });
};

// Function to send batch appointment reminders
export const sendBatchAppointmentReminders = async (appointments: { email: string, date: string, location: string, timeSlot: string }[]): Promise<void> => {
  if (appointments.length === 0) return;
  
  // Group appointments by date and location
  const groupedByDateAndLocation: Record<string, typeof appointments> = {};
  
  appointments.forEach(appointment => {
    const key = `${appointment.date}_${appointment.location}`;
    if (!groupedByDateAndLocation[key]) {
      groupedByDateAndLocation[key] = [];
    }
    groupedByDateAndLocation[key].push(appointment);
  });
  
  // Send bulk notifications for each group
  for (const key in groupedByDateAndLocation) {
    const group = groupedByDateAndLocation[key];
    const [date, location] = key.split('_');
    
    const recipientEmails = group.map(appointment => appointment.email);
    const subject = "Upcoming Blood Donation Appointments";
    const message = `This is a reminder about your upcoming blood donation appointment on ${date} at ${location}. Please remember to bring a valid ID and stay hydrated.`;
    
    await sendBulkNotification(
      recipientEmails,
      subject,
      message,
      'appointment'
    );
  }
};

// Save notification preferences to Supabase
export const saveNotificationPreferences = async (userId: string, preferences: NotificationPreferences): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: userId,
        email: preferences.email,
        sms: preferences.sms,
        app: preferences.app,
        bulk_notifications: preferences.bulkNotifications
      });
      
    if (error) {
      throw error;
    }
    
    toast.success("Notification preferences updated");
  } catch (error) {
    console.error("Error saving notification preferences:", error);
    toast.error("Failed to save notification preferences");
  }
};

// Get notification preferences from Supabase
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  const defaultPreferences = { email: true, sms: false, app: true, bulkNotifications: true };
  
  try {
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error || !data) {
      console.log("No saved preferences found, using defaults");
      return defaultPreferences;
    }
    
    return {
      email: data.email,
      sms: data.sms,
      app: data.app,
      bulkNotifications: data.bulk_notifications
    };
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return defaultPreferences;
  }
};
