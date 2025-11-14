/**
 * Permission Utilities (Client-side)
 * 
 * Versão client-side das funções de permissão
 */

import { createClient } from './client';

export type UserRole = 'superadmin' | 'orgadmin' | 'admin' | 'editor' | 'viewer' | 'user';

export interface UserPermissions {
  isSuperadmin: boolean;
  isOrgAdmin: boolean;
  role: UserRole | null;
  organizationId: string | null;
}

/**
 * Verifica se o usuário é superadmin (client-side)
 */
export async function isSuperadmin(): Promise<boolean> {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from('superadmins')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return !error && !!data;
}

/**
 * Obtém o role do usuário em uma organização (client-side)
 */
export async function getUserRole(organizationId: string): Promise<UserRole | null> {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Verificar se é superadmin primeiro
  const isSuper = await isSuperadmin();
  if (isSuper) {
    return 'superadmin';
  }

  const { data } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single();

  if (!data) {
    return null;
  }

  // Mapear roles antigas para novas
  if (data.role === 'owner') {
    return 'orgadmin';
  }

  return data.role as UserRole;
}

/**
 * Obtém todas as permissões do usuário (client-side)
 */
export async function getUserPermissions(organizationId?: string): Promise<UserPermissions> {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isSuperadmin: false,
      isOrgAdmin: false,
      role: null,
      organizationId: null,
    };
  }

  const isSuper = await isSuperadmin();

  if (isSuper) {
    return {
      isSuperadmin: true,
      isOrgAdmin: true, // Superadmin tem permissões de orgadmin em todas as orgs
      role: 'superadmin',
      organizationId: organizationId || null,
    };
  }

  let finalOrgId: string | null = organizationId || null;

  if (!finalOrgId) {
    // Buscar primeira organização do usuário
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!member) {
      return {
        isSuperadmin: false,
        isOrgAdmin: false,
        role: null,
        organizationId: null,
      };
    }

    finalOrgId = member.organization_id;
  }

  const role = finalOrgId ? await getUserRole(finalOrgId) : null;

  return {
    isSuperadmin: false,
    isOrgAdmin: role === 'orgadmin' || role === 'superadmin',
    role,
    organizationId: finalOrgId,
  };
}

/**
 * Verifica se o usuário pode gerenciar usuários (client-side)
 */
export async function canManageUsers(organizationId?: string): Promise<boolean> {
  const permissions = await getUserPermissions(organizationId);
  return permissions.isSuperadmin || permissions.isOrgAdmin;
}

