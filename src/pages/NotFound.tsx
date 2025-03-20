
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16 flex items-center justify-center">
        <motion.div 
          className="text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-12 w-12 text-bloodRed-600" />
          </div>
          
          <h1 className="text-5xl font-bold mb-4 text-gray-900">404</h1>
          <p className="text-2xl text-gray-600 mb-8">Oops! Page not found</p>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            We couldn't find the page you're looking for. The page may have been moved, deleted, or never existed.
          </p>
          
          <Link to="/">
            <Button className="bg-bloodRed-600 hover:bg-bloodRed-700">
              Return to Home
            </Button>
          </Link>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
