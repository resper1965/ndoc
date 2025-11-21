/**
 * Supabase Utilities
 * 
 * Funções utilitárias compartilhadas para operações com Supabase
 */

import { createClient } from './server';
import { logger } from '@/lib/logger';

/**
 * Obtém a organização do usuário autenticado
 * Centraliza a lógica que estava duplicada em múltiplos arquivos
 */
export async function getUserOrganization(): Promise<string | null> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Buscar primeira organização do usuário
  const { data: members, error } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  // Se houver erro, logar mas não falhar (pode ser RLS ou usuário sem org)
  if (error) {
    // Erro 406 pode ser causado por RLS quando usuário não tem acesso
    // Erro 404 pode ser causado por tabela não encontrada (improvável)
    // PGRST116 = no rows returned (normal se usuário não tem org)
    // PGRST301 = not found (normal se usuário não tem org)
    if (error.code !== 'PGRST116' && error.code !== 'PGRST301') {
      logger.warn('Error fetching user organization', { 
        code: error.code, 
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
    }
    return null;
  }

  // Se não houver dados, retornar null
  if (!members) {
    return null;
  }

  return members.organization_id || null;
}

/**
 * Obtém múltiplas organizações do usuário (se houver)
 */
export async function getUserOrganizations(): Promise<string[]> {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: members } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id);

  return members?.map((m) => m.organization_id) || [];
}

