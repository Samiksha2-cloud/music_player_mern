import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email ?? 'No session');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth change:', event, session?.user?.email ?? 'No user');
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signOut: () => supabase.auth.signOut()
  };

  console.log('AuthProvider value:', { user: value.user?.email, loading: value.loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log('useAuth called, context:', context);
  if (context === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};