import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, Clock, Info, Save, Loader2, Users, Droplet, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getNotificationPreferences, saveNotificationPreferences, sendEmailNotification } from '@/lib/notifications';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/lib/supabase';

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
  const [useRealEmail, setUseRealEmail] = useState(false);
  const [emailServiceUrl, setEmailServiceUrl] = useState('');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailSender, setEmailSender] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, phone')
        .eq('id', user.id)
        .single();
      
      if (profile && !profileError) {
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
      }
      
      // Get notification preferences
      const userPreferences = await getNotificationPreferences(user.id);
      setPreferences(userPreferences);
      
      // Load email service configuration
      const { data: appSettings, error: settingsError } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_name', 'email_configuration')
        .single();
      
      if (appSettings && !settingsError) {
        const emailConfig = appSettings.setting_value as any;
        setUseRealEmail(emailConfig.use_real_email_service || false);
        setEmailServiceUrl(emailConfig.email_service_url || '');
        setEmailSender(emailConfig.email_sender || '');
      }
    };
    
    loadUserData();
  }, []);

  const handleSaveNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
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

      // Update user profile with contact info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email,
          phone
        })
        .eq('id', user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // Save email service configuration if using real email
      if (useRealEmail) {
        if (!emailServiceUrl) {
          toast.error("Please enter an email service URL");
          setLoading(false);
          return;
        }
        
        // Update email configuration in app_settings
        const emailConfig = {
          use_real_email_service: useRealEmail,
          email_service_url: emailServiceUrl,
          email_sender: emailSender || 'noreply@blooddonation.com'
        };
        
        const { error: settingsError } = await supabase
          .from('app_settings')
          .update({
            setting_value: emailConfig
          })
          .eq('setting_name', 'email_configuration');
        
        if (settingsError) {
          throw settingsError;
        }
      }
      
      // Save notification preferences
      await saveNotificationPreferences(user.id, preferences);
      
      setTimeout(() => {
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to test notifications");
        return;
      }

      if (preferences.email && (!email || !email.includes('@'))) {
        toast.error("Please enter a valid email address to test email notifications");
        return;
      }
      
      setTestLoading(true);
      
      if (preferences.email) {
        await sendEmailNotification({
          recipient: email,
          subject: "Test Notification",
          message: "This is a test notification from the Blood Donation System. Your notification settings are working correctly!",
          event: 'donation'
        });
        
        if (!useRealEmail) {
          toast.info("Simulation Complete", {
            description: "In this demo, emails are simulated and not actually sent to real addresses. To send real emails, enable real email service in the advanced settings.",
            duration: 5000
          });
        }
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
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle>Connected to Supabase</AlertTitle>
          <AlertDescription>
            {useRealEmail 
              ? "You have enabled real email sending. Configure your email service in Supabase Edge Functions."
              : "Emails are simulated by default. Enable real email service in advanced settings and configure Supabase Edge Functions to send actual emails."
            }
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

        <div>
          <Button 
            variant="ghost" 
            className="flex items-center justify-between w-full p-2 text-left"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <span className="flex items-center font-medium">
              <AlertCircle className="h-4 w-4 mr-2" />
              Advanced Email Settings
            </span>
            {showAdvancedOptions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {showAdvancedOptions && (
            <div className="mt-4 p-4 border rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Real Email Service</h4>
                  <p className="text-sm text-gray-500">
                    Switch from simulation to actual email delivery
                  </p>
                </div>
                <Switch
                  checked={useRealEmail}
                  onCheckedChange={setUseRealEmail}
                />
              </div>
              
              {useRealEmail && (
                <div className="space-y-3 mt-3">
                  <div className="grid gap-2">
                    <Label htmlFor="email-service">Email Service URL</Label>
                    <Input
                      id="email-service"
                      type="url"
                      placeholder="https://api.youremailservice.com/send"
                      value={emailServiceUrl}
                      onChange={(e) => setEmailServiceUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      The API endpoint of your email service provider (e.g., SendGrid, Mailgun)
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Your API key"
                      value={emailApiKey}
                      onChange={(e) => setEmailApiKey(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="sender-email">Sender Email</Label>
                    <Input
                      id="sender-email"
                      type="email"
                      placeholder="noreply@yourcompany.com"
                      value={emailSender}
                      onChange={(e) => setEmailSender(e.target.value)}
                    />
                  </div>
                  
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Security Warning</AlertTitle>
                    <AlertDescription>
                      API keys stored in the browser are not secure. For a production application, 
                      these should be stored on a secure server. This implementation is for 
                      demonstration purposes only.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}
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
              {useRealEmail ? "Test Notification (Real)" : "Test Notification (Simulated)"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
