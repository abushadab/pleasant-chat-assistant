// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oeawkdfkvrezcitqczuy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lYXdrZGZrdnJlemNpdHFjenV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NDUyMjYsImV4cCI6MjA1ODUyMTIyNn0.qjQaX6N6nZzRPvPN5g8ugVedNo8HQWuSqq6UtouoOl4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);