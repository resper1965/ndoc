/**
 * Permission Utilities
 * 
 * Funções auxiliares para verificar permissões de usuários
 */

import { createClient } from './server';

export type UserRole = 'superadmin' | 'orgadmin' | 'admin' | 'editor' | 'viewer' | 'user';

export interface UserPermissions {
  isSuperadmin: boolean;
  isOrgAdmin: boolean;
  role: UserRole | null;
  organizationId: string | null;
}

/**
 * Verifica se o usuário é superadmin
 */
export async function isSuperadmin(): Promise<boolean> {
  const supabase = await createClient();
  
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
 * Obtém o role do usuário em uma organização
 */
export async function getUserRole(organizationId: string): Promise<UserRole | null> {
  const supabase = await createClient();
  
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
 * Obtém todas as permissões do usuário
 */
export async function getUserPermissions(organizationId?: string): Promise<UserPermissions> {
  const supabase = await createClient();
  
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
 * Verifica se o usuário pode gerenciar usuários (superadmin ou orgadmin)
 */
export async function canManageUsers(organizationId?: string): Promise<boolean> {
  const permissions = await getUserPermissions(organizationId);
  return permissions.isSuperadmin || permissions.isOrgAdmin;
}

/**
 * Verifica se o usuário pode criar/editar documentos
 */
export async function canEditDocuments(organizationId?: string): Promise<boolean> {
  const permissions = await getUserPermissions(organizationId);
  
  if (permissions.isSuperadmin) {
    return true;
  }

  if (!permissions.role) {
    return false;
  }

  return ['orgadmin', 'admin', 'editor'].includes(permissions.role);
}

/**
 * Verifica se o usuário pode deletar documentos
 */
export async function canDeleteDocuments(organizationId?: string): Promise<boolean> {
  const permissions = await getUserPermissions(organizationId);
  
  if (permissions.isSuperadmin) {
    return true;
  }

  if (!permissions.role) {
    return false;
  }

  return ['orgadmin', 'admin', 'owner'].includes(permissions.role);
}

