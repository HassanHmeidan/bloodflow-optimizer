
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
  } | null>(null);

  useEffect(() => {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client is not initialized');
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setProfile(data);
        }
      }
      
      setLoading(false);
    });

    // Listen for changes on auth state (login, sign out, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setProfile(data);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (!supabase) throw new Error('Supabase client is not initialized');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      toast.success('Successfully signed in!');
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => {
    try {
      if (!supabase) throw new Error('Supabase client is not initialized');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone
          }
        }
      });

      if (signUpError) throw signUpError;
      
      // If signup is successful, update the profile table
      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: phone
          })
          .eq('id', signUpData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      toast.success('Registration successful! Please check your email to verify your account.');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const signOut = async () => {
    try {
      if (!supabase) throw new Error('Supabase client is not initialized');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully signed out!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateProfile = async (profileData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => {
    try {
      if (!supabase) throw new Error('Supabase client is not initialized');
      if (!user) {
        throw new Error('No user logged in');
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => ({ ...prev, ...profileData }));

      toast.success('Profile updated successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  return {
    user,
    loading,
    profile,
    signIn,
    signUp,
    signOut,
    updateProfile
  };
}
