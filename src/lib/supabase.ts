import { createClient } from '@supabase/supabase-js';

// Reads the environment variables you configured in Render
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase URL or Key in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);