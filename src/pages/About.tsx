
import { motion } from 'framer-motion';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Heart, 
  Award, 
  Users, 
  TrendingUp, 
  BarChart4, 
  Globe 
} from 'lucide-react';

const About = () => {
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
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">About LifeFlow</h1>
                <p className="text-xl text-white/80 mb-8">
                  Revolutionizing blood donation and management with AI-powered technology.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Our Mission */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                  <p className="text-gray-600 mb-6">
                    At LifeFlow, we're on a mission to bridge the gap between blood donors and patients in need. 
                    Using cutting-edge technology and AI-driven solutions, we aim to make blood donation more 
                    accessible, efficient, and impactful.
                  </p>
                  <p className="text-gray-600">
                    Every two seconds, someone in the world needs blood. Through our innovative platform, 
                    we're working to ensure that no patient goes without the life-saving blood they require, 
                    while making the donation process simple and rewarding for donors.
                  </p>
                </motion.div>
                
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-md">
                    <img 
                      src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1000"
                      alt="Medical professionals with blood donation equipment" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Award className="h-8 w-8 text-bloodRed-600" />
                      <div>
                        <p className="text-sm text-gray-500">Founded</p>
                        <p className="font-semibold">2024</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Impact */}
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
                <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
                <p className="text-gray-600">
                  Making a difference in communities worldwide through innovative blood donation technologies.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "10,000+",
                    subtitle: "Donors",
                    description: "Active blood donors registered on our platform worldwide.",
                    icon: Users,
                  },
                  {
                    title: "30,000+",
                    subtitle: "Lives Saved",
                    description: "Patients who received life-saving blood through our network.",
                    icon: Heart,
                  },
                  {
                    title: "500+",
                    subtitle: "Medical Partners",
                    description: "Hospitals and clinics using our blood management system.",
                    icon: Globe,
                  },
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="bg-bloodRed-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="h-8 w-8 text-bloodRed-600" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-1">{stat.title}</h3>
                    <p className="text-bloodRed-600 font-medium mb-4">{stat.subtitle}</p>
                    <p className="text-gray-600">{stat.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Technology */}
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
                <h2 className="text-3xl font-bold mb-4">Our Technology</h2>
                <p className="text-gray-600">
                  Powered by artificial intelligence and data analytics to optimize the blood donation ecosystem.
                </p>
              </motion.div>
              
              <div className="space-y-12">
                {[
                  {
                    title: "AI-Powered Matching",
                    description: "Our intelligent algorithm matches donors with recipients based on blood type compatibility, location, and urgency, ensuring the most efficient use of blood resources.",
                    icon: TrendingUp,
                  },
                  {
                    title: "Predictive Analytics",
                    description: "Advanced analytics help predict blood demand patterns, allowing blood banks to maintain optimal inventory levels and reduce wastage due to expiration.",
                    icon: BarChart4,
                  },
                ].map((tech, index) => (
                  <motion.div 
                    key={index}
                    className="flex flex-col md:flex-row gap-6 items-start"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="bg-bloodRed-50 h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0">
                      <tech.icon className="h-8 w-8 text-bloodRed-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{tech.title}</h3>
                      <p className="text-gray-600">{tech.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Team */}
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
                <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
                <p className="text-gray-600">
                  Meet the dedicated professionals working to revolutionize blood donation and management.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    name: "Dr. Sarah Johnson",
                    title: "CEO & Co-Founder",
                    bio: "Former hematologist with 15 years of experience in blood banking and transfusion medicine.",
                    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                  },
                  {
                    name: "Michael Chen",
                    title: "CTO & Co-Founder",
                    bio: "AI specialist with expertise in healthcare technology and predictive analytics systems.",
                    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
                  },
                  {
                    name: "Dr. Amara Okafor",
                    title: "Chief Medical Officer",
                    bio: "Specializes in transfusion safety protocols and blood component therapy research.",
                    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200"
                  },
                ].map((person, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={person.image} 
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-1">{person.name}</h3>
                      <p className="text-bloodRed-600 font-medium mb-3">{person.title}</p>
                      <p className="text-gray-600">{person.bio}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
