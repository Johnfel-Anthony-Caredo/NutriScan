import { supabase } from '@/lib/supabase';
import { type Session, type User } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // 1. Load persisted session from storage (reliable across all Supabase JS versions)
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mountedRef.current) {
        setSession(initialSession);
        setIsLoading(false);
      }
    });

    // 2. Listen for subsequent auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mountedRef.current) {
        setSession(nextSession ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
    // Session will be set to null by onAuthStateChange listener above
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
