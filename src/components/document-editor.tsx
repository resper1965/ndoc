'use client';

import { useState, useEffect } from 'react';
import { Edit, Save, X, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { MDXEditorWithPreview } from './mdx-editor-with-preview';
import { validateMDX, type ValidationError } from '@/lib/validate-mdx';
import { showSuccess, showError } from '@/lib/toast';
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { useRouter } from 'next/navigation';
import matter from 'gray-matter';

interface DocumentEditorProps {
  documentPath: string;
  documentContent: string;
  documentTitle?: string;
  onSave?: () => void;
}

export function DocumentEditor({
  documentPath,
  documentContent,
  documentTitle,
  onSave,
}: DocumentEditorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Parse frontmatter from content
  const parseContent = (mdxContent: string) => {
    try {
      const parsed = matter(mdxContent);
      return {
        frontmatter: parsed.data,
        body: parsed.content,
        fullContent: mdxContent,
      };
    } catch {
      // If parsing fails, assume no frontmatter
      return {
        frontmatter: {},
        body: mdxContent,
        fullContent: mdxContent,
      };
    }
  };

  useEffect(() => {
    if (isOpen && documentContent) {
      const parsed = parseContent(documentContent);
      setContent(parsed.fullContent);
      setValidationErrors([]);
    }
  }, [isOpen, documentContent]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    if (saving) return;
    setIsOpen(false);
    setContent('');
    setValidationErrors([]);
  };

  const handleSave = async () => {
    setSaving(true);
    setValidationErrors([]);

    // Validar formato MDX
    const validation = validateMDX(content);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      const errorMessages = validation.errors.map(e => `- ${e.message}`).join('\n');
      showError(`Erros de validação:\n${errorMessages}`);
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: documentPath.replace(/\.mdx$/, ''),
          content: content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar documento');
      }

      showSuccess('Documento salvo com sucesso!');
      handleClose();
      
      if (onSave) {
        onSave();
      }
      
      // Refresh the page to show updated content
      router.refresh();
    } catch (error) {
      logger.error('Erro ao salvar documento', error);
      showError(error instanceof Error ? error.message : 'Erro ao salvar documento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="flex items-center gap-2"
      >
        <Edit className="h-4 w-4" />
        <span className="hidden sm:inline">Editar</span>
      </Button>

      <Dialog open={isOpen} setOpen={handleClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Documento: {documentTitle || documentPath}
            </DialogTitle>
            <DialogDescription>
              Edite o conteúdo do documento abaixo. O frontmatter e o conteúdo serão validados antes de salvar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <div className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                Caminho: <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">{documentPath}</code>
              </div>
              <MDXEditorWithPreview
                value={content}
                onChange={(value) => {
                  setContent(value);
                  // Validar em tempo real se tiver conteúdo
                  if (value.trim()) {
                    const validation = validateMDX(value);
                    setValidationErrors(validation.errors);
                  } else {
                    setValidationErrors([]);
                  }
                }}
                height="600px"
                placeholder="Edite o conteúdo do documento aqui..."
              />
            </div>

            {validationErrors.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Erros de validação:
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-red-700 dark:text-red-300">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>
                      {error.field && <strong>{error.field}: </strong>}
                      {error.message}
                      {error.line && ` (linha ${error.line})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || validationErrors.length > 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

