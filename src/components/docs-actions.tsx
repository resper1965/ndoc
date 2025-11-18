'use client';

import { useState } from 'react';
import { Plus, Upload as UploadIcon } from 'lucide-react';
import { Button } from './button';
import { DocumentUpload } from './document-upload';
import { showSuccess, showError } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog';
import { Input } from './input';
import { Label } from './label';
import { MDXEditorWithPreview } from './mdx-editor-with-preview';
import { ProcessingStatus } from './processing-status';
import { reloadSidebar } from './dynamic-sidebar';

interface DocsActionsProps {
  onDocumentCreated?: () => void;
}

export function DocsActions({ onDocumentCreated }: DocsActionsProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [newDocForm, setNewDocForm] = useState({
    path: '',
    title: '',
    description: '',
    content: `---
title: ${''}
description: ${''}
---

# ${''}

Comece a escrever seu documento aqui...

`,
  });

  const handleCreateDocument = async () => {
    if (!newDocForm.path || !newDocForm.title) {
      showError('Preencha pelo menos o caminho e o título do documento');
      return;
    }

    setCreating(true);
    try {
      const content = `---
title: ${newDocForm.title}
description: ${newDocForm.description || ''}
---

${newDocForm.content.split('---').slice(2).join('---').trim() || '# ' + newDocForm.title + '\n\nComece a escrever...'}`;

      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: newDocForm.path.replace(/\.mdx?$/, ''),
          content: content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        showError(data.error || 'Erro ao criar documento');
      } else {
        showSuccess('Documento criado com sucesso!');
        setShowCreateDialog(false);
        setNewDocForm({
          path: '',
          title: '',
          description: '',
          content: '',
        });
        reloadSidebar(); // Recarregar sidebar
        if (onDocumentCreated) {
          onDocumentCreated();
        } else {
          router.refresh();
        }
      }
    } catch {
      showError('Erro ao criar documento');
    } finally {
      setCreating(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ingest/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao fazer upload');
      }

      const result = await response.json();
      showSuccess('Documento enviado com sucesso! Processando...');
      reloadSidebar(); // Recarregar sidebar
      
      // Manter dialog aberto para mostrar status de processamento
      if (result.document?.id) {
        setUploadedDocumentId(result.document.id);
      } else {
        setShowUploadDialog(false);
        if (onDocumentCreated) {
          onDocumentCreated();
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUploadMultiple = async (files: File[]) => {
    const BATCH_SIZE = 3; // Processar 3 arquivos por vez
    const results: Array<{ file: string; success: boolean; documentId?: string; error?: string }> = [];
    
    try {
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (file) => {
          try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/ingest/upload', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Erro ao fazer upload');
            }

            const result = await response.json();
            return {
              file: file.name,
              success: true,
              documentId: result.document?.id,
            };
          } catch (error) {
            return {
              file: file.name,
              success: false,
              error: error instanceof Error ? error.message : 'Erro desconhecido',
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        showSuccess(`${successCount} documento(s) enviado(s) com sucesso!${errorCount > 0 ? ` ${errorCount} falharam.` : ''}`);
        reloadSidebar(); // Recarregar sidebar
        
        // Se houver apenas um arquivo e foi bem-sucedido, mostrar status de processamento
        if (results.length === 1 && results[0].success && results[0].documentId) {
          setUploadedDocumentId(results[0].documentId);
        } else {
          setShowUploadDialog(false);
          if (onDocumentCreated) {
            onDocumentCreated();
          } else {
            router.refresh();
          }
        }
      } else {
        showError('Nenhum documento foi enviado com sucesso.');
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Erro ao fazer upload em lote');
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Documento</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUploadDialog(true)}
          className="inline-flex items-center gap-2"
        >
          <UploadIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      </div>

      {/* Dialog de Criação */}
      <Dialog open={showCreateDialog} setOpen={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Documento</DialogTitle>
            <DialogDescription>
              Crie um novo documento MDX. O caminho define onde ele aparecerá na navegação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doc-path">Caminho *</Label>
                <Input
                  id="doc-path"
                  value={newDocForm.path}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-z0-9/-]/gi, '').toLowerCase();
                    setNewDocForm((prev) => ({
                      ...prev,
                      path: value,
                      title: prev.title || value.split('/').pop() || '',
                    }));
                  }}
                  placeholder="exemplo/documento"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Use apenas letras, números, hífens e barras
                </p>
              </div>
              <div>
                <Label htmlFor="doc-title">Título *</Label>
                <Input
                  id="doc-title"
                  value={newDocForm.title}
                  onChange={(e) =>
                    setNewDocForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Título do Documento"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="doc-description">Descrição</Label>
              <Input
                id="doc-description"
                value={newDocForm.description}
                onChange={(e) =>
                  setNewDocForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Breve descrição do documento"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="doc-content">Conteúdo</Label>
              <div className="mt-1 border rounded-lg">
                <MDXEditorWithPreview
                  value={newDocForm.content}
                  onChange={(value) =>
                    setNewDocForm((prev) => ({ ...prev, content: value }))
                  }
                  height="400px"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateDocument}
              disabled={creating || !newDocForm.path || !newDocForm.title}
            >
              {creating ? 'Criando...' : 'Criar Documento'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Upload */}
      <Dialog open={showUploadDialog} setOpen={(open) => {
        setShowUploadDialog(open);
        if (!open) {
          setUploadedDocumentId(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fazer Upload de Documento</DialogTitle>
            <DialogDescription>
              Faça upload de PDF, DOCX, MDX e outros formatos. Eles serão convertidos automaticamente.
            </DialogDescription>
          </DialogHeader>
          {uploadedDocumentId ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                  Documento enviado com sucesso! O processamento de vetorização foi iniciado.
                </p>
                <ProcessingStatus
                  documentId={uploadedDocumentId}
                  autoRefresh={true}
                  onComplete={() => {
                    showSuccess('Processamento concluído! O documento está pronto para busca semântica.');
                    setTimeout(() => {
                      setShowUploadDialog(false);
                      setUploadedDocumentId(null);
                      if (onDocumentCreated) {
                        onDocumentCreated();
                      } else {
                        router.refresh();
                      }
                    }, 2000);
                  }}
                  onError={(error) => {
                    showError(`Erro no processamento: ${error}`);
                  }}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadDialog(false);
                    setUploadedDocumentId(null);
                    if (onDocumentCreated) {
                      onDocumentCreated();
                    } else {
                      router.refresh();
                    }
                  }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <DocumentUpload
              onUpload={handleUpload}
              onUploadMultiple={handleUploadMultiple}
              multiple={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

