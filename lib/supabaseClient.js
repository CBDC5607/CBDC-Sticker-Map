import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaces a clear error in the browser console instead of a cryptic one
  // from deep inside the Supabase client if env vars are missing.
  console.error(
    'Missing Supabase environment variables. Check .env.local (local dev) ' +
    'or your Vercel project\'s Environment Variables (production).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
