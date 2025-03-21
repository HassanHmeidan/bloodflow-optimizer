
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  Loader2, 
  HelpCircle, 
  Info,
  Search,
  Calendar,
  Droplet,
  User,
  Clock,
  MapPin,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

type Message = {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

// Categorized suggested questions to help users interact with the chatbot
const suggestedQuestions = {
  donation: [
    "How can I donate blood?",
    "What are the eligibility requirements?",
    "How long does donation take?",
    "When can I donate again?",
    "What should I do before donating?",
    "What happens after I donate?",
  ],
  medical: [
    "What blood types are needed most?",
    "What is my blood used for?",
    "Is donating blood safe?",
    "Will donating blood make me weak?",
    "How much blood is taken?",
    "Can I donate if I have a medical condition?",
  ],
  logistics: [
    "Where is the nearest donation center?",
    "How do I schedule an appointment?",
    "Can I walk in without an appointment?",
    "How long does the whole process take?",
    "What documents do I need to bring?",
    "Are there mobile blood drives?",
  ],
  about: [
    "How does LifeFlow work?",
    "Who is behind LifeFlow?",
    "How is my data protected?",
    "Can I see where my blood goes?",
    "How can I volunteer?",
    "How can I request blood?",
  ],
};

const initialMessages: Message[] = [
  {
    id: 1,
    text: "👋 Hi there! I'm LifeFlow's virtual assistant. How can I help you with blood donation today?\n\nYou can ask me anything or select a category below to see common questions.",
    isUser: false,
    timestamp: new Date()
  }
];

export const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("donation");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = async (e?: React.FormEvent, suggestedQuestion?: string) => {
    if (e) e.preventDefault();
    
    const messageToSend = suggestedQuestion || inputValue;
    if (!messageToSend.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: messageToSend,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      // Simulate network delay for AI response (would be replaced by real AI API)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      // Generate an AI response based on the user's input
      const aiResponse = generateAIResponse(userMessage.text);
      
      // Check if the response includes a navigation command
      if (aiResponse.includes("[NAVIGATE:")) {
        const route = aiResponse.match(/\[NAVIGATE:(.*?)\]/)?.[1];
        if (route) {
          const cleanResponse = aiResponse.replace(/\[NAVIGATE:.*?\]/, "").trim();
          
          // Add the response
          const botMessage: Message = {
            id: Date.now(),
            text: cleanResponse,
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
          
          // Wait a moment before navigating
          setTimeout(() => {
            toast.info("Navigating to the requested page...");
            navigate(route);
          }, 1000);
        }
      } else {
        // Regular response
        const botMessage: Message = {
          id: Date.now(),
          text: aiResponse,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
      
      // Always show suggestions after bot responds - MODIFIED HERE
      setTimeout(() => setShowSuggestions(true), 500);
      
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage: Message = {
        id: Date.now(),
        text: "I apologize, but I'm having trouble processing your request. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestedQuestionClick = (question: string) => {
    handleSendMessage(undefined, question);
  };
  
  // Advanced AI response generator that handles a wide range of questions
  const generateAIResponse = (userInput: string): string => {
    // Convert to lowercase for easier matching
    const input = userInput.toLowerCase();
    
    // Blood donation process
    if (input.includes("process") || input.includes("what happens") || input.includes("how does") || 
        input.includes("steps") || input.includes("procedure")) {
      return "The blood donation process is simple and takes about an hour from start to finish:\n\n1️⃣ Registration and health history\n2️⃣ Mini-physical (temperature, pulse, blood pressure, hemoglobin)\n3️⃣ The actual donation (just 8-10 minutes)\n4️⃣ Refreshments and rest (15 minutes)\n\nThe needle used is sterile and disposed of after use, so there's no risk of infection. Would you like to know more about any specific part of the process?";
    }
    
    // Looking for appointment-related keywords
    if (input.includes("schedule") || input.includes("appointment") || input.includes("donate") || 
        input.includes("book") || input.includes("when can i") || input.includes("how to donate")) {
      return "I'd be happy to help you schedule a blood donation appointment! You can visit our donation page to set up a time and location that works for you. [NAVIGATE:/donate]";
    }
    
    // Looking for blood request keywords
    if (input.includes("need blood") || input.includes("request blood") || input.includes("get blood") || 
        input.includes("blood for patient") || input.includes("emergency")) {
      return "If you need to request blood for a patient, you can submit a request through our dedicated page. Let me take you there. [NAVIGATE:/request]";
    }
    
    // Looking for eligibility keywords with detailed response
    if (input.includes("eligible") || input.includes("can i donate") || input.includes("requirement") || 
        input.includes("qualification") || input.includes("allowed to")) {
      return "To be eligible for blood donation, you generally need to meet these criteria:\n\n✅ Be at least 17 years old (16 with parental consent in some states)\n✅ Weigh at least 110 pounds (50 kg)\n✅ Be in good general health\n✅ Have normal blood pressure and pulse\n✅ Have adequate iron levels\n\nSome factors that might temporarily defer you from donating:\n\n❌ Recent illness or fever\n❌ Certain medications\n❌ Recent travel to specific regions\n❌ Recent tattoos or piercings (usually a 3-month wait)\n❌ Pregnancy (must wait 6 weeks after delivery)\n\nWould you like me to check specific eligibility criteria for you?";
    }
    
    // Looking for time-related questions with detailed answer
    if (input.includes("how long") || input.includes("how much time") || input.includes("duration") || 
        input.includes("take") || input.includes("minutes") || input.includes("hours")) {
      return "Here's a breakdown of the time involved in blood donation:\n\n⏱️ Registration and health screening: 10-15 minutes\n⏱️ Mini-physical (vital signs check): 5 minutes\n⏱️ The actual donation: 8-10 minutes for whole blood\n⏱️ Rest and refreshments: 15 minutes\n\nTotal time: About 45-60 minutes from start to finish.\n\nFor specialized donations like platelets or plasma, the process takes longer (about 1.5-2 hours) because your blood is drawn, the specific components are separated, and the remaining blood is returned to your body.";
    }
    
    // Looking for blood type related questions with detailed info
    if (input.includes("blood type") || input.includes("universal donor") || input.includes("universal recipient") || 
        input.includes("common blood") || input.includes("rare blood") || input.includes("o negative") || input.includes("o positive") || input.includes("ab")) {
      return "Blood types are categorized by the ABO system and Rh factor (+ or -):\n\n🔹 O-negative (O-): Universal donor, can donate to any blood type (10% of population)\n🔹 O-positive (O+): Most common type (38% of population)\n🔹 A-negative (A-): Can donate to A and AB (6% of population)\n🔹 A-positive (A+): Second most common (34% of population)\n🔹 B-negative (B-): Somewhat rare (2% of population)\n🔹 B-positive (B+): (9% of population)\n🔹 AB-negative (AB-): Very rare (1% of population)\n🔹 AB-positive (AB+): Universal recipient, can receive any type (3% of population)\n\nRare blood types are always in demand. Do you know your blood type?";
    }
    
    // Looking for post-donation questions with comprehensive advice
    if (input.includes("after") || input.includes("recovery") || input.includes("care") || 
        input.includes("eat") || input.includes("drink") || input.includes("dizzy")) {
      return "After donating blood, follow these post-donation care tips:\n\n💧 Drink extra fluids for the next 48 hours\n🍎 Eat iron-rich foods like red meat, spinach, and beans\n🚫 Avoid strenuous physical activity for 24 hours\n🧘‍♂️ Rest if you feel lightheaded or dizzy\n🚿 Keep the bandage on for at least 4 hours\n🚭 Avoid smoking for 2 hours\n🍺 Avoid alcohol for 24 hours\n\nIf you experience prolonged dizziness, nausea, or the donation site continues to bleed, contact our donor support line immediately.";
    }
    
    // Looking for blood facts or importance with statistics
    if (input.includes("why") || input.includes("important") || input.includes("benefit") || 
        input.includes("impact") || input.includes("save") || input.includes("help")) {
      return "Your blood donation makes a life-saving difference:\n\n❤️ One donation can save up to 3 lives\n❤️ Every 2 seconds, someone in the US needs blood\n❤️ Only 3% of eligible Americans donate blood yearly\n❤️ Blood is needed for surgeries, cancer treatments, trauma, childbirth, and chronic illnesses\n❤️ Red blood cells last only 42 days in storage\n❤️ Platelets must be used within just 5 days\n\nBlood cannot be manufactured – it can only come from generous donors like you. Your single donation can help multiple patients through different blood components (red cells, platelets, and plasma).";
    }
    
    // Looking for about the organization
    if (input.includes("about") || input.includes("lifeflow") || input.includes("who are you") || 
        input.includes("organization") || input.includes("company")) {
      return "LifeFlow is a blood donation management system that connects donors with patients efficiently and safely. We use technology to streamline the donation process and ensure blood gets to those who need it most. Would you like to learn more about us? [NAVIGATE:/about]";
    }
    
    // Looking for login/account related questions
    if (input.includes("login") || input.includes("sign in") || input.includes("account") || 
        input.includes("register") || input.includes("profile")) {
      return "You can access your account or create a new one through our authentication page. Let me take you there! [NAVIGATE:/auth]";
    }
    
    // How often can I donate
    if (input.includes("how often") || input.includes("frequency") || input.includes("when again") || 
        input.includes("next donation") || input.includes("between donations")) {
      return "Donation frequency depends on the type of donation:\n\n⏰ Whole blood: Every 56 days (8 weeks)\n⏰ Power Red (double red cells): Every 112 days (16 weeks)\n⏰ Platelets: Every 7 days (up to 24 times per year)\n⏰ Plasma: Every 28 days (up to 13 times per year)\n\nThese intervals allow your body to replenish what you've donated. Most donors find that whole blood donation every 2-3 months works well with their schedule.";
    }
    
    // What to bring or do before donation
    if (input.includes("before") || input.includes("prepare") || input.includes("bring") || 
        input.includes("preparation") || input.includes("ready") || input.includes("eat before")) {
      return "To prepare for your blood donation:\n\n✅ Eat a healthy meal within 2-3 hours before donating\n✅ Drink plenty of water (avoid alcohol for 24 hours before)\n✅ Get a good night's sleep\n✅ Wear a shirt with sleeves that can be rolled up\n✅ Bring your ID and donor card (if you have one)\n✅ Make a list of any medications you're taking\n✅ Know your travel history for the past 3 years\n\nOn the day of donation, have iron-rich foods like lean red meat, spinach, beans, or fortified cereals.";
    }
    
    // What happens to donated blood
    if (input.includes("what happens to") || input.includes("where does") || input.includes("blood go") || 
        input.includes("after donation") || input.includes("testing") || input.includes("process blood")) {
      return "After collection, your donated blood goes through several important steps:\n\n1️⃣ Testing for infectious diseases and blood typing\n2️⃣ Processing into components (red cells, platelets, plasma)\n3️⃣ Storage under carefully controlled conditions\n4️⃣ Distribution to hospitals based on need\n5️⃣ Transfusion to patients\n\nEvery donation is thoroughly tested for HIV, hepatitis B and C, West Nile virus, and other pathogens. Your blood type is also confirmed. This entire process usually takes 1-3 days before blood is available for patients.";
    }
    
    // Health conditions and medications
    if (input.includes("medication") || input.includes("health condition") || input.includes("disease") || 
        input.includes("illness") || input.includes("sick") || input.includes("medical") ||
        input.includes("diabetes") || input.includes("high blood pressure") || input.includes("anemia")) {
      return "Some health conditions and medications may affect eligibility to donate blood:\n\n✅ Controlled conditions like high blood pressure or diabetes are often acceptable\n✅ Asthma is generally acceptable if not having an attack\n✅ Many prescription medications are fine (blood pressure, thyroid, etc.)\n\n❌ You should not donate if you're feeling ill or have a fever\n❌ Some medications require a waiting period (like antibiotics or blood thinners)\n❌ Conditions that affect blood clotting may disqualify you\n\nFor specific conditions or medications, please consult with donation staff who can provide personalized guidance. Would you like to know about a specific condition or medication?";
    }
    
    // COVID-19 related questions
    if (input.includes("covid") || input.includes("coronavirus") || input.includes("vaccine") || 
        input.includes("vaccination") || input.includes("pandemic") || input.includes("booster")) {
      return "Regarding COVID-19 and blood donation:\n\n✅ You can donate after receiving a COVID-19 vaccine with no waiting period for most vaccines\n✅ If you've had COVID-19, you can donate once you've fully recovered and are symptom-free for 14 days\n✅ Donation centers follow strict safety protocols including enhanced cleaning\n✅ Staff and donors are typically screened for symptoms\n\nYour donation is especially important during the pandemic as blood supplies have been affected by decreased donations. Blood donation is considered an essential activity, and centers have implemented safety measures to protect donors.";
    }
    
    // Different types of donations
    if (input.includes("types of donation") || input.includes("whole blood") || input.includes("plasma") || 
        input.includes("platelets") || input.includes("double red") || input.includes("apheresis")) {
      return "There are several types of blood donations:\n\n🩸 Whole Blood: Most common, takes about 10 minutes, all blood components collected\n🩸 Power Red/Double Red: Collects two units of red cells, returns plasma and platelets, takes 30 minutes\n🩸 Platelets: Takes 1.5-2 hours, platelets collected while returning other components, can donate every 7 days\n🩸 Plasma: Takes about 1 hour, plasma collected while returning red cells, can donate every 28 days\n\nThe type that's best for you depends on your blood type, eligibility factors, and local patient needs. Would you like to know which donation type might be best for you?";
    }
    
    // Iron and hemoglobin questions
    if (input.includes("iron") || input.includes("hemoglobin") || input.includes("anemic") || 
        input.includes("low iron") || input.includes("ferritin") || input.includes("hematocrit")) {
      return "Iron levels are important for blood donation eligibility:\n\n✅ Minimum hemoglobin levels are 12.5 g/dL for women and 13.0 g/dL for men\n✅ You can boost iron by eating red meat, seafood, beans, dark leafy greens\n✅ Vitamin C helps iron absorption (try eating citrus with iron-rich foods)\n\n❌ Frequent donation can deplete iron stores\n❌ Some donors may benefit from iron supplements (consult your doctor)\n\nYour iron levels will be checked before each donation with a quick fingerstick test. If levels are too low, you'll be temporarily deferred but can try again once your levels improve.";
    }
    
    // First-time donor questions
    if (input.includes("first time") || input.includes("never donated") || input.includes("nervous") || 
        input.includes("scared") || input.includes("anxiety") || input.includes("what to expect")) {
      return "For first-time donors, here's what to expect:\n\n1️⃣ Registration: Bring ID and answer health questions\n2️⃣ Mini-physical: Quick check of temperature, pulse, blood pressure, and hemoglobin\n3️⃣ Donation: Seated comfortably while about a pint of blood is collected (8-10 minutes)\n4️⃣ Refreshments: Enjoy snacks and drinks for 15 minutes before leaving\n\nTips for success:\n• Hydrate well before your appointment\n• Eat a healthy meal\n• Wear a short-sleeved shirt or one with sleeves that roll up easily\n• Let staff know it's your first time - they'll take extra care with you\n• Bring a friend for support\n\nIt's normal to be nervous, but most people find it easier than expected!";
    }
    
    // Student and youth donors
    if (input.includes("student") || input.includes("school") || input.includes("college") || 
        input.includes("university") || input.includes("teen") || input.includes("young") ||
        input.includes("high school") || input.includes("age")) {
      return "For young and student donors:\n\n✅ Minimum age is 16 in most states (with parental consent) or 17 without consent\n✅ Weight requirements apply (typically minimum 110 pounds)\n✅ High school and college blood drives provide ~20% of all donations\n✅ Special considerations for young donors include height/weight requirements\n\nSchools often host blood drives, making it convenient for students to donate. Some tips for young donors:\n• Hydrate very well before donating\n• Eat a full, healthy meal\n• Consider having a parent or friend with you\n• Plan for a lighter schedule after donating (avoid strenuous activities)\n\nYour donation can help establish a lifelong habit of giving!";
    }

    // General healthcare questions
    if (input.includes("doctor") || input.includes("hospital") || input.includes("healthcare") || 
        input.includes("medical help") || input.includes("emergency") || input.includes("sick")) {
      return "If you're experiencing a medical emergency, please call emergency services (911 in the US) immediately.\n\nIf you're looking for general healthcare information:\n\n• For non-urgent medical questions, consult your primary care physician\n• Many health insurance companies have nurse advice lines available 24/7\n• Local urgent care centers can help with immediate non-emergency concerns\n• Public health departments offer various health services and information\n\nPlease note that while I can provide general information about blood donation, I'm not qualified to give medical advice for specific health conditions. Would you like information about a specific blood donation-related topic instead?";
    }

    // Needle phobia or fear
    if (input.includes("needle") || input.includes("afraid") || input.includes("fear") || 
        input.includes("phobia") || input.includes("faint") || input.includes("pass out") ||
        input.includes("scared of") || input.includes("pain")) {
      return "It's completely normal to be concerned about needles. Here are some tips that might help:\n\n• Tell the staff it's a concern - they're experienced with nervous donors\n• Look away during needle insertion - bring a friend to chat with\n• Practice deep breathing exercises before and during donation\n• Eat well and stay hydrated before donating\n• The actual needle sensation is brief - many compare it to a quick pinch\n• Bring something distracting like music or a video to watch\n• Remember why you're donating - your temporary discomfort saves lives\n\nMany people with needle anxiety still donate successfully. The staff will make sure you're comfortable and can stop the process if needed.";
    }

    // Users asking about user roles
    if (input.includes("admin") || input.includes("hospital") || input.includes("user") || 
        input.includes("roles") || input.includes("permissions") || input.includes("different accounts")) {
      return "LifeFlow has different user roles with specific permissions:\n\n👤 Regular Users (Donors):\n• Can schedule donation appointments\n• View their donation history\n• Update personal information\n• Receive notifications about donation opportunities\n\n🏥 Hospital Staff:\n• Request specific blood types and quantities\n• View available blood inventory\n• Track incoming blood shipments\n• Manage patient blood needs\n\n👑 Administrators:\n• Manage all users and their roles\n• View system-wide analytics and reports\n• Configure system settings and policies\n• Coordinate blood drives and special events\n\nTo create or change your account type, please contact our support team who can verify your credentials and set up the appropriate access level.";
    }
    
    // AI recommendations
    if (input.includes("ai") || input.includes("artificial intelligence") || input.includes("machine learning") || 
        input.includes("chatbot") || input.includes("automated") || input.includes("smart system")) {
      return "LifeFlow leverages AI technology in several ways:\n\n🤖 Our chatbot assistant (that's me!) to answer questions and guide users\n🤖 Predictive analytics to forecast blood needs based on historical data\n🤖 Matching algorithms to connect donors with recipients efficiently\n🤖 Personalized donation reminders based on your donation history\n\nWe're constantly improving our AI capabilities to make blood donation more efficient and effective. In the future, we plan to add voice-enabled interactions and more personalized recommendations for donors. Do you have any suggestions for how we could use AI to improve your experience?";
    }
    
    // Dashboard related questions
    if (input.includes("dashboard") || input.includes("my account") || input.includes("profile") || 
        input.includes("my donations") || input.includes("history") || input.includes("statistics")) {
      return "Your personal dashboard contains all your donation information and settings. From there, you can:\n\n📊 View your donation history and impact\n📊 Track upcoming appointments\n📊 Update your personal information\n📊 See your blood type and donation eligibility\n📊 Access personalized recommendations\n\nWould you like to go to your dashboard now? [NAVIGATE:/dashboard]";
    }

    // User asks directly for help or has a generic question
    if (input.includes("help") || input.includes("assist") || input.includes("support") || 
        input.includes("question") || input.includes("tell me") || input.includes("information")) {
      return "I'm here to help with any blood donation questions you might have! Here are some topics I can assist with:\n\n• Donation eligibility and requirements\n• The donation process and what to expect\n• Scheduling appointments\n• Finding donation locations\n• Health concerns related to donation\n• Different types of donations (whole blood, platelets, etc.)\n• Benefits of donating blood\n• How blood is used to help patients\n\nHow can I assist you today? Feel free to ask a specific question, or I can guide you through the donation process step by step.";
    }
    
    // Catch-all response for anything not specifically matched
    return "I understand you're asking about \"" + userInput + "\". While I'm programmed to answer many blood donation questions, I can provide more specific information if you ask about:\n\n• Donation eligibility and requirements\n• The donation process and what to expect\n• Different types of donations (whole blood, platelets, etc.)\n• Post-donation care and recovery\n• Benefits of donating blood\n• Blood types and compatibility\n• Frequency of donation\n• Health conditions and medication impacts\n• COVID-19 and donation\n• First-time donor information\n\nCould you provide more details about what you'd like to know?";
  };
  
  // Format time for message display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle category change in the suggestions tabs
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  // Get the icon for each category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'donation':
        return <Droplet className="h-4 w-4" />;
      case 'medical':
        return <Heart className="h-4 w-4" />;
      case 'logistics':
        return <MapPin className="h-4 w-4" />;
      case 'about':
        return <Info className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };
  
  return (
    <>
      {/* Floating chat button */}
      <div className="fixed bottom-4 right-4 z-50">
        {!isOpen ? (
          <Button 
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg bg-bloodRed-600 hover:bg-bloodRed-700 flex items-center justify-center"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        ) : (
          <Card className="w-80 sm:w-96 shadow-xl">
            <CardHeader className="bg-bloodRed-600 text-white py-3 px-4 flex flex-row justify-between items-center">
              <CardTitle className="text-base font-medium flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                LifeFlow Assistant
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-bloodRed-700 rounded-full"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-80 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          message.isUser
                            ? 'bg-bloodRed-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {/* Use whitespace-pre-wrap to preserve line breaks in AI responses */}
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.isUser ? 'text-bloodRed-100' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] px-4 py-2 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                        <div className="flex space-x-1 items-center">
                          <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                          <span className="text-sm text-gray-500 ml-2">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Question suggestions with tabs for categories - MODIFIED to always show after first message */}
                  {showSuggestions && !isLoading && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center mb-2">
                        <HelpCircle className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">More questions you can ask:</span>
                      </div>
                      <Tabs defaultValue="donation" className="w-full">
                        <TabsList className="grid grid-cols-4 mb-2">
                          <TabsTrigger 
                            value="donation" 
                            onClick={() => handleCategoryChange("donation")}
                            className="flex items-center justify-center"
                          >
                            <Droplet className="h-3 w-3 mr-1" />
                            <span className="text-xs">Donate</span>
                          </TabsTrigger>
                          <TabsTrigger 
                            value="medical" 
                            onClick={() => handleCategoryChange("medical")}
                            className="flex items-center justify-center"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            <span className="text-xs">Medical</span>
                          </TabsTrigger>
                          <TabsTrigger 
                            value="logistics" 
                            onClick={() => handleCategoryChange("logistics")}
                            className="flex items-center justify-center"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="text-xs">Logistics</span>
                          </TabsTrigger>
                          <TabsTrigger 
                            value="about" 
                            onClick={() => handleCategoryChange("about")}
                            className="flex items-center justify-center"
                          >
                            <Info className="h-3 w-3 mr-1" />
                            <span className="text-xs">About</span>
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="donation" className="mt-0">
                          <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.donation.map((question, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestedQuestionClick(question)}
                                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="medical" className="mt-0">
                          <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.medical.map((question, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestedQuestionClick(question)}
                                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="logistics" className="mt-0">
                          <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.logistics.map((question, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestedQuestionClick(question)}
                                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="about" className="mt-0">
                          <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.about.map((question, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestedQuestionClick(question)}
                                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t">
              <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                <Input
                  type="text"
                  placeholder="Type your question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-grow"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-bloodRed-600 hover:bg-bloodRed-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
};

