'use client';

import { useEffect, useState } from 'react';
import { SidebarMenuItem, NestedLink } from '@/components/sidebar';
import { FileText } from 'lucide-react';

interface SidebarSection {
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

export function DynamicSidebar() {
  const [sections, setSections] = useState<SidebarSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSidebar() {
      try {
        const response = await fetch('/api/sidebar/generate');
        if (!response.ok) {
          throw new Error('Erro ao carregar sidebar');
        }
        const data = await response.json();
        setSections(data.sections || []);
      } catch {
        // Erro silencioso - sidebar será recarregado quando necessário
        setSections([]);
      } finally {
        setLoading(false);
      }
    }

    loadSidebar();
  }, []);

  // Recarregar sidebar quando receber evento customizado
  useEffect(() => {
    const handleReload = () => {
      fetch('/api/sidebar/generate')
        .then(res => res.json())
        .then(data => setSections(data.sections || []))
        .catch(() => {
          // Erro silencioso - sidebar será recarregado quando necessário
        });
    };

    window.addEventListener('sidebar-reload', handleReload);
    return () => window.removeEventListener('sidebar-reload', handleReload);
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Carregando documentos...
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Nenhum documento encontrado. Crie ou importe documentos para começar.
      </div>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <SidebarMenuItem
          isCollapsable={section.pages && section.pages.length > 0}
          key={section.title}
          label={section.title}
          href={section.href}
          icon={section.icon || <FileText className="h-5 w-5" />}
          defaultOpen={section.defaultOpen}
        >
          {section.pages?.map((page) => (
            <NestedLink key={page.href} href={page.href}>
              {page.title}
            </NestedLink>
          ))}
        </SidebarMenuItem>
      ))}
    </>
  );
}

// Função para recarregar sidebar (pode ser chamada após criar/importar documentos)
export function reloadSidebar() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sidebar-reload'));
  }
}

