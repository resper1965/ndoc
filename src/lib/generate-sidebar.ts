import React from 'react';
import { allDocs } from 'contentlayer/generated';
import { 
  BookOpen, 
  Rocket, 
  FileCode, 
  Settings, 
  FileText,
  Code,
  Database,
  Zap,
  Layers,
  Package,
  type LucideIcon
} from 'lucide-react';

interface SidebarPage {
  title: string;
  href: string;
  order?: number;
}

interface SidebarSection {
  title: string;
  icon: React.ReactNode;
  defaultOpen: boolean;
  pages: SidebarPage[];
  href?: string;
  order?: number;
}

// Mapeamento de diretórios para ícones e títulos
const directoryConfig: Record<string, { icon: LucideIcon; title: string }> = {
  '': { icon: Rocket, title: 'Primeiros Passos' },
  'exemplos': { icon: FileCode, title: 'Exemplos' },
  'guides': { icon: BookOpen, title: 'Guias' },
  'guia': { icon: BookOpen, title: 'Guias' },
  'api': { icon: Code, title: 'API' },
  'reference': { icon: FileText, title: 'Referência' },
  'tutorial': { icon: Zap, title: 'Tutoriais' },
  'tutorials': { icon: Zap, title: 'Tutoriais' },
  'config': { icon: Settings, title: 'Configuração' },
  'settings': { icon: Settings, title: 'Configurações' },
  'database': { icon: Database, title: 'Banco de Dados' },
  'library': { icon: Package, title: 'Bibliotecas' },
  'specs': { icon: Layers, title: 'Especificações' },
};

// Função para obter ícone e título baseado no diretório
function getDirectoryConfig(dir: string): { icon: LucideIcon; title: string } {
  const normalizedDir = dir.toLowerCase();
  
  // Verificar correspondência exata
  if (directoryConfig[normalizedDir]) {
    return directoryConfig[normalizedDir];
  }
  
  // Verificar correspondência parcial
  for (const [key, value] of Object.entries(directoryConfig)) {
    if (normalizedDir.includes(key) || key.includes(normalizedDir)) {
      return value;
    }
  }
  
  // Padrão
  return { icon: FileText, title: dir || 'Documentação' };
}

export function generateSidebar(): SidebarSection[] {
  // Agrupar documentos por diretório
  const docsByDir = new Map<string, Array<{ doc: typeof allDocs[0]; order: number }>>();
  
  allDocs.forEach((doc) => {
    const path = doc._raw.flattenedPath;
    const parts = path.split('/');
    const dir = parts.length > 1 ? parts[0] : '';
    
    // Extrair order do campo order se existir
    const order = (doc as any).order ?? 999;
    
    if (!docsByDir.has(dir)) {
      docsByDir.set(dir, []);
    }
    
    docsByDir.get(dir)!.push({ doc, order });
  });
  
  // Converter para seções da sidebar
  const sections: SidebarSection[] = [];
  
  // Ordenar diretórios (vazio primeiro, depois alfabeticamente)
  const sortedDirs = Array.from(docsByDir.keys()).sort((a, b) => {
    if (a === '') return -1;
    if (b === '') return 1;
    return a.localeCompare(b);
  });
  
  sortedDirs.forEach((dir) => {
    const docs = docsByDir.get(dir)!;
    
    // Ordenar documentos dentro do diretório
    docs.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.doc.title.localeCompare(b.doc.title);
    });
    
    // Criar páginas
    const pages: SidebarPage[] = docs.map(({ doc }) => ({
      title: doc.title,
      href: doc.url,
      order: (doc as any).order,
    }));
    
    // Obter configuração do diretório
    const config = getDirectoryConfig(dir);
    const Icon = config.icon;
    
    // Criar elemento React para o ícone
    const iconElement = React.createElement(Icon, { className: 'h-5 w-5' });
    
    sections.push({
      title: dir ? config.title : 'Primeiros Passos',
      icon: iconElement,
      defaultOpen: dir === '' || dir === 'exemplos',
      pages,
    });
  });
  
  return sections;
}

// Função para mesclar sidebar automática com manual (se necessário)
export function mergeSidebar(
  auto: SidebarSection[],
  manual?: SidebarSection[]
): SidebarSection[] {
  if (!manual || manual.length === 0) {
    return auto;
  }
  
  // Se houver sidebar manual, usar ela como base e adicionar itens automáticos que não existem
  const manualTitles = new Set(manual.map(s => s.title));
  const additional = auto.filter(s => !manualTitles.has(s.title));
  
  return [...manual, ...additional];
}

