import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    // Persist session to localStorage (default is true, but being explicit)
    persistSession: true,
    // Use localStorage for session storage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Auto refresh tokens before they expire
    autoRefreshToken: true,
    // Detect session from URL (for OAuth flows)
    detectSessionInUrl: true,
  },
});
