
import { motion } from 'framer-motion';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Check, 
  AlertCircle,
  Heart 
} from 'lucide-react';

const Donate = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-bloodRed-600 to-bloodRed-800 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Heart className="h-16 w-16 mx-auto mb-6 text-white" />
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">Become a Donor Today</h1>
                <p className="text-xl text-white/80 mb-8">
                  Your donation can save up to three lives. Join our community of heroes making a difference.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Donation Process */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold mb-4">The Donation Process</h2>
                <p className="text-gray-600">
                  Donating blood is a simple and straightforward process that takes less than an hour.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                  className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl font-semibold mb-4">Eligibility Requirements</h3>
                  <ul className="space-y-3">
                    {[
                      'Be at least 17 years old',
                      'Weigh at least 110 pounds (50 kg)',
                      'Be in good general health',
                      'Have not donated blood in the last 56 days',
                      'Have a valid ID',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3 className="text-xl font-semibold mb-4">What to Expect</h3>
                  <ul className="space-y-3">
                    {[
                      'Registration and brief health screening',
                      'Mini-physical examination (temperature, pulse, blood pressure)',
                      'A small blood sample to check hemoglobin levels',
                      'The donation itself takes about 10-15 minutes',
                      'Rest and refreshments afterward',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Important:</strong> Please eat a healthy meal and drink plenty of water before donating. 
                  Also, bring a list of medications you're currently taking.
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Donation Locations */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold mb-4">Donation Locations</h2>
                <p className="text-gray-600">
                  Find a donation center near you and schedule your appointment today.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Central Blood Bank",
                    address: "123 Main Street, Downtown",
                    hours: "Mon-Fri: 8am-7pm, Sat: 9am-5pm",
                  },
                  {
                    name: "Westside Medical Center",
                    address: "456 Park Avenue, Westside",
                    hours: "Mon-Fri: 9am-6pm, Sat: 10am-4pm",
                  },
                  {
                    name: "Northview Hospital",
                    address: "789 Oak Boulevard, Northview",
                    hours: "Mon-Sun: 8am-8pm",
                  },
                ].map((location, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <h3 className="text-xl font-semibold mb-2">{location.name}</h3>
                    <div className="space-y-2 text-gray-600 mb-4">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-bloodRed-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{location.address}</span>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-bloodRed-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{location.hours}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-bloodRed-600 hover:bg-bloodRed-700">
                      Schedule Appointment
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Calendar className="h-16 w-16 mx-auto mb-6 text-bloodRed-600" />
                <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
                <p className="text-xl text-gray-600 mb-8">
                  Schedule your donation appointment today and join our community of heroes.
                </p>
                <Button className="bg-bloodRed-600 hover:bg-bloodRed-700 h-12 px-8 text-lg">
                  Schedule Appointment
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Donate;
