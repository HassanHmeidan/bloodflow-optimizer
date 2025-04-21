
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Get the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase environment variables are missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment."
  );
}

// Create and export the Supabase client only if we have the required values
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to safely access the supabase client
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      "Supabase client is not initialized. Please make sure your environment variables are set correctly."
    );
  }
  return supabase;
};
