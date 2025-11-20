/**
 * Busca templates de documentos do banco de dados
 * Com cache para melhor performance
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export interface Template {
  id: string;
  name: string;
  type: 'policy' | 'procedure' | 'manual';
  description?: string;
  templateContent: string;
  metadataSchema: Record<string, any>;
  isDefault: boolean;
}

// Cache simples em memória (TTL: 5 minutos)
const templateCache = new Map<string, { template: Template; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Busca template do banco de dados
 * 
 * @param templateId ID do template (UUID)
 * @param organizationId ID da organização (para templates customizados)
 * @returns Template encontrado ou null
 */
export async function getTemplateFromDatabase(
  templateId: string,
  organizationId?: string
): Promise<Template | null> {
  // Verificar cache primeiro
  const cacheKey = `${templateId}-${organizationId || 'default'}`;
  const cached = templateCache.get(cacheKey);
  
  if (cached && cached.expiresAt > Date.now()) {
    logger.debug('Template encontrado no cache', { templateId, organizationId });
    return cached.template;
  }

  try {
    const supabase = createAdminClient();

    // Buscar template específico
    let query = supabase
      .from('document_templates')
      .select('id, name, type, description, template_content, metadata_schema, is_default')
      .eq('id', templateId);

    // Se organizationId fornecido, buscar template da organização ou default
    if (organizationId) {
      query = query.or(`organization_id.eq.${organizationId},is_default.eq.true`);
    } else {
      query = query.eq('is_default', true);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      logger.error('Erro ao buscar template do banco', error);
      return null;
    }

    if (!data) {
      logger.warn('Template não encontrado no banco', { templateId, organizationId });
      return null;
    }

    const template: Template = {
      id: data.id,
      name: data.name,
      type: data.type as 'policy' | 'procedure' | 'manual',
      description: data.description || undefined,
      templateContent: data.template_content,
      metadataSchema: (data.metadata_schema as Record<string, any>) || {},
      isDefault: data.is_default || false,
    };

    // Armazenar no cache
    templateCache.set(cacheKey, {
      template,
      expiresAt: Date.now() + CACHE_TTL,
    });

    return template;
  } catch (error) {
    logger.error('Erro ao buscar template do banco', error);
    return null;
  }
}

/**
 * Busca template por tipo e organização
 * 
 * @param type Tipo do template ('policy', 'procedure', 'manual')
 * @param organizationId ID da organização (opcional)
 * @returns Template encontrado ou null
 */
export async function getTemplateByType(
  type: 'policy' | 'procedure' | 'manual',
  organizationId?: string
): Promise<Template | null> {
  // Verificar cache primeiro
  const cacheKey = `type-${type}-${organizationId || 'default'}`;
  const cached = templateCache.get(cacheKey);
  
  if (cached && cached.expiresAt > Date.now()) {
    logger.debug('Template encontrado no cache por tipo', { type, organizationId });
    return cached.template;
  }

  try {
    const supabase = createAdminClient();

    // Buscar template por tipo
    let query = supabase
      .from('document_templates')
      .select('id, name, type, description, template_content, metadata_schema, is_default')
      .eq('type', type)
      .order('is_default', { ascending: false }) // Templates default primeiro
      .order('created_at', { ascending: false }) // Mais recentes primeiro
      .limit(1);

    // Se organizationId fornecido, buscar template da organização ou default
    if (organizationId) {
      query = query.or(`organization_id.eq.${organizationId},is_default.eq.true`);
    } else {
      query = query.eq('is_default', true);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      logger.error('Erro ao buscar template por tipo', error);
      return null;
    }

    if (!data) {
      logger.warn('Template não encontrado por tipo', { type, organizationId });
      return null;
    }

    const template: Template = {
      id: data.id,
      name: data.name,
      type: data.type as 'policy' | 'procedure' | 'manual',
      description: data.description || undefined,
      templateContent: data.template_content,
      metadataSchema: (data.metadata_schema as Record<string, any>) || {},
      isDefault: data.is_default || false,
    };

    // Armazenar no cache
    templateCache.set(cacheKey, {
      template,
      expiresAt: Date.now() + CACHE_TTL,
    });

    return template;
  } catch (error) {
    logger.error('Erro ao buscar template por tipo', error);
    return null;
  }
}

/**
 * Limpa o cache de templates
 * Útil após atualizações de templates
 */
export function clearTemplateCache(): void {
  templateCache.clear();
  logger.info('Cache de templates limpo');
}

/**
 * Limpa entradas expiradas do cache
 */
export function cleanExpiredCacheEntries(): void {
  const now = Date.now();
  for (const [key, value] of templateCache.entries()) {
    if (value.expiresAt <= now) {
      templateCache.delete(key);
    }
  }
}

