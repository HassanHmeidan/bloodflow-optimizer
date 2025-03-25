import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Heart, LogIn, LogOut, Bell, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Donate', href: '/donate' },
  { label: 'Request', href: '/request' },
  { label: 'About', href: '/about' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getNotificationCount = () => {
      const notificationHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
      setNotificationCount(notificationHistory.length > 0 ? notificationHistory.length : 0);
    };
    
    getNotificationCount();
    const interval = setInterval(getNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const markNotificationsAsRead = () => {
    const notificationHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
    const updatedNotifications = notificationHistory.map((notification: any) => ({
      ...notification,
      read: true
    }));
    localStorage.setItem('notificationHistory', JSON.stringify(updatedNotifications));
    setNotificationCount(0);
    toast.success("All notifications marked as read");
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Heart className="h-8 w-8 text-bloodRed-600 mr-2" />
              <span className="text-xl font-semibold">LifeFlow</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.href 
                      ? 'text-bloodRed-600' 
                      : 'text-gray-700 hover:text-bloodRed-500'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative p-0 h-8 w-8">
                        <Bell className="h-5 w-5 text-gray-700" />
                        {notificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-bloodRed-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {notificationCount > 9 ? '9+' : notificationCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 p-2">
                      <DropdownMenuLabel className="flex justify-between items-center">
                        <span>Notifications</span>
                        {notificationCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs text-bloodRed-600 hover:text-bloodRed-700"
                            onClick={markNotificationsAsRead}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all as read
                          </Button>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <div className="max-h-64 overflow-y-auto py-1">
                        {notificationCount > 0 ? (
                          <div className="px-2 py-1.5 text-sm">
                            You have {notificationCount} notifications
                            <p className="text-xs text-gray-500 mt-1">
                              Check your notification history for details
                            </p>
                          </div>
                        ) : (
                          <div className="px-2 py-4 text-sm text-gray-500 text-center">
                            No new notifications
                          </div>
                        )}
                      </div>
                      
                      <DropdownMenuSeparator className="mb-1" />
                      <DropdownMenuItem asChild className="cursor-pointer justify-center text-sm font-medium text-bloodRed-600">
                        <Link to="/dashboard/notifications" onClick={markNotificationsAsRead}>
                          View all notifications
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="text-sm font-medium flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm font-medium flex items-center text-bloodRed-600"
                    onClick={() => {
                      localStorage.removeItem('authToken');
                      setIsAuthenticated(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="flex items-center bg-bloodRed-600 hover:bg-bloodRed-700">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-bloodRed-600 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-slide-down">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.href 
                    ? 'text-bloodRed-600 bg-bloodRed-50' 
                    : 'text-gray-700 hover:text-bloodRed-500 hover:bg-bloodRed-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard/notifications"
                  className="flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-bloodRed-500 hover:bg-bloodRed-50"
                  onClick={() => {
                    setIsOpen(false);
                    markNotificationsAsRead();
                  }}
                >
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </div>
                  {notificationCount > 0 && (
                    <span className="bg-bloodRed-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-bloodRed-500 hover:bg-bloodRed-50"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-bloodRed-600 hover:bg-bloodRed-50"
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    setIsAuthenticated(false);
                    setIsOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium bg-bloodRed-600 text-white hover:bg-bloodRed-700"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
