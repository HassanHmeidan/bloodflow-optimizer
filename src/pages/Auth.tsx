
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthForm } from "@/components/AuthForm";
import { motion } from "framer-motion";

const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Auth Form */}
            <div className="order-2 lg:order-1 animate-slide-up">
              <AuthForm />
            </div>
            
            {/* Right Side - Information */}
            <motion.div 
              className="order-1 lg:order-2 text-center lg:text-left"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-bloodRed-50 text-bloodRed-800 px-3 py-1 rounded-full inline-block mb-4">
                Secure Authentication
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                Join our <span className="text-bloodRed-600">lifesaving</span> mission
              </h1>
              <p className="text-gray-600 mb-6 lg:pr-12">
                Create an account to donate blood, track your donations, and help save lives. Our platform connects donors with those in need through a secure and efficient process.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  "Register as a donor, hospital, or administrator",
                  "Track your donation history and eligibility",
                  "Receive alerts for urgent blood needs",
                  "Access real-time inventory information",
                ].map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start bg-white p-3 rounded-lg shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="h-5 w-5 rounded-full bg-bloodRed-100 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-bloodRed-600" />
                    </div>
                    <p className="text-gray-700">{benefit}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600">
                  "By joining LifeFlow, I've been able to donate blood regularly and track the impact of my donations. The process is seamless and I feel like I'm making a real difference."
                </p>
                <div className="mt-3 flex items-center justify-center lg:justify-start">
                  <div className="h-8 w-8 rounded-full bg-gray-300 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Regular Donor</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;
