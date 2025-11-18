/**
 * Gera sidebar dinamicamente a partir dos documentos do banco
 */

import { createClient } from './supabase/server';
import { logger } from './logger';
import { getUserOrganization } from './supabase/utils';

export interface SidebarSection {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  href?: string;
  pages?: Array<{
    title: string;
    href: string;
    order?: number;
  }>;
}

/**
 * Gera estrutura de sidebar a partir dos documentos do banco
 */
export async function generateSidebar(): Promise<SidebarSection[]> {
  try {
    const supabase = await createClient();
    const organizationId = await getUserOrganization();

    if (!organizationId) {
      logger.warn('Usuário sem organização, retornando sidebar vazio');
      return [];
    }

    // Buscar todos os documentos da organização, ordenados por path
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, path, title, frontmatter, order')
      .eq('organization_id', organizationId)
      .order('order', { ascending: true, nullsFirst: false })
      .order('path', { ascending: true });

    if (error) {
      logger.error('Erro ao buscar documentos para sidebar', error);
      return [];
    }

    if (!documents || documents.length === 0) {
      return [];
    }

    // Organizar documentos por seções (baseado no path)
    const sectionsMap = new Map<string, SidebarSection>();

    for (const doc of documents) {
      // Extrair seção do path (ex: "getting-started/introduction" -> "getting-started")
      const pathParts = doc.path.split('/');
      const sectionName = pathParts.length > 1 ? pathParts[0] : 'Documentos';
      const docPath = pathParts.length > 1 ? pathParts.slice(1).join('/') : doc.path;

      // Normalizar nome da seção (capitalizar)
      const sectionTitle = sectionName
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Obter ou criar seção
      if (!sectionsMap.has(sectionName)) {
        sectionsMap.set(sectionName, {
          title: sectionTitle,
          defaultOpen: sectionName === 'getting-started' || sectionName === 'documentos',
          pages: [],
        });
      }

      const section = sectionsMap.get(sectionName)!;
      
      // Adicionar página à seção
      const title = doc.title || docPath.split('/').pop() || doc.path;
      const href = `/docs/${doc.path}`;
      
      section.pages!.push({
        title,
        href,
        order: doc.order || 0,
      });
    }

    // Ordenar páginas dentro de cada seção
    for (const section of sectionsMap.values()) {
      if (section.pages) {
        section.pages.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    }

    // Converter map para array e ordenar seções
    const sections = Array.from(sectionsMap.values());
    sections.sort((a, b) => {
      // "Documentos" sempre primeiro, depois alfabeticamente
      if (a.title === 'Documentos') return -1;
      if (b.title === 'Documentos') return 1;
      return a.title.localeCompare(b.title);
    });

    return sections;
  } catch (error) {
    logger.error('Erro ao gerar sidebar', error);
    return [];
  }
}

/**
 * Gera sidebar e retorna como JSON (para API routes)
 */
export async function generateSidebarJSON(): Promise<{ sections: SidebarSection[] }> {
  const sections = await generateSidebar();
  return { sections };
}

