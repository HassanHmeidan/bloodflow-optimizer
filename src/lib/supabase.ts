
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Import the client directly from the integrations folder
import { supabase as supabaseClient, initializeRealtimeSubscriptions } from '@/integrations/supabase/client';

// Export the supabase client
export const supabase = supabaseClient;

// Initialize realtime subscriptions
initializeRealtimeSubscriptions();

// Helper function to safely access the supabase client
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      "Supabase client is not initialized. Please make sure your environment variables are set correctly."
    );
  }
  return supabase;
};

// Export API functions
export * from './api';
