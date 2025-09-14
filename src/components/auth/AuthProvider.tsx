import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });
    
    return { error };
  };

  const signIn = async (username: string, password: string) => {
    // Check for hardcoded admin credentials
    if (username === 'admin' && password === 'Test4demo') {
      // Create a mock user object for admin
      const mockUser = {
        id: 'admin-user-id',
        email: 'admin@securewatch.local',
        username: 'admin',
        role: 'admin',
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: { username: 'admin' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any;

      const mockSession = {
        access_token: 'mock-admin-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      } as any;

      setUser(mockUser);
      setSession(mockSession);
      
      return { error: null };
    }

    // Fallback to Supabase auth for other users
    const { error } = await supabase.auth.signInWithPassword({
      email: username.includes('@') ? username : `${username}@securewatch.local`,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    // Clear local admin session if exists
    if (user?.user_metadata?.username === 'admin') {
      setUser(null);
      setSession(null);
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
