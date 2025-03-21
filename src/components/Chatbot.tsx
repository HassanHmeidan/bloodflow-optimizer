
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, Loader2, HelpCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Message = {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

// Suggested questions to help users interact with the chatbot
const suggestedQuestions = [
  "How can I donate blood?",
  "What are the eligibility requirements?",
  "How long does donation take?",
  "Where is the nearest donation center?",
  "When can I donate again?",
  "What blood types are needed most?"
];

const initialMessages: Message[] = [
  {
    id: 1,
    text: "👋 Hi there! I'm LifeFlow's virtual assistant. How can I help you with blood donation today?\n\nYou can ask me about donation eligibility, process, locations, or click one of the suggested topics below.",
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
      // Simulate network delay for AI response
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
        
        // Show suggestions again after bot responds
        setTimeout(() => setShowSuggestions(true), 500);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorMessage: Message = {
        id: Date.now(),
        text: "I'm sorry, I encountered an error. Please try again.",
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
  
  const generateAIResponse = (userInput: string): string => {
    // Convert to lowercase for easier matching
    const input = userInput.toLowerCase();
    
    // Blood donation process
    if (input.includes("process") || input.includes("what happens") || input.includes("how does") || 
        input.includes("steps") || input.includes("procedure")) {
      return "The blood donation process is simple and takes about an hour from start to finish:\n\n1. Registration and health history\n2. Mini-physical (temperature, pulse, blood pressure, hemoglobin)\n3. The actual donation (just 8-10 minutes)\n4. Refreshments and rest (15 minutes)\n\nThe needle used is sterile and disposed of after use, so there's no risk of infection. Would you like to know more about any specific part of the process?";
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
    
    // Default response for anything else with helpful suggestions
    return "I'm not quite sure how to help with that specific question. Could you rephrase or try asking about:\n\n• Donation eligibility requirements\n• The donation process and what to expect\n• How to prepare for donation\n• How often you can donate\n• Blood types and compatibility\n• Post-donation care\n• Scheduling an appointment\n\nOr click one of the suggested questions below.";
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                          <span className="text-sm text-gray-500 ml-2">AI assistant is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Question suggestions */}
                  {showSuggestions && messages.length < 4 && !isLoading && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center mb-2">
                        <HelpCircle className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">Suggested questions:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestedQuestionClick(question)}
                            className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t">
              <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
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
