/**
 * Document Service
 * 
 * Funções auxiliares para buscar documentos do Supabase
 */

import { createClient } from './server';
import { getUserOrganization } from './utils';
import { logger } from '../logger';

export interface Document {
  id: string;
  path: string;
  title: string;
  description: string | null;
  content: string;
  frontmatter: Record<string, unknown>;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  url: string;
}

/**
 * Busca todos os documentos publicados
 * Se usuário autenticado, também mostra documentos da sua organização
 */
export async function getAllDocuments(organizationId?: string): Promise<Document[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { isSuperadmin } = await import('./permissions');
  const isSuper = await isSuperadmin();

  let query = supabase
    .from('documents')
    .select('*');

  if (!user) {
    // Não autenticado: apenas publicados
    query = query.eq('status', 'published');
  } else if (isSuper) {
    // Superadmin: todos ou filtrado por organização
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
  } else {
    // Usuário autenticado: da sua organização + publicados
    const userOrgId = organizationId || await getUserOrganization();
    if (userOrgId) {
      query = query.or(`organization_id.eq.${userOrgId},status.eq.published`);
    } else {
      query = query.eq('status', 'published');
    }
  }

  const { data, error } = await query.order('order_index', { ascending: true });

  if (error) {
    logger.error('Error fetching documents', error);
    return [];
  }

  return (
    data?.map((doc) => ({
      ...doc,
      url: `/docs/${doc.path}`,
    })) || []
  );
}

/**
 * Busca um documento específico por path
 * Se usuário autenticado, também mostra documentos da sua organização
 */
export async function getDocumentByPath(path: string, organizationId?: string): Promise<Document | null> {
  const supabase = await createClient();

  // Remover .mdx se presente e /docs/ se presente
  const cleanPath = path.replace(/^\/docs\//, '').replace(/\.mdx$/, '');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { isSuperadmin } = await import('./permissions');
  const isSuper = await isSuperadmin();

  let query = supabase
    .from('documents')
    .select('*')
    .eq('path', cleanPath);

  if (!user) {
    // Não autenticado: apenas publicados
    query = query.eq('status', 'published');
  } else if (isSuper) {
    // Superadmin: todos ou filtrado por organização
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
  } else {
    // Usuário autenticado: da sua organização + publicados
    const userOrgId = organizationId || await getUserOrganization();
    if (userOrgId) {
      query = query.or(`organization_id.eq.${userOrgId},status.eq.published`);
    } else {
      query = query.eq('status', 'published');
    }
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    url: `/docs/${data.path}`,
  };
}

/**
 * Busca documento index
 */
export async function getIndexDocument(): Promise<Document | null> {
  return getDocumentByPath('index');
}

