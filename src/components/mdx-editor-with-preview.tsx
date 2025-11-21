'use client';

/**
 * MDX Editor with Preview
 *
 * Componente que combina editor e preview em split-view
 * com toggle para alternar entre modos
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MDXPreview } from './mdx-preview';
import { Button } from './button';
import { Eye, Code, Split } from 'lucide-react';
import { AIActions } from './ai-actions';

// Lazy load MDXEditor para reduzir bundle size inicial
// CodeMirror é pesado (~300 kB) e só é necessário na página de edição
const MDXEditor = dynamic(
  () => import('./mdx-editor').then((mod) => ({ default: mod.MDXEditor })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500 dark:text-slate-400">
          Carregando editor...
        </div>
      </div>
    ),
    ssr: false, // CodeMirror requer browser APIs
  }
);

type ViewMode = 'editor' | 'preview' | 'split';

interface MDXEditorWithPreviewProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  className?: string;
  readOnly?: boolean;
  themeId?: string;
  showAIActions?: boolean;
}

export function MDXEditorWithPreview({
  value,
  onChange,
  placeholder,
  height = '600px',
  className = '',
  readOnly = false,
  themeId,
  showAIActions = true,
}: MDXEditorWithPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  return (
    <div
      className={`flex flex-col border rounded-lg overflow-hidden ${className}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Editor MDX
          </span>
          {showAIActions && !readOnly && (
            <AIActions
              currentContent={value}
              themeId={themeId}
              onContentGenerated={(content) => onChange(content)}
              onContentImproved={(content) => onChange(content)}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="none"
            size="sm"
            onClick={() => setViewMode('editor')}
            className={
              viewMode === 'editor' ? 'bg-slate-200 dark:bg-slate-700' : ''
            }
            title="Apenas Editor"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="none"
            size="sm"
            onClick={() => setViewMode('split')}
            className={
              viewMode === 'split' ? 'bg-slate-200 dark:bg-slate-700' : ''
            }
            title="Editor e Preview"
          >
            <Split className="h-4 w-4" />
          </Button>
          <Button
            variant="none"
            size="sm"
            onClick={() => setViewMode('preview')}
            className={
              viewMode === 'preview' ? 'bg-slate-200 dark:bg-slate-700' : ''
            }
            title="Apenas Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden" style={{ height }}>
        {viewMode === 'editor' && (
          <div className="flex-1">
            <MDXEditor
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              height="100%"
              readOnly={readOnly}
            />
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="flex-1 overflow-auto">
            <MDXPreview source={value} />
          </div>
        )}

        {viewMode === 'split' && (
          <>
            <div className="flex-1 border-r overflow-hidden">
              <MDXEditor
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                height="100%"
                readOnly={readOnly}
              />
            </div>
            <div className="flex-1 overflow-auto">
              <MDXPreview source={value} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
