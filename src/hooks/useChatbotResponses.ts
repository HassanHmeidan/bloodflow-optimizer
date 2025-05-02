
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

export type ChatbotResponse = {
  id: string;
  query_pattern: string;
  response_text: string;
  category: string;
  keywords: string[];
  created_at: string;
};

export function useChatbotResponses() {
  const [responses, setResponses] = useState<ChatbotResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('chatbot_responses')
          .select('*');
        
        if (error) throw error;
        
        setResponses(data || []);
      } catch (err) {
        console.error('Error fetching chatbot responses:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  const addResponse = async (newResponse: Omit<ChatbotResponse, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('chatbot_responses')
        .insert(newResponse)
        .select();
      
      if (error) throw error;
      
      setResponses(prev => [...prev, data[0]]);
      toast.success('Response added successfully');
      return data[0];
    } catch (err) {
      console.error('Error adding response:', err);
      toast.error('Failed to add response');
      throw err;
    }
  };

  return { responses, loading, error, addResponse };
}
