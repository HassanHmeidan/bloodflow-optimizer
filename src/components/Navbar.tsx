
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Heart, LogIn, LogOut, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

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

  // Check if user is authenticated (this would normally use a proper auth system)
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    // You'd normally set up a listener for auth state changes
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get notification count from local storage
  useEffect(() => {
    const getNotificationCount = () => {
      const notificationHistory = JSON.parse(localStorage.getItem('notificationHistory') || '[]');
      // Count unread notifications (in a real app, you would track read/unread status)
      setNotificationCount(notificationHistory.length > 0 ? notificationHistory.length : 0);
    };
    
    getNotificationCount();
    // In a real app, you would set up a listener for notification changes
    
    // For demo purposes, check every 30 seconds
    const interval = setInterval(getNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

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
          
          {/* Desktop Navigation */}
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
                  {/* Notification Bell */}
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="h-8 p-0 bg-transparent hover:bg-transparent">
                          <div className="relative">
                            <Bell className="h-5 w-5 text-gray-700 hover:text-bloodRed-500" />
                            {notificationCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-bloodRed-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                {notificationCount > 9 ? '9+' : notificationCount}
                              </span>
                            )}
                          </div>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="bg-white p-2 shadow-lg rounded-md border border-gray-200 w-64 z-50">
                          <div className="py-2">
                            <div className="flex justify-between items-center px-3 pb-2 border-b border-gray-100">
                              <span className="font-medium">Notifications</span>
                              <Link 
                                to="/dashboard/notifications" 
                                className="text-xs text-bloodRed-600 hover:underline"
                                onClick={() => setNotificationCount(0)}
                              >
                                View all
                              </Link>
                            </div>
                            <div className="max-h-64 overflow-y-auto py-2">
                              {notificationCount > 0 ? (
                                <div className="text-sm px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                                  You have {notificationCount} notifications
                                  <p className="text-xs text-gray-500 mt-1">
                                    Click "View all" to see details
                                  </p>
                                </div>
                              ) : (
                                <div className="text-sm px-3 py-2 text-gray-500">
                                  No new notifications
                                </div>
                              )}
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  
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
          
          {/* Mobile Navigation Toggle */}
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

      {/* Mobile Navigation Menu */}
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
                {/* Mobile Notification Link */}
                <Link
                  to="/dashboard/notifications"
                  className="flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-bloodRed-500 hover:bg-bloodRed-50"
                  onClick={() => {
                    setIsOpen(false);
                    setNotificationCount(0);
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
