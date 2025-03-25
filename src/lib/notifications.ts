
import { toast } from "sonner";

type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
type NotificationType = 'email' | 'sms' | 'app';
type NotificationEvent = 'donation' | 'appointment' | 'lowStock' | 'eligibility' | 'request';

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  app: boolean;
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

// In a real app, this would connect to an email service like SendGrid or Mailchimp
export const sendEmailNotification = async (data: NotificationData): Promise<boolean> => {
  console.log(`Sending email notification to ${data.recipient}`);
  console.log(`Subject: ${data.subject}`);
  console.log(`Message: ${data.message}`);
  
  // Simulating API call to email service
  if (!isValidEmail(data.recipient)) {
    console.error("Invalid email address:", data.recipient);
    toast.error("Failed to send email notification", {
      description: "Invalid email address provided."
    });
    return false;
  }
  
  try {
    // In a real app, this would be an API call to your email service
    // await emailService.send({ to, subject, body });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    toast.success("Email notification sent", {
      description: `Email sent to ${data.recipient}`
    });
    
    // Save notification history to localStorage for demo purposes
    const notificationHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    notificationHistory.push({
      ...data,
      timestamp: new Date().toISOString(),
      type: 'email',
      status: 'sent'
    });
    localStorage.setItem('notificationHistory', JSON.stringify(notificationHistory));
    
    return true;
  } catch (error) {
    console.error("Error sending email notification:", error);
    toast.error("Failed to send email notification", {
      description: "An error occurred while sending the email."
    });
    return false;
  }
};

// Function to send bulk notifications instead of notifying each donor individually
export const sendBulkNotification = async (recipients: string[], subject: string, message: string, event: NotificationEvent, details?: { bloodType?: BloodType, units?: number }): Promise<boolean> => {
  if (recipients.length === 0) {
    console.log("No recipients provided for bulk notification");
    return false;
  }
  
  try {
    // In a real app, this would call a bulk email service
    // await emailService.sendBulk({ to: recipients, subject, body });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    toast.success("Bulk notification sent", {
      description: `Notification sent to ${recipients.length} recipients`
    });
    
    // For demo purposes, log each recipient but only send one actual notification
    console.log(`Bulk notification sent to ${recipients.length} recipients`);
    console.log(`Recipients: ${recipients.join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    
    // Save a single entry to notification history for the bulk send
    const notificationHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    notificationHistory.push({
      recipient: `${recipients.length} recipients`,
      subject,
      message,
      event,
      bloodType: details?.bloodType,
      units: details?.units,
      timestamp: new Date().toISOString(),
      type: 'email',
      status: 'sent',
      isBulk: true
    });
    localStorage.setItem('notificationHistory', JSON.stringify(notificationHistory));
    
    return true;
  } catch (error) {
    console.error("Error sending bulk notification:", error);
    toast.error("Failed to send bulk notification", {
      description: "An error occurred while sending notifications."
    });
    return false;
  }
};

// Function to notify donors about low blood stock (updated to use bulk notification)
export const notifyLowStockDonors = async (bloodType: BloodType, currentUnits: number, threshold: number): Promise<void> => {
  // In a real app, you would fetch eligible donors from a database
  const eligibleDonors = getMockEligibleDonors(bloodType);
  
  if (eligibleDonors.length === 0) {
    console.log(`No eligible donors found for blood type ${bloodType}`);
    return;
  }
  
  const subject = `Urgent: ${bloodType} Blood Stock is Low`;
  const message = `Our ${bloodType} blood supply is critically low with only ${currentUnits} units available. As someone with compatible blood type, your donation would be incredibly valuable right now. Please consider scheduling a donation appointment soon.`;
  
  // Extract just the email addresses
  const recipientEmails = eligibleDonors.map(donor => donor.email);
  
  // Send as a single bulk notification instead of individual notifications
  const success = await sendBulkNotification(
    recipientEmails,
    subject,
    message,
    'lowStock',
    { bloodType, units: currentUnits }
  );
  
  if (success) {
    toast.success(`Notified ${eligibleDonors.length} eligible donors about low ${bloodType} stock`);
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

// Function to send batch appointment reminders (for multiple appointments on the same day)
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

// Mock function to get eligible donors (in a real app, this would be a database query)
const getMockEligibleDonors = (bloodType: BloodType): { name: string, email: string, bloodType: BloodType }[] => {
  // In a real app, this would be filtered based on eligibility, last donation date, etc.
  return [
    { name: "John Smith", email: "john.smith@example.com", bloodType: 'O-' as BloodType },
    { name: "Maria Garcia", email: "maria.garcia@example.com", bloodType: 'A+' as BloodType },
    { name: "David Lee", email: "david.lee@example.com", bloodType: 'B-' as BloodType },
    { name: "Sarah Johnson", email: "sarah.johnson@example.com", bloodType: 'AB+' as BloodType },
  ].filter(donor => {
    // Filter based on compatible blood types
    if (bloodType === 'O-') return donor.bloodType === 'O-';
    if (bloodType === 'O+') return ['O+', 'O-'].includes(donor.bloodType);
    if (bloodType === 'A-') return ['A-', 'O-'].includes(donor.bloodType);
    if (bloodType === 'A+') return ['A+', 'A-', 'O+', 'O-'].includes(donor.bloodType);
    if (bloodType === 'B-') return ['B-', 'O-'].includes(donor.bloodType);
    if (bloodType === 'B+') return ['B+', 'B-', 'O+', 'O-'].includes(donor.bloodType);
    if (bloodType === 'AB-') return ['AB-', 'A-', 'B-', 'O-'].includes(donor.bloodType);
    return true; // AB+ can receive from anyone
  });
};

// Save notification preferences to localStorage
export const saveNotificationPreferences = (userId: string, preferences: NotificationPreferences): void => {
  localStorage.setItem(`notificationPreferences_${userId}`, JSON.stringify(preferences));
  toast.success("Notification preferences updated");
};

// Get notification preferences from localStorage
export const getNotificationPreferences = (userId: string): NotificationPreferences => {
  const defaultPreferences = { email: true, sms: false, app: true };
  const savedPreferences = localStorage.getItem(`notificationPreferences_${userId}`);
  
  return savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences;
};
