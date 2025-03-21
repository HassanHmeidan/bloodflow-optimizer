
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Droplet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export const Hero = () => {
  const navigate = useNavigate();
  // Blood types animation state
  const [currentBloodType, setCurrentBloodType] = useState(0);
  const bloodTypes = ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'];

  // Auto-rotate blood types
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBloodType((prev) => (prev + 1) % bloodTypes.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  const bloodDropVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Handle button clicks
  const handleDonateClick = () => {
    navigate('/donate');
  };

  const handleRequestClick = () => {
    navigate('/request');
  };

  return (
    <div className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-bloodRed-50 to-white -z-10" />
      
      {/* Blood Cell Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-bloodRed-200/30"
            initial={{
              x: Math.random() * 100 - 50 + '%',
              y: Math.random() * 100 + '%',
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: ['-20%', '120%'],
              x: `calc(${Math.random() * 20 - 10}% + ${Math.random() * 100}px)`,
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10,
            }}
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            className="lg:w-1/2 text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className="inline-block px-3 py-1 rounded-full bg-bloodRed-100 text-bloodRed-800 text-sm font-medium mb-4"
              variants={itemVariants}
            >
              Saving Lives Together
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
              variants={itemVariants}
            >
              Every Drop <br className="hidden md:inline" />
              <span className="text-bloodRed-600">Matters</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0"
              variants={itemVariants}
            >
              Join our network of donors and help save lives. One donation can save up to three lives. Be the reason someone's heart keeps beating.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={itemVariants}
            >
              <Button 
                className="bg-bloodRed-600 hover:bg-bloodRed-700 text-white font-medium px-6 py-6 h-auto"
                onClick={handleDonateClick}
              >
                Donate Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="border-bloodRed-200 text-bloodRed-800 hover:bg-bloodRed-50 font-medium px-6 py-6 h-auto"
                onClick={handleRequestClick}
              >
                Request Blood
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative w-80 h-80 sm:w-96 sm:h-96">
              {/* Pulsing Circle */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-bloodRed-100"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Blood Drop Icon - Made larger */}
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                animate="pulse"
                variants={bloodDropVariants}
              >
                <Droplet className="w-32 h-32 sm:w-40 sm:h-40 text-bloodRed-600 fill-bloodRed-500" />
                
                {/* Blood Type Display - Changed to black background */}
                <motion.div 
                  className="bg-black text-white shadow-md rounded-lg px-8 py-4 mt-4 font-bold text-2xl"
                  key={currentBloodType}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {bloodTypes[currentBloodType]}
                </motion.div>
              </motion.div>
              
              {/* Floating Stats */}
              <motion.div 
                className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-3 flex items-center"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-bloodRed-100 p-2 rounded-full mr-3">
                  <Heart className="h-5 w-5 text-bloodRed-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lives Saved</p>
                  <p className="font-bold">10,482</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute bottom-0 left-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-3 flex items-center"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="bg-medBlue-100 p-2 rounded-full mr-3">
                  <Droplet className="h-5 w-5 text-medBlue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Donations</p>
                  <p className="font-bold">24,156</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
