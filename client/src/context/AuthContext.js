import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const refreshAndSetSession = async () => {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) console.log('Refresh failed:', refreshError.message);

      const { data: { session } } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setLoading(false);
    };

    refreshAndSetSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
