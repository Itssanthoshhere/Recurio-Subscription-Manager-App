import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase Environment Variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Creates a Supabase client configured to use Clerk's JWT template.
 * This automatically injects the Clerk token into every Supabase request.
 */
export const createClerkSupabaseClient = (getToken: (options?: { template: string }) => Promise<string | null>) => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // We rely on Clerk for authentication, so we disable Supabase's built-in session persistence.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: async (url, options = {}) => {
        // Fetch the fresh token from Clerk using the specific template
        const clerkToken = await getToken({ template: 'supabase' });

        const headers = new Headers(options?.headers);
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
};
