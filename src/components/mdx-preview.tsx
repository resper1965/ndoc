'use client';

/**
 * MDX Preview Component
 * 
 * Preview em tempo real do conteúdo MDX renderizado
 * Versão client-side simplificada
 */

import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { components } from './mdx-components';

interface MDXPreviewProps {
  source: string;
  className?: string;
}

export function MDXPreview({ source, className = '' }: MDXPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [parsedContent, setParsedContent] = useState<{
    frontmatter: Record<string, unknown>;
    content: string;
  } | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Parse frontmatter do conteúdo
    try {
      const parsed = matter(source);
      setParsedContent({
        frontmatter: parsed.data,
        content: parsed.content,
      });
    } catch {
      // Se não tiver frontmatter válido, usar conteúdo como está
      setParsedContent({
        frontmatter: {},
        content: source,
      });
    } finally {
      setIsLoading(false);
    }
  }, [source]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!parsedContent) {
    return (
      <div className={`p-4 text-slate-500 ${className}`}>
        Nenhum conteúdo para visualizar
      </div>
    );
  }

  return (
    <div className={`overflow-auto h-full ${className}`}>
      <div className="prose prose-slate dark:prose-invert max-w-none p-4">
        {/* Mostrar frontmatter se existir */}
        {Object.keys(parsedContent.frontmatter).length > 0 && (
          <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Frontmatter:</h3>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(parsedContent.frontmatter, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Renderizar markdown */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components as any}
        >
          {parsedContent.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
