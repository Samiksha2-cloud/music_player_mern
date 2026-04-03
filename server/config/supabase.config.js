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
```

---

**Fix 4 — Render Environment Variables**

Go to **Render dashboard** → your backend service → **Environment** tab. Make sure you have these exact keys (no `REACT_APP_` prefix on server):
```
MONGO_URI          = your mongodb atlas connection string
SUPABASE_URL       = https://eukapvxxrdhudaiivffr.supabase.co
SUPABASE_KEY       = your supabase service role key (NOT anon key)
PORT               = 4000
```

---

**Fix 5 — Vercel Environment Variables**

Go to **Vercel dashboard** → your project → **Settings** → **Environment Variables**. Make sure:
```
REACT_APP_API_URL = https://riff-backend-9sp0.onrender.com