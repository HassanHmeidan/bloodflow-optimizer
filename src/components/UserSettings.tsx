
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getUserProfile } from "@/lib/auth";

export const UserSettings = () => {
  const userProfile = getUserProfile();
  const [profileData, setProfileData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: "123-456-7890",
    address: "123 Main St, Anytown, USA"
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    appointment: true,
    newsletter: false,
    eligibility: true
  });
  
  const [saving, setSaving] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success("Profile updated successfully");
      setSaving(false);
    }, 1000);
  };

  const savePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setSaving(true);
    setTimeout(() => {
      toast.success("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setSaving(false);
    }, 1000);
  };

  const saveNotifications = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success("Notification preferences updated");
      setSaving(false);
    }, 1000);
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={profileData.name} 
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={profileData.email} 
                  onChange={handleProfileChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={profileData.phone} 
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  name="address" 
                  value={profileData.address} 
                  onChange={handleProfileChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                name="currentPassword" 
                type="password" 
                value={passwordData.currentPassword} 
                onChange={handlePasswordChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                name="newPassword" 
                type="password" 
                value={passwordData.newPassword} 
                onChange={handlePasswordChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={savePassword}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Password'}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Control how we contact you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive email updates about your account</p>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={() => handleNotificationChange('email')} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Receive text messages for important alerts</p>
                </div>
                <Switch 
                  checked={notifications.sms} 
                  onCheckedChange={() => handleNotificationChange('sms')} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Appointment Reminders</h4>
                  <p className="text-sm text-gray-500">Get notified about upcoming appointments</p>
                </div>
                <Switch 
                  checked={notifications.appointment} 
                  onCheckedChange={() => handleNotificationChange('appointment')} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Newsletter</h4>
                  <p className="text-sm text-gray-500">Receive our monthly newsletter</p>
                </div>
                <Switch 
                  checked={notifications.newsletter} 
                  onCheckedChange={() => handleNotificationChange('newsletter')} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Eligibility Updates</h4>
                  <p className="text-sm text-gray-500">Get notified when you're eligible to donate again</p>
                </div>
                <Switch 
                  checked={notifications.eligibility} 
                  onCheckedChange={() => handleNotificationChange('eligibility')} 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={saveNotifications}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
