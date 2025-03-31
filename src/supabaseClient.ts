
// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Use the same values as in src/integrations/supabase/client.ts
const supabaseUrl = "https://oeawkdfkvrezcitqczuy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lYXdrZGZrdnJlemNpdHFjenV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDUyMjYsImV4cCI6MjA1ODUyMTIyNn0.qjQaX6N6nZzRPvPN5g8ugVedNo8HQWuSqq6UtouoOl4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
