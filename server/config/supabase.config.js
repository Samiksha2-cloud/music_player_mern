const { createClient } = require('@supabase/supabase-js');

// Server uses SUPABASE_URL and SUPABASE_KEY (NO REACT_APP_ prefix)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in server/.env');
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase initialized');

module.exports = { supabase };
