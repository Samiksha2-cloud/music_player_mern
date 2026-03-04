
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase.config';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // ────────────────────────────────────────────────
    // Storage test — add this block exactly here (first thing)
    try {
      localStorage.setItem('test_storage', 'this_should_save');
      console.log('Storage TEST: Write success → value:', localStorage.getItem('test_storage'));
    } catch (err) {
      console.error('Storage TEST FAILED (localStorage):', err.message);
    }

    try {
      sessionStorage.setItem('test_session', 'this_should_save_session');
      console.log('SessionStorage TEST: Write success → value:', sessionStorage.getItem('test_session'));
    } catch (err) {
      console.error('Storage TEST FAILED (sessionStorage):', err.message);
    }
    // ────────────────────────────────────────────────

    // Your existing code below (keep everything else the same)
    console.log('AuthCallback: URL on mount →', window.location.href);
    console.log('AuthCallback: Hash →', window.location.hash);
    console.log('AuthCallback: Search params →', window.location.search);

    const checkAndRedirect = async () => {
      // Try immediate get
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('getSession result:', { 
        hasSession: !!session, 
        user: session?.user?.email || 'no user', 
        error: error?.message || 'no error' 
      });

      if (session?.user) {
        console.log('LOGIN SUCCESS - redirecting to home');
        navigate('/', { replace: true });
      } else {
        console.log('No session - going back to login');
        navigate('/login', { replace: true });
      }
    };

    checkAndRedirect();

    // Listen for changes as backup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, 'user:', session?.user?.email);
      if (event === 'SIGNED_IN' && session?.user) {
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
      Finishing login...
    </div>
  );
}