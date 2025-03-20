
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, UserPlus, LogIn, Mail, Heart, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type AuthMode = 'login' | 'register';
type UserRole = 'donor' | 'hospital' | 'admin';

// Admin credentials
const ADMIN_EMAIL = "admin@lifeflow.com";
const ADMIN_PASSWORD = "admin123";

export const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('donor');
  
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle auth mode
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    });
    // Reset to donor role when switching to register mode
    if (mode === 'login') {
      setUserRole('donor');
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are identical.",
      });
      return;
    }
    
    setLoading(true);
    
    // Check for admin login
    if (mode === 'login' && formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
      localStorage.setItem('authToken', 'admin-token');
      localStorage.setItem('userRole', 'admin');
      toast.success("Admin login successful!", {
        description: "Welcome to the LifeFlow admin dashboard.",
      });
      navigate('/dashboard');
      setLoading(false);
      return;
    }
    
    setTimeout(() => {
      if (mode === 'login') {
        localStorage.setItem('authToken', 'mock-token');
        localStorage.setItem('userRole', userRole);
        toast.success("Login successful!", {
          description: "Welcome back to LifeFlow.",
        });
        navigate('/dashboard');
      } else {
        toast.success("Registration successful!", {
          description: "Please check your email to verify your account.",
        });
        setMode('login');
      }
      
      setLoading(false);
    }, 1500);
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Auth Mode Toggle */}
      <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
        <button
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex justify-center items-center ${
            mode === 'login' 
              ? 'bg-white shadow-sm text-gray-800' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setMode('login')}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </button>
        <button
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex justify-center items-center ${
            mode === 'register' 
              ? 'bg-white shadow-sm text-gray-800' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setMode('register')}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Register
        </button>
      </div>
      
      {/* Form Container */}
      <motion.div
        key={mode}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={formVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="text-center mb-6">
          <Heart className="h-10 w-10 text-bloodRed-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome Back' : 'Join LifeFlow'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {mode === 'login' 
              ? 'Sign in to access your account' 
              : 'Create an account to start donating'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          {mode === 'register' && (
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}
          
          {mode === 'register' && (
            <div className="space-y-2">
              <Label>I am a:</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={userRole === 'donor' ? 'default' : 'outline'}
                  className={`
                    border-2 h-auto py-3 px-2 flex flex-col items-center
                    ${userRole === 'donor' ? 'bg-bloodRed-600 hover:bg-bloodRed-700 border-transparent' : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => setUserRole('donor')}
                >
                  <User className="h-4 w-4 mb-1" />
                  <span className="text-xs font-medium">Donor</span>
                </Button>
                <Button
                  type="button"
                  variant={userRole === 'hospital' ? 'default' : 'outline'}
                  className={`
                    border-2 h-auto py-3 px-2 flex flex-col items-center
                    ${userRole === 'hospital' ? 'bg-bloodRed-600 hover:bg-bloodRed-700 border-transparent' : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => setUserRole('hospital')}
                >
                  <Heart className="h-4 w-4 mb-1" />
                  <span className="text-xs font-medium">Hospital</span>
                </Button>
              </div>
            </div>
          )}
          
          {mode === 'login' && (
            <div className="flex justify-end">
              <a 
                href="#" 
                className="text-sm text-bloodRed-600 hover:text-bloodRed-800 transition-colors"
              >
                Forgot password?
              </a>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-bloodRed-600 hover:bg-bloodRed-700 h-11"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="mr-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Processing...
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>
      </motion.div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Demo Application</p>
          <p className="mt-1">This is a demonstration. No actual authentication is performed.</p>
          {mode === 'login' && (
            <p className="mt-1">
              <strong>Admin Login:</strong> admin@lifeflow.com / admin123
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
