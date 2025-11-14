/**
 * Auth Utilities
 * 
 * Funções auxiliares para autenticação com Supabase
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

/**
 * Obtém o usuário atual
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Faz logout do usuário
 */
export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

