
import { motion } from 'framer-motion';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Heart, 
  Award, 
  Users, 
  TrendingUp, 
  BarChart4, 
  Globe,
  Droplets,
  FileText,
  Stethoscope,
  BookOpen,
  ShieldCheck,
  FileCode,
  Cookie
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

        {/* Donor Guidelines Section */}
        <section id="guidelines" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <ShieldCheck className="h-16 w-16 mx-auto mb-6 text-bloodRed-600" />
                <h2 className="text-3xl font-bold mb-4">Donor Guidelines</h2>
                <p className="text-gray-600">
                  Important information to know before donating blood.
                </p>
              </motion.div>
              
              <div className="space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Basic Eligibility Requirements</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Be at least 17 years old (16 with parental consent in some states)</li>
                    <li>Weigh at least 110 pounds</li>
                    <li>Be in good general health and feeling well</li>
                    <li>Have not donated blood in the last 56 days</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Before Your Donation</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Get a good night's sleep</li>
                    <li>Eat a healthy meal before donating</li>
                    <li>Drink plenty of fluids</li>
                    <li>Bring a valid ID</li>
                    <li>Wear comfortable clothing with sleeves that can be raised above the elbow</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Blood Types Section */}
        <section id="blood-types" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <Droplets className="h-16 w-16 mx-auto mb-6 text-bloodRed-600" />
                <h2 className="text-3xl font-bold mb-4">Blood Types</h2>
                <p className="text-gray-600">
                  Understanding different blood types and compatibility.
                </p>
              </motion.div>
              
              <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Can Donate To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Can Receive From</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { type: "A+", donateTo: "A+, AB+", receiveFrom: "A+, A-, O+, O-" },
                      { type: "A-", donateTo: "A+, A-, AB+, AB-", receiveFrom: "A-, O-" },
                      { type: "B+", donateTo: "B+, AB+", receiveFrom: "B+, B-, O+, O-" },
                      { type: "B-", donateTo: "B+, B-, AB+, AB-", receiveFrom: "B-, O-" },
                      { type: "AB+", donateTo: "AB+", receiveFrom: "All Blood Types" },
                      { type: "AB-", donateTo: "AB+, AB-", receiveFrom: "A-, B-, AB-, O-" },
                      { type: "O+", donateTo: "A+, B+, AB+, O+", receiveFrom: "O+, O-" },
                      { type: "O-", donateTo: "All Blood Types", receiveFrom: "O-" },
                    ].map((blood, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-bloodRed-600">{blood.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{blood.donateTo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{blood.receiveFrom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        
        {/* Health Information Section */}
        <section id="health-info" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <Stethoscope className="h-16 w-16 mx-auto mb-6 text-bloodRed-600" />
                <h2 className="text-3xl font-bold mb-4">Health Information</h2>
                <p className="text-gray-600">
                  Important health considerations for blood donors and recipients.
                </p>
              </motion.div>
              
              <div className="space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Donor Health Benefits</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Free health screening that checks pulse, blood pressure, body temperature, and hemoglobin levels</li>
                    <li>Reduction in iron stores, which can reduce the risk of heart disease</li>
                    <li>Production of new blood cells, which can help maintain good health</li>
                    <li>Potential caloric burn of up to 650 calories during the donation process</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Post-Donation Care</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Rest for a few minutes after donation</li>
                    <li>Drink extra fluids for the next 48 hours</li>
                    <li>Avoid strenuous physical activity for 24 hours</li>
                    <li>Keep the bandage on for at least four hours</li>
                    <li>Eat well-balanced meals for the next few days</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Research Section */}
        <section id="research" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <BookOpen className="h-16 w-16 mx-auto mb-6 text-bloodRed-600" />
                <h2 className="text-3xl font-bold mb-4">Research</h2>
                <p className="text-gray-600">
                  Advancing blood science and transfusion medicine through research.
                </p>
              </motion.div>
              
              <div className="space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Current Research Projects</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                    <li>Development of artificial blood substitutes</li>
                    <li>Extended storage techniques for blood components</li>
                    <li>Pathogen reduction technologies</li>
                    <li>Genomic studies on blood disorders</li>
                    <li>Innovative blood testing methodologies</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4">Research Partnerships</h3>
                  <p className="text-gray-600 mb-4">
                    We collaborate with leading research institutions, universities, and healthcare organizations to advance
                    the field of transfusion medicine and improve blood donation outcomes.
                  </p>
                  <p className="text-gray-600">
                    If you're interested in participating in our research studies or learning more about our findings,
                    please contact our research department at research@lifeflow.org.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQs Section */}
        <section id="faqs" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <FileText className="h-16 w-16 mx-auto mb-6 text-bloodRed-600" />
                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600">
                  Common questions about blood donation and our services.
                </p>
              </motion.div>
              
              <div className="space-y-6">
                {[
                  {
                    question: "How often can I donate blood?",
                    answer: "You can donate whole blood every 56 days, plasma every 28 days, and platelets every 7 days (up to 24 times per year)."
                  },
                  {
                    question: "Does blood donation hurt?",
                    answer: "Most people feel only a slight pinch when the needle is inserted. The actual donation process is typically painless."
                  },
                  {
                    question: "How long does a blood donation take?",
                    answer: "The entire process takes about an hour, but the actual blood donation only takes about 8-10 minutes."
                  },
                  {
                    question: "Is it safe to donate blood?",
                    answer: "Yes, donating blood is completely safe. All equipment is sterile and used only once."
                  },
                  {
                    question: "What happens to my blood after donation?",
                    answer: "Your blood is tested, processed, and separated into components that can help multiple patients."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Terms of Service Section */}
        <section id="terms" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <FileCode className="h-16 w-16 mx-auto mb-6 text-bloodRed-600" />
                <h2 className="text-3xl font-bold mb-4">Terms of Service</h2>
                <p className="text-gray-600">
                  Our terms and conditions for using the LifeFlow platform.
                </p>
              </motion.div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">LifeFlow Terms of Service</h3>
                <p className="text-gray-600 mb-4">
                  By using the LifeFlow platform, you agree to comply with and be bound by the following terms and conditions.
                  Please read these terms carefully before using our services.
                </p>
                
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>1. Acceptance of Terms:</strong> By accessing or using LifeFlow, you agree to be bound by these Terms of Service.
                  </p>
                  <p>
                    <strong>2. Privacy Policy:</strong> Your use of LifeFlow is also governed by our Privacy Policy, which is incorporated herein by reference.
                  </p>
                  <p>
                    <strong>3. User Accounts:</strong> You are responsible for maintaining the confidentiality of your account information and password.
                  </p>
                  <p>
                    <strong>4. Medical Information:</strong> The information provided on LifeFlow is for informational purposes only and is not a substitute for professional medical advice.
                  </p>
                  <p>
                    <strong>5. Limitation of Liability:</strong> LifeFlow and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Privacy Policy Section */}
        <section id="privacy" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <ShieldCheck className="h-16 w-16 mx-auto mb-6 text-bloodRed-600" />
                <h2 className="text-3xl font-bold mb-4">Privacy Policy</h2>
                <p className="text-gray-600">
                  How we collect, use, and protect your personal information.
                </p>
              </motion.div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">LifeFlow Privacy Policy</h3>
                <p className="text-gray-600 mb-4">
                  We are committed to protecting your privacy and providing a safe online experience. This privacy policy outlines
                  how we collect, use, and safeguard your information.
                </p>
                
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>1. Information Collection:</strong> We collect personal information such as name, contact details, and health information necessary for blood donation.
                  </p>
                  <p>
                    <strong>2. Use of Information:</strong> Your information is used to facilitate blood donation, match donors with recipients, and improve our services.
                  </p>
                  <p>
                    <strong>3. Data Security:</strong> We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.
                  </p>
                  <p>
                    <strong>4. Information Sharing:</strong> We may share your information with healthcare providers, blood banks, and regulatory authorities as required.
                  </p>
                  <p>
                    <strong>5. Your Rights:</strong> You have the right to access, correct, or delete your personal information at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Cookie Policy Section */}
        <section id="cookies" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <Cookie className="h-16 w-16 mx-auto mb-6 text-bloodRed-600" />
                <h2 className="text-3xl font-bold mb-4">Cookie Policy</h2>
                <p className="text-gray-600">
                  How we use cookies and similar technologies on our platform.
                </p>
              </motion.div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">LifeFlow Cookie Policy</h3>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content.
                </p>
                
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>1. What Are Cookies:</strong> Cookies are small text files stored on your device that help us recognize you and provide a better experience.
                  </p>
                  <p>
                    <strong>2. Types of Cookies:</strong> We use essential cookies for site functionality, analytics cookies to understand usage, and marketing cookies for personalized content.
                  </p>
                  <p>
                    <strong>3. Managing Cookies:</strong> You can control cookies through your browser settings, including blocking or deleting them.
                  </p>
                  <p>
                    <strong>4. Third-Party Cookies:</strong> Some cookies may be placed by third-party services that appear on our pages.
                  </p>
                  <p>
                    <strong>5. Updates to This Policy:</strong> We may update this Cookie Policy from time to time to reflect changes in technology or regulation.
                  </p>
                </div>
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
