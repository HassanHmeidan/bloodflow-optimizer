
import { useState, useEffect } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Bell, 
  Calendar, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Search
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

interface Notification {
  recipient: string;
  subject?: string;
  message: string;
  event: string;
  bloodType?: string;
  units?: number;
  timestamp: string;
  type: 'email' | 'sms' | 'app';
  status: 'sent' | 'failed' | 'pending';
}

const NotificationHistoryPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (!token) {
      navigate('/auth');
      return;
    }
    
    setUserRole(role);
    
    // Load notification history
    const loadNotifications = () => {
      const storedNotifications = localStorage.getItem('notificationHistory');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        // Initialize with mock data if none exists
        const mockNotifications: Notification[] = [
          {
            recipient: 'john.doe@example.com',
            subject: 'Urgent: O- Blood Stock is Low',
            message: 'Our O- blood supply is critically low with only 9 units available. As someone with compatible blood type, your donation would be incredibly valuable right now.',
            event: 'lowStock',
            bloodType: 'O-',
            units: 9,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            type: 'email',
            status: 'sent'
          },
          {
            recipient: 'jane.smith@example.com',
            subject: 'Thank You for Your Blood Donation',
            message: 'Thank you for your generous blood donation (type A+) on June 15, 2023 at Community Blood Center. Your donation can save up to 3 lives.',
            event: 'donation',
            bloodType: 'A+',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'email',
            status: 'sent'
          },
          {
            recipient: 'general.hospital@example.com',
            subject: 'Blood Request Approved',
            message: 'Your request for 3 units of B+ blood has been approved on June 10, 2023. The blood units are being prepared for delivery to your facility.',
            event: 'request',
            bloodType: 'B+',
            units: 3,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'email',
            status: 'sent'
          }
        ];
        
        setNotifications(mockNotifications);
        localStorage.setItem('notificationHistory', JSON.stringify(mockNotifications));
      }
      
      setLoading(false);
    };
    
    loadNotifications();
  }, [navigate]);

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(notification => {
    const searchLower = searchTerm.toLowerCase();
    return (
      notification.recipient.toLowerCase().includes(searchLower) ||
      (notification.subject?.toLowerCase().includes(searchLower)) ||
      notification.message.toLowerCase().includes(searchLower) ||
      notification.event.toLowerCase().includes(searchLower) ||
      (notification.bloodType?.toLowerCase().includes(searchLower))
    );
  });

  // Get icon based on event type
  const getEventIcon = (event: string) => {
    switch (event) {
      case 'lowStock':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'donation':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'eligibility':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'request':
        return <Bell className="h-5 w-5 text-bloodRed-600" />;
      default:
        return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format the timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Notification History</h1>
              <p className="text-gray-600">
                Track all email, SMS, and in-app notifications sent through the system
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Notification Log</CardTitle>
              <CardDescription>
                {userRole === 'admin' 
                  ? 'All notifications sent to donors, hospitals, and staff' 
                  : 'Notifications sent to you and from your account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search notifications..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-bloodRed-600 mr-3" />
                    <span>Loading notification history...</span>
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="mr-4 mt-1">
                          {getEventIcon(notification.event)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                            <h3 className="font-medium">{notification.subject || `${notification.event.charAt(0).toUpperCase() + notification.event.slice(1)} Notification`}</h3>
                            <div className="flex items-center mt-2 sm:mt-0">
                              <Badge variant={notification.status === 'sent' ? 'default' : notification.status === 'pending' ? 'outline' : 'destructive'}>
                                {notification.status}
                              </Badge>
                              <Badge variant="outline" className="ml-2">
                                {notification.type.toUpperCase()}
                              </Badge>
                              {notification.bloodType && (
                                <Badge className="ml-2 bg-bloodRed-50 text-bloodRed-600 hover:bg-bloodRed-100">
                                  {notification.bloodType}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{notification.message}</p>
                          
                          <div className="flex flex-col sm:flex-row text-xs text-gray-500">
                            <div className="flex items-center">
                              <Mail className="h-3.5 w-3.5 mr-1" />
                              <span>To: {notification.recipient}</span>
                            </div>
                            <Separator orientation="vertical" className="hidden sm:block mx-2 h-4" />
                            <div className="flex items-center mt-1 sm:mt-0">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No notifications found</h3>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? "No notifications match your search criteria" 
                        : "No notifications have been sent yet"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotificationHistoryPage;
