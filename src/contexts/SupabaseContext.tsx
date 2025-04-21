
import { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { useSupabase } from '@/hooks/useSupabase';

interface SupabaseContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void | boolean>;
  signUp: (email: string, password: string) => Promise<void | boolean>;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseProvider');
  }
  return context;
}
