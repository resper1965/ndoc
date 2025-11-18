'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  Columns,
  Code,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { showSuccess, showError } from '@/lib/toast';
import dynamic from 'next/dynamic';

// Importar editor dinamicamente
const MDXEditorWithPreview = dynamic(
  () => import('@/components/mdx-editor-with-preview').then(mod => mod.MDXEditorWithPreview),
  { ssr: false, loading: () => <div className="h-96 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" /> }
);

type ViewMode = 'edit' | 'preview' | 'split';

export default function EditDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Form state
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState<string>('other');
  const [status, setStatus] = useState<string>('draft');

  // Carregar documento
  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      const response = await fetch(`/api/ingest?id=${documentId}`);
      if (!response.ok) {
        throw new Error('Documento não encontrado');
      }
      const doc = await response.json();

      setTitle(doc.title || '');
      setPath(doc.path || '');
      setDescription(doc.description || '');
      setContent(doc.content || '');
      setDocumentType(doc.document_type || 'other');
      setStatus(doc.status || 'draft');
    } catch (error) {
      showError('Erro ao carregar documento');
      router.push('/app/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    if (!title.trim()) {
      showError('Título é obrigatório');
      return;
    }
    if (!path.trim()) {
      showError('Caminho (URL) é obrigatório');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/ingest', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: documentId,
          path: path.trim(),
          content: content,
          title: title.trim(),
          description: description.trim(),
          document_type: documentType,
          status: publish ? 'published' : status
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar documento');
      }

      showSuccess(publish ? 'Documento publicado!' : 'Documento salvo');

      if (publish) {
        router.push('/app/documents');
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      const response = await fetch('/api/ingest', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir documento');
      }

      showSuccess('Documento excluído');
      router.push('/app/documents');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Erro ao excluir');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Editar Documento
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/docs/${path}`} target="_blank">
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          {status !== 'published' && (
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              Publicar
            </Button>
          )}
        </div>
      </div>

      {/* Formulário */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Metadados */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Metadados</h3>

            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome do documento"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="path">Caminho (URL) *</Label>
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="caminho/do/documento"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                /docs/{path || 'exemplo'}
              </p>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição do documento"
                rows={3}
                className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-sm"
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-sm"
              >
                <option value="policy">Política</option>
                <option value="procedure">Procedimento</option>
                <option value="manual">Manual</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div>
              <Label>Status</Label>
              <p className={`mt-1 text-sm font-medium ${
                status === 'published'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {status === 'published' ? 'Publicado' : 'Rascunho'}
              </p>
            </div>
          </div>
        </div>

        {/* Editor Principal */}
        <div className="lg:col-span-3">
          {/* Toolbar do Editor */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setViewMode('edit')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-white dark:bg-slate-900 shadow-sm'
                    : 'hover:bg-white/50 dark:hover:bg-slate-900/50'
                }`}
                title="Apenas Editor"
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-slate-900 shadow-sm'
                    : 'hover:bg-white/50 dark:hover:bg-slate-900/50'
                }`}
                title="Split View"
              >
                <Columns className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-slate-900 shadow-sm'
                    : 'hover:bg-white/50 dark:hover:bg-slate-900/50'
                }`}
                title="Apenas Preview"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Editor/Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <MDXEditorWithPreview
              value={content}
              onChange={setContent}
              mode={viewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
