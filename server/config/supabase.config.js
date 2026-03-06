// server/config/supabase.config.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;  // ← changed to service role

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase client initialized with service_role key!');

module.exports = { supabase };