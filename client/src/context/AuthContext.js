import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  setLoading(true);
 /*supabase.auth.getSession().then(({ data }) => {
  const token = data.session?.access_token;
  if (token) {
    console.log('FRESH TOKEN (copy now):', token);
    navigator.clipboard.writeText(token);
    alert('Fresh token copied to clipboard!\nPaste in Postman NOW — it expires in ~1 hour');
  } else {
    alert('No active session — please log in first');
  }
});
*/
  const refreshAndSetSession = async () => {
    // Try to refresh any existing session first
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) console.log('Refresh failed:', refreshError.message);

    // Get current session (fresh)
    const { data: { session } } = await supabase.auth.getSession();

    console.log('AuthContext mount - session after refresh:', {
      user: session?.user?.email || 'none',
      accessToken: session?.access_token ? 'present' : 'missing'
    });

    setUser(session?.user ?? null);
    setLoading(false);
  };

  refreshAndSetSession();

  // Listen for changes (backup)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth change:', event, session?.user?.email || 'no user');
    setUser(session?.user ?? null);
    setLoading(false);
  });

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