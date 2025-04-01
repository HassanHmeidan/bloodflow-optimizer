import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, Clock, Info, Save, Loader2, Users, Droplet, SendIcon, AlertCircle } from "lucide-react";
import { getNotificationPreferences, saveNotificationPreferences, sendEmailNotification } from '@/lib/notifications';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const NotificationSettings = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    app: true,
    bulkNotifications: true
  });
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('authToken');
    if (!userId) return;
    
    const userEmail = localStorage.getItem('userEmail') || '';
    const userPhone = localStorage.getItem('userPhone') || '';
    setEmail(userEmail);
    setPhone(userPhone);
    
    const userPreferences = getNotificationPreferences(userId);
    setPreferences(userPreferences);
  }, []);

  const handleSaveNotifications = () => {
    const userId = localStorage.getItem('authToken');
    if (!userId) {
      toast.error("You must be logged in to save notification preferences");
      return;
    }
    
    setLoading(true);
    
    if (preferences.email && (!email || !email.includes('@'))) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }
    
    if (preferences.sms && (!phone || phone.length < 10)) {
      toast.error("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPhone', phone);
    
    saveNotificationPreferences(userId, preferences);
    
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleTestNotification = async () => {
    const userId = localStorage.getItem('authToken');
    if (!userId) {
      toast.error("You must be logged in to test notifications");
      return;
    }

    if (preferences.email && (!email || !email.includes('@'))) {
      toast.error("Please enter a valid email address to test email notifications");
      return;
    }
    
    setTestLoading(true);
    
    try {
      if (preferences.email) {
        await sendEmailNotification({
          recipient: email,
          subject: "Test Notification",
          message: "This is a test notification from the Blood Donation System. Your notification settings are working correctly!",
          event: 'donation'
        });
        
        toast.info("Simulation Complete", {
          description: "In this demo, emails are simulated and not actually sent to real addresses. In a production environment, this would connect to a real email service.",
          duration: 5000
        });
      } else {
        toast.info("Email notifications are disabled in your preferences", {
          description: "Enable email notifications first to test them."
        });
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification");
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how you receive alerts and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="info" className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            This is a demo application. Email notifications are simulated and not actually sent to real email addresses.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Contact Information</h3>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center">
                <Smartphone className="h-4 w-4 mr-2 text-gray-500" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <Label htmlFor="email-notifications" className="cursor-pointer">Email Notifications</Label>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email}
                onCheckedChange={(checked) => setPreferences({...preferences, email: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <Label htmlFor="sms-notifications" className="cursor-pointer">SMS Notifications</Label>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences.sms}
                onCheckedChange={(checked) => setPreferences({...preferences, sms: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-gray-500" />
                <Label htmlFor="app-notifications" className="cursor-pointer">In-App Notifications</Label>
              </div>
              <Switch
                id="app-notifications"
                checked={preferences.app}
                onCheckedChange={(checked) => setPreferences({...preferences, app: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <Label htmlFor="bulk-notifications" className="cursor-pointer">Receive Bulk Notifications</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable to receive bulk notifications instead of individual ones
                  </p>
                </div>
              </div>
              <Switch
                id="bulk-notifications"
                checked={preferences.bulkNotifications}
                onCheckedChange={(checked) => setPreferences({...preferences, bulkNotifications: checked})}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Types</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-4 p-3 rounded-md border border-gray-100">
              <Info className="h-5 w-5 text-bloodRed-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Donation Reminders</h4>
                <p className="text-sm text-gray-500">
                  Receive reminders about upcoming appointments and when you're eligible to donate again
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-3 rounded-md border border-gray-100">
              <Clock className="h-5 w-5 text-bloodRed-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Eligibility Updates</h4>
                <p className="text-sm text-gray-500">
                  Get notified when you become eligible to donate blood again
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-3 rounded-md border border-gray-100">
              <Droplet className="h-5 w-5 text-bloodRed-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Blood Supply Alerts</h4>
                <p className="text-sm text-gray-500">
                  Urgent alerts when your blood type is in high demand
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Button 
          className="w-full"
          onClick={handleSaveNotifications}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Notification Preferences
            </>
          )}
        </Button>
        <Button 
          variant="secondary"
          className="w-full"
          onClick={handleTestNotification}
          disabled={testLoading}
        >
          {testLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Test Notification (Simulated)
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
