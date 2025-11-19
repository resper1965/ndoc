'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { MDXEditorWithPreview } from '@/components/mdx-editor-with-preview';
import { Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';
import { createClient } from '@/lib/supabase/client';

export default function EditDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [document, setDocument] = useState<{
    id: string;
    title: string;
    path: string;
    description?: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, path, description, content')
        .eq('id', documentId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        showError('Documento não encontrado');
        router.push('/app/documents');
        return;
      }
      setDocument(data);
    } catch (error: any) {
      showError(error.message || 'Erro ao carregar documento');
      router.push('/app/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content: string, title: string, path: string) => {
    if (!document) return;

    setSaving(true);
    try {
      const response = await fetch('/api/ingest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: document.id,
          path: path.replace(/\.mdx?$/, ''),
          content: content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar documento');
      }

      showSuccess('Documento salvo com sucesso!');
      router.push('/app/documents');
    } catch (error: any) {
      showError(error.message || 'Erro ao salvar documento');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Documento não encontrado</p>
        <Button variant="outline" onClick={() => router.push('/app/documents')} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Editar Documento</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {document.path}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <MDXEditorWithPreview
          value={document.content}
          onChange={(value) => {
            setDocument({ ...document, content: value });
          }}
        />
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleSave(
                document.content,
                document.title,
                document.path
              );
            }}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

