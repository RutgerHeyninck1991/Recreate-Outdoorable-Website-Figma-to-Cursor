import { createClient } from '@supabase/supabase-js';

export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY || '';

if (!projectId || !publicAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);