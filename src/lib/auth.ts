
import { UserRole, Permission, hasPermission } from "./roles";
import { toast } from "sonner";

// Session management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getUserRole = (): UserRole | null => {
  const role = localStorage.getItem('userRole');
  if (role === 'admin' || role === 'hospital' || role === 'donor') {
    return role as UserRole;
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const isAuthorized = (requiredPermission: Permission): boolean => {
  const userRole = getUserRole();
  if (!userRole) return false;
  return hasPermission(userRole, requiredPermission);
};

// Login, logout and registration handlers
export const login = (email: string, password: string, role: UserRole = 'donor'): Promise<boolean> => {
  return new Promise((resolve) => {
    // For demo purposes, we have a special admin login
    if (email === "admin@lifeflow.com" && password === "admin123") {
      localStorage.setItem('authToken', 'admin-token');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', 'Admin User');
      toast.success("Admin login successful!", {
        description: "Welcome to the LifeFlow admin dashboard.",
      });
      resolve(true);
      return;
    }
    
    // For hospital demo login
    if (email === "hospital@lifeflow.com" && password === "hospital123") {
      localStorage.setItem('authToken', 'hospital-token');
      localStorage.setItem('userRole', 'hospital');
      localStorage.setItem('userName', 'Hospital Staff');
      toast.success("Hospital login successful!", {
        description: "Welcome to the LifeFlow hospital dashboard.",
      });
      resolve(true);
      return;
    }
    
    // For regular user demo login
    if (email && password.length >= 6) {
      localStorage.setItem('authToken', 'user-token');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', email.split('@')[0]);
      toast.success("Login successful!", {
        description: "Welcome back to LifeFlow.",
      });
      resolve(true);
      return;
    }
    
    toast.error("Login failed", {
      description: "Invalid email or password. Please try again.",
    });
    resolve(false);
  });
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  toast.info("Logged out successfully");
};

export const register = (
  name: string, 
  email: string, 
  password: string, 
  role: UserRole = 'donor',
  additionalData: Record<string, any> = {}
): Promise<boolean> => {
  return new Promise((resolve) => {
    // Demo registration logic
    if (name && email && password.length >= 6) {
      // In a real app, we would send this data to the backend
      console.log('Registration data:', { 
        name, 
        email, 
        role,
        ...additionalData
      });
      
      toast.success("Registration successful!", {
        description: "Please check your email to verify your account.",
      });
      resolve(true);
      return;
    }
    
    toast.error("Registration failed", {
      description: "Please fill all fields correctly. Password must be at least 6 characters.",
    });
    resolve(false);
  });
};

// User profile management
export const getUserProfile = () => {
  const role = getUserRole();
  const name = localStorage.getItem('userName') || 'User';
  
  return {
    name,
    email: role === 'admin' ? 'admin@lifeflow.com' : 
           role === 'hospital' ? 'hospital@lifeflow.com' : 
           `${name.toLowerCase()}@example.com`,
    role: role || 'guest',
    lastLogin: new Date().toISOString(),
    permissions: role ? (role === 'admin' ? 'All permissions' : 
                      role === 'hospital' ? 'Hospital permissions' : 
                      'Donor permissions') : 'None'
  };
};

// Protected route helper
export const requireAuth = (navigate: (path: string) => void): void => {
  if (!isAuthenticated()) {
    toast.error("Authentication required", {
      description: "Please log in to access this page.",
    });
    navigate('/auth');
  }
};

export const getDashboardMenuItems = (role: UserRole): { title: string, url: string, icon: string }[] => {
  const commonItems = [
    { title: 'Overview', url: '/dashboard', icon: 'layout-dashboard' },
    { title: 'Profile', url: '/dashboard/profile', icon: 'user' },
  ];
  
  if (role === 'admin') {
    return [
      ...commonItems,
      { title: 'Users', url: '/dashboard/users', icon: 'users' },
      { title: 'Inventory', url: '/dashboard/inventory', icon: 'box' },
      { title: 'Blood Requests', url: '/dashboard/requests', icon: 'clipboard-list' },
      { title: 'Analytics', url: '/dashboard/analytics', icon: 'bar-chart' },
      { title: 'Settings', url: '/dashboard/settings', icon: 'settings' },
    ];
  } else if (role === 'hospital') {
    return [
      ...commonItems,
      { title: 'Blood Inventory', url: '/dashboard/inventory', icon: 'droplet' },
      { title: 'Request Blood', url: '/dashboard/request', icon: 'clipboard-list' },
      { title: 'Patients', url: '/dashboard/patients', icon: 'user-plus' },
      { title: 'Reports', url: '/dashboard/reports', icon: 'file-text' },
    ];
  } else {
    // Donor
    return [
      ...commonItems,
      { title: 'Schedule Donation', url: '/dashboard/schedule', icon: 'calendar' },
      { title: 'Donation History', url: '/dashboard/history', icon: 'clock' },
      { title: 'Rewards', url: '/dashboard/rewards', icon: 'award' },
      { title: 'Find Centers', url: '/dashboard/centers', icon: 'map-pin' },
    ];
  }
};
