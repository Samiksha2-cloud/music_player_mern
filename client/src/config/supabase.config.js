import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eukapvxxrdhudaiivffr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1a2Fwdnh4cmRodWRhaWl2ZmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NjUxNjMsImV4cCI6MjA4NjU0MTE2M30.Br7vD0CWqd67YPn8qg4jKTQBvAge74JmYpd_daMwIz4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType:'pkce',
    //storage: sessionStorage,
  }
});