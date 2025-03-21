
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Message = {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: 1,
    text: "👋 Hi there! I'm LifeFlow's virtual assistant. How can I help you with blood donation today?",
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Here we would make an API call to the Python backend
    // For now, we'll simulate the AI response with a more intelligent approach
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateAIResponse = (userInput: string): string => {
    // Convert to lowercase for easier matching
    const input = userInput.toLowerCase();
    
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
    
    // Looking for eligibility keywords
    if (input.includes("eligible") || input.includes("can i donate") || input.includes("requirement") || 
        input.includes("qualification") || input.includes("allowed to")) {
      return "To be eligible for donation, you must generally be at least 17 years old, weigh at least 110 pounds, and be in good general health. Specific requirements may vary based on your location and medical history. Would you like to check the full eligibility criteria?";
    }
    
    // Looking for time-related questions
    if (input.includes("how long") || input.includes("how much time") || input.includes("duration") || 
        input.includes("take") || input.includes("minutes") || input.includes("hours")) {
      return "The donation process itself usually takes about 8-10 minutes. However, you should plan for about an hour for the entire visit, which includes registration, a mini-physical, and refreshments after donation. Is there anything specific about the process you'd like to know?";
    }
    
    // Looking for blood type related questions
    if (input.includes("blood type") || input.includes("universal donor") || input.includes("universal recipient") || 
        input.includes("common blood") || input.includes("rare blood") || input.includes("o negative") || input.includes("o positive") || input.includes("ab")) {
      return "O-negative blood is considered the universal donor type, as it can be given to anyone regardless of their blood type. AB-positive is the universal recipient. The most common blood type is O-positive, while AB-negative is the rarest. Would you like to learn more about specific blood types?";
    }
    
    // Looking for post-donation questions
    if (input.includes("after") || input.includes("recovery") || input.includes("care") || 
        input.includes("eat") || input.includes("drink") || input.includes("dizzy")) {
      return "After donating, you should drink extra fluids, avoid strenuous activities for 24 hours, keep the bandage on for a few hours, and eat iron-rich foods. If you feel dizzy, lie down with your feet elevated. It's normal to feel slightly fatigued, but serious side effects are rare. Would you like more post-donation tips?";
    }
    
    // Looking for blood facts or importance
    if (input.includes("why") || input.includes("important") || input.includes("benefit") || 
        input.includes("impact") || input.includes("save") || input.includes("help")) {
      return "Every two seconds, someone in the U.S. needs blood. A single blood donation can save up to three lives! Blood is essential for surgeries, cancer treatments, chronic illnesses, and traumatic injuries. When you donate, you're directly helping people in your community who need it most. Would you like to know more about the impact of donations?";
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
    
    // Default response for anything else
    return "I'm not quite sure how to answer that. Could you rephrase your question about blood donation? Or you can ask me about donation eligibility, the donation process, scheduling an appointment, or blood types.";
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
            className="h-14 w-14 rounded-full shadow-lg bg-bloodRed-600 hover:bg-bloodRed-700"
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
                        <p className="text-sm">{message.text}</p>
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
