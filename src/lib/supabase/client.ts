/**
 * Supabase Client Configuration
 * Client-side client for public operations
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables with helpful error messages
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please add it to your .env.local file.'
  );
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Client-side operations may fail.');
}

// Client-side client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);


