/**
 * Supabase Client for Browser
 * 
 * Usa @supabase/ssr para criar cliente otimizado para browser
 * com gerenciamento automático de cookies e sessão
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

