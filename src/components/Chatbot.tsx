
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, MessageCircle, SendIcon, User, Bot, X, Volume2, Mic } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
};

type SuggestedQuestion = {
  text: string;
  category: 'donation' | 'medical' | 'logistics' | 'about';
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('donation');
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Fetch initial chatbot data only once
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const { data, error } = await supabase
          .from('chatbot_responses')
          .select('query_pattern, category');

        if (error) throw error;

        // Transform data
        const questions = (data || []).map(item => ({
          text: item.query_pattern.charAt(0).toUpperCase() + item.query_pattern.slice(1) + '?',
          category: item.category as 'donation' | 'medical' | 'logistics' | 'about'
        }));

        setSuggestedQuestions(questions);
      } catch (error) {
        console.error('Error fetching suggested questions:', error);
        toast.error('Failed to load suggested questions');
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestedQuestions();
  }, []);

  // If no suggested questions found, provide some defaults
  useEffect(() => {
    if (!isLoadingSuggestions && suggestedQuestions.length === 0) {
      setSuggestedQuestions([
        { text: "How can I donate blood?", category: "donation" },
        { text: "Where are your donation centers?", category: "logistics" },
        { text: "Am I eligible to donate?", category: "medical" },
        { text: "What blood types are in demand?", category: "medical" }
      ]);
    }
  }, [suggestedQuestions, isLoadingSuggestions]);

  // Add initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'bot',
          content: "Hello! I'm the LifeFlow Assistant. How can I help you with blood donation today?",
          timestamp: new Date()
        }
      ]);
    }
  }, [messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Hide suggestions after user sends a message
    setShowSuggestions(false);
    
    try {
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chatbot-response', {
        body: { message: messageContent }
      });
      
      if (error) throw error;
      
      // Extract the response text and navigation path
      const responseText = data?.response || 'Sorry, I could not process your request at this time.';
      const navigatePath = data?.navigate;
      
      // Add bot message
      const botMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot' as const,
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Handle navigation if present
      if (navigatePath) {
        setTimeout(() => {
          navigate(navigatePath);
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot' as const,
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <>
      {/* Chat toggle button */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #C53030 0%, #822727 100%)',
              boxShadow: '0 4px 14px rgba(197, 48, 48, 0.4)'
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <MessageCircle className="h-6 w-6 text-white" />
            )}
          </Button>
        </motion.div>
      </div>
      
      {/* Chat interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-8 z-50 w-[340px] md:w-[380px]"
          >
            <Card className="overflow-hidden shadow-xl border border-gray-200 rounded-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-bloodRed-600 to-bloodRed-700 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Bot className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">LifeFlow Assistant</h3>
                </div>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Messages */}
              <ScrollArea 
                className="h-[350px] px-4 py-3" 
                ref={scrollRef}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className="flex-shrink-0 mt-1">
                          <Avatar className={`h-8 w-8 ${
                            message.role === 'user' 
                              ? 'bg-blue-100' 
                              : 'bg-bloodRed-100'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Bot className="h-4 w-4 text-bloodRed-600" />
                            )}
                          </Avatar>
                        </div>
                        <div 
                          className={`mx-2 rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none shadow-sm' 
                              : 'bg-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[85%]">
                        <div className="flex-shrink-0">
                          <Avatar className="h-8 w-8 bg-bloodRed-100">
                            <Bot className="h-4 w-4 text-bloodRed-600" />
                          </Avatar>
                        </div>
                        <div className="mx-2 rounded-lg p-3 bg-gray-100 text-gray-800">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-bloodRed-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-bloodRed-400 rounded-full animate-pulse delay-150"></div>
                            <div className="w-2 h-2 bg-bloodRed-400 rounded-full animate-pulse delay-300"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Suggested Questions */}
              {showSuggestions && messages.length < 3 && (
                <div className="px-4 pb-3 border-t border-gray-100 pt-2">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Suggested questions:</p>
                  <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                    <TabsList className="w-full mb-2 h-8 bg-gray-100 p-1 rounded-lg">
                      <TabsTrigger value="donation" className="text-xs h-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded">
                        Donation
                      </TabsTrigger>
                      <TabsTrigger value="medical" className="text-xs h-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded">
                        Medical
                      </TabsTrigger>
                      <TabsTrigger value="logistics" className="text-xs h-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded">
                        Logistics
                      </TabsTrigger>
                      <TabsTrigger value="about" className="text-xs h-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded">
                        About
                      </TabsTrigger>
                    </TabsList>
                    
                    {isLoadingSuggestions ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-bloodRed-500" />
                      </div>
                    ) : (
                      <>
                        <TabsContent value="donation" className="mt-0">
                          <div className="space-y-1">
                            {suggestedQuestions
                              .filter(q => q.category === 'donation')
                              .slice(0, 3)
                              .map((q, i) => (
                                <Button 
                                  key={i}
                                  variant="outline"
                                  className="text-xs justify-start w-full h-auto py-1.5 px-3 font-normal truncate border-gray-200 hover:bg-gray-50 hover:text-bloodRed-600 rounded"
                                  onClick={() => handleSuggestedQuestion(q.text)}
                                >
                                  {q.text}
                                </Button>
                              ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="medical" className="mt-0">
                          <div className="space-y-1">
                            {suggestedQuestions
                              .filter(q => q.category === 'medical')
                              .slice(0, 3)
                              .map((q, i) => (
                                <Button 
                                  key={i}
                                  variant="outline"
                                  className="text-xs justify-start w-full h-auto py-1.5 px-3 font-normal truncate border-gray-200 hover:bg-gray-50 hover:text-bloodRed-600 rounded"
                                  onClick={() => handleSuggestedQuestion(q.text)}
                                >
                                  {q.text}
                                </Button>
                              ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="logistics" className="mt-0">
                          <div className="space-y-1">
                            {suggestedQuestions
                              .filter(q => q.category === 'logistics')
                              .slice(0, 3)
                              .map((q, i) => (
                                <Button 
                                  key={i}
                                  variant="outline"
                                  className="text-xs justify-start w-full h-auto py-1.5 px-3 font-normal truncate border-gray-200 hover:bg-gray-50 hover:text-bloodRed-600 rounded"
                                  onClick={() => handleSuggestedQuestion(q.text)}
                                >
                                  {q.text}
                                </Button>
                              ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="about" className="mt-0">
                          <div className="space-y-1">
                            {suggestedQuestions
                              .filter(q => q.category === 'about')
                              .slice(0, 3)
                              .map((q, i) => (
                                <Button 
                                  key={i}
                                  variant="outline"
                                  className="text-xs justify-start w-full h-auto py-1.5 px-3 font-normal truncate border-gray-200 hover:bg-gray-50 hover:text-bloodRed-600 rounded"
                                  onClick={() => handleSuggestedQuestion(q.text)}
                                >
                                  {q.text}
                                </Button>
                              ))}
                          </div>
                        </TabsContent>
                      </>
                    )}
                  </Tabs>
                </div>
              )}
              
              {/* Input area */}
              <div className="p-3 border-t border-gray-100">
                <div className="flex space-x-2 bg-gray-50 rounded-lg p-1">
                  <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  />
                  <Button 
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="bg-gradient-to-r from-bloodRed-600 to-bloodRed-700 hover:from-bloodRed-700 hover:to-bloodRed-800 text-white rounded-md"
                  >
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                  >
                    {showSuggestions ? "Hide suggestions" : "Show suggestions"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
