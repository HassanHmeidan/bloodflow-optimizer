
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot } from 'lucide-react';

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
  
  const handleSendMessage = (e?: React.FormEvent) => {
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
    
    // Simulate API call to Python backend for chatbot response
    setTimeout(() => {
      // Predefined responses for demo
      const possibleResponses = [
        "Donating blood typically takes about 10-15 minutes, but you should plan for an hour to account for registration and health checks.",
        "Yes, you must be at least 17 years old to donate blood in most states.",
        "You should drink plenty of water and eat a healthy meal before donating blood.",
        "Most people can donate blood every 56 days (8 weeks).",
        "A single blood donation can save up to three lives!",
        "To be eligible for donation, you must weigh at least 110 pounds and be in good general health.",
        "You can schedule an appointment through our website or by calling your local blood center.",
        "Yes, there is always a high need for O negative blood as it's the universal donor type.",
        "After donation, we recommend having a snack and drink provided at the donation center and avoiding strenuous activity for the rest of the day."
      ];
      
      // Get a contextual response based on keywords in the user's message
      let botResponse = "I'm not sure I understand. Could you rephrase your question about blood donation?";
      
      const userMessageLower = userMessage.text.toLowerCase();
      
      if (userMessageLower.includes("time") || userMessageLower.includes("long") || userMessageLower.includes("take")) {
        botResponse = possibleResponses[0];
      } else if (userMessageLower.includes("age") || userMessageLower.includes("old enough") || userMessageLower.includes("years old")) {
        botResponse = possibleResponses[1];
      } else if (userMessageLower.includes("prepare") || userMessageLower.includes("before") || userMessageLower.includes("ready")) {
        botResponse = possibleResponses[2];
      } else if (userMessageLower.includes("how often") || userMessageLower.includes("when again") || userMessageLower.includes("next time")) {
        botResponse = possibleResponses[3];
      } else if (userMessageLower.includes("help") || userMessageLower.includes("save") || userMessageLower.includes("impact")) {
        botResponse = possibleResponses[4];
      } else if (userMessageLower.includes("eligib") || userMessageLower.includes("require") || userMessageLower.includes("can i donate")) {
        botResponse = possibleResponses[5];
      } else if (userMessageLower.includes("schedule") || userMessageLower.includes("appointment") || userMessageLower.includes("book")) {
        botResponse = possibleResponses[6];
      } else if (userMessageLower.includes("o") || userMessageLower.includes("type") || userMessageLower.includes("need")) {
        botResponse = possibleResponses[7];
      } else if (userMessageLower.includes("after") || userMessageLower.includes("done") || userMessageLower.includes("donated")) {
        botResponse = possibleResponses[8];
      }
      
      const botMessage: Message = {
        id: Date.now(),
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
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
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
