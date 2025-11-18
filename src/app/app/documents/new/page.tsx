'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Tabs, TabsList, Tab, TabsContent } from '@/components/tabs';
import { FileText, Upload, Sparkles } from 'lucide-react';
import { DocumentUpload } from '@/components/document-upload';
import { MDXEditorWithPreview } from '@/components/mdx-editor-with-preview';
import { Input } from '@/components/input';
import { showSuccess, showError } from '@/lib/toast';
import { ProcessingStatus } from '@/components/processing-status';

export default function NewDocumentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'upload' | 'ai'>('create');
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    path: '',
    title: '',
    description: '',
    content: `---
title: 
description: 
---

# 

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
        router.push('/app/documents');
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
      if (result.document?.id) {
        setUploadedDocumentId(result.document.id);
      } else {
        showSuccess('Upload realizado com sucesso!');
        router.push('/app/documents');
      }
    } catch (error: any) {
      showError(error.message || 'Erro ao fazer upload');
    }
  };

  const handleUploadMultiple = async (files: File[]) => {
    try {
      const uploadPromises = files.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch('/api/ingest/upload', {
          method: 'POST',
          body: formData,
        });
      });

      const results = await Promise.all(uploadPromises);
      const errors = results.filter((r) => !r.ok);

      if (errors.length > 0) {
        showError(`${errors.length} arquivo(s) falharam no upload`);
      } else {
        showSuccess(`${files.length} arquivo(s) enviados com sucesso!`);
        router.push('/app/documents');
      }
    } catch (error: any) {
      showError(error.message || 'Erro ao fazer upload em lote');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Novo Documento</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Crie um novo documento do zero, faça upload de arquivos ou use IA
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <Tab value="create">
            <FileText className="h-4 w-4 mr-2" />
            Criar do Zero
          </Tab>
          <Tab value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Tab>
          <Tab value="ai" disabled>
            <Sparkles className="h-4 w-4 mr-2" />
            IA (Em breve)
          </Tab>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Caminho (path)</label>
                <Input
                  value={newDocForm.path}
                  onChange={(e) => setNewDocForm({ ...newDocForm, path: e.target.value })}
                  placeholder="ex: getting-started/intro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <Input
                  value={newDocForm.title}
                  onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                  placeholder="Título do documento"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
              <Input
                value={newDocForm.description}
                onChange={(e) => setNewDocForm({ ...newDocForm, description: e.target.value })}
                placeholder="Descrição do documento"
              />
            </div>
            <MDXEditorWithPreview
              value={newDocForm.content}
              onChange={(value) => setNewDocForm({ ...newDocForm, content: value })}
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()}>
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
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            {uploadedDocumentId ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Processando documento...</h3>
                <ProcessingStatus
                  documentId={uploadedDocumentId}
                  onComplete={() => {
                    showSuccess('Documento processado com sucesso!');
                    router.push('/app/documents');
                  }}
                  onError={(error) => {
                    showError(`Erro ao processar: ${error}`);
                  }}
                />
              </div>
            ) : (
              <DocumentUpload
                onUpload={handleUpload}
                onUploadMultiple={handleUploadMultiple}
                multiple={true}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

