
import { motion } from 'framer-motion';
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { BloodInventory } from "@/components/BloodInventory";
import { Footer } from "@/components/Footer";
import { 
  Clock, 
  Award, 
  Shield, 
  Heart, 
  User, 
  BarChart, 
  MessageSquare,
  Brain,
  Sparkles,
  Mic,
  BellRing
} from 'lucide-react';

const Index = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />
        
        {/* Blood Inventory Section */}
        <BloodInventory />
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.h2 
                className="text-3xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Why Choose LifeFlow?
              </motion.h2>
              <motion.p 
                className="text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Our innovative blood bank management system uses cutting-edge technology to connect donors with patients efficiently and safely.
              </motion.p>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Clock,
                  title: 'Real-Time Tracking',
                  description: 'Monitor blood inventory levels and donation status in real-time with our advanced tracking system.',
                },
                {
                  icon: Shield,
                  title: 'Secure & Private',
                  description: 'Your personal and medical information is protected with bank-level security and encryption.',
                },
                {
                  icon: Award,
                  title: 'Quality Assurance',
                  description: 'Every donation goes through rigorous testing and verification to ensure safety and quality.',
                },
                {
                  icon: User,
                  title: 'AI-Powered Matching',
                  description: 'Our intelligent system matches donors with recipients based on blood type and location.',
                },
                {
                  icon: BarChart,
                  title: 'Demand Prediction',
                  description: 'Advanced analytics help predict blood demand, ensuring adequate supply during emergencies.',
                },
                {
                  icon: MessageSquare,
                  title: 'Smart Notifications',
                  description: 'Receive timely alerts about donation appointments, blood drives, and urgent needs.',
                },
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  variants={itemVariants}
                >
                  <div className="bg-bloodRed-50 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-bloodRed-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* NEW: AI Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Brain className="h-16 w-16 mx-auto mb-4 text-bloodRed-600" />
                <h2 className="text-3xl font-bold mb-4">AI-Powered Features</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  LifeFlow leverages artificial intelligence to optimize the blood donation ecosystem,
                  making the process more efficient and saving more lives.
                </p>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Sparkles,
                  title: 'AI-based Donor Matching',
                  description: 'Our intelligent system automatically connects blood requests with eligible nearby donors based on blood type, location, and donation history.',
                },
                {
                  icon: BarChart,
                  title: 'Predictive Demand Analysis',
                  description: 'Advanced machine learning algorithms forecast upcoming blood shortages using historical data, seasonal trends, and regional health patterns.',
                },
                {
                  icon: Mic,
                  title: 'Voice-Enabled Assistance',
                  description: 'Integration with ElevenLabs provides natural voice interactions for donors and hospitals, making the system more accessible.',
                },
                {
                  icon: BellRing,
                  title: 'Smart Notifications',
                  description: 'AI-driven alert system identifies when specific donors should be contacted based on blood type demand and their eligibility status.',
                },
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-50 rounded-xl p-8 border border-gray-100 shadow-sm"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-start">
                    <div className="bg-bloodRed-100 h-14 w-14 rounded-lg flex items-center justify-center mr-5">
                      <feature.icon className="h-8 w-8 text-bloodRed-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Overview Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.h2 
                className="text-3xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Technical Overview
              </motion.h2>
              <motion.p 
                className="text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Built with modern technologies to ensure reliability, security, and performance.
              </motion.p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {[
                  {
                    title: 'Frontend',
                    items: ['React with TypeScript', 'Tailwind CSS', 'Shadcn UI', 'Framer Motion', 'React Query']
                  },
                  {
                    title: 'AI & Data',
                    items: ['Predictive Analytics', 'Voice Synthesis (ElevenLabs)', 'Intelligent Matching System', 'Real-time Data Processing']
                  },
                  {
                    title: 'Security',
                    items: ['Role-based Access Control', 'Data Encryption', 'Secure Authentication', 'HIPAA Compliance']
                  },
                  {
                    title: 'User Experience',
                    items: ['Responsive Design', 'Accessible Interface', 'Intuitive Navigation', 'Real-time Feedback']
                  }
                ].map((section, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-bloodRed-700">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="h-2 w-2 bg-bloodRed-500 rounded-full mr-3"></div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Call To Action */}
        <section className="py-16 bg-gradient-to-r from-bloodRed-600 to-bloodRed-800 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Heart className="h-16 w-16 mx-auto mb-6 text-white" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Save Lives?</h2>
                <p className="text-xl text-white/80 mb-8">
                  Your donation can save up to three lives. Join our community of donors today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/donate" className="bg-white text-bloodRed-600 hover:bg-gray-100 transition-colors font-medium rounded-lg px-8 py-3">
                    Become a Donor
                  </a>
                  <a href="/request" className="bg-bloodRed-700 text-white border border-white/20 hover:bg-bloodRed-800 transition-colors font-medium rounded-lg px-8 py-3">
                    Request Blood
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
