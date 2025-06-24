
"use client";

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // The middleware is responsible for ensuring these are set.
  // If the app reaches this point without them, it's a critical configuration error.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
