
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase.config';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Checking session...');
  console.log('FULL CALLBACK URL (including hash):', window.location.href);
  console.log('HASH FRAGMENT ONLY:', window.location.hash);

  useEffect(() => {
    alert(
    'Callback page reached!\n\n' +
    'Copy this full URL from the address bar NOW:\n' +
    window.location.href + '\n\n' +
    'Hash part: ' + window.location.hash + '\n' +
    'Query part: ' + window.location.search
  );
    console.log('AuthCallback: URL on mount →', window.location.href);
    console.log('AuthCallback: Hash →', window.location.hash);
    console.log('AuthCallback: Search params →', window.location.search);

    const handleSession = async () => {
      // Try immediate get
      let { data: { session }, error } = await supabase.auth.getSession();
      console.log('Immediate getSession:', { session: !!session, user: session?.user?.email, error });

      if (!session && !error) {
        // Wait 2 seconds and retry (timing race common on localhost)
        await new Promise(r => setTimeout(r, 2000));
        const retry = await supabase.auth.getSession();
        console.log('Retry getSession:', { session: !!retry.data.session, user: retry.data.session?.user?.email, error: retry.error });
        session = retry.data.session;
      }

      if (session?.user) {
        setStatus('Success! Redirecting...');
        navigate('/', { replace: true });
      } else {
        setStatus('No session detected → back to login');
        console.error('Session failed:', error || 'null session');
        navigate('/login', { replace: true });
      }
    };

    handleSession();

    // Backup listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('onAuthStateChange fired in callback:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session?.user) {
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
      {status}
    </div>
  );
}