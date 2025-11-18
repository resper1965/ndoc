'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Upload,
  Sparkles,
  Save,
  Eye,
  Columns,
  Code
} from 'lucide-react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { showSuccess, showError } from '@/lib/toast';
import dynamic from 'next/dynamic';

// Importar editor dinamicamente para evitar SSR issues
const MDXEditorWithPreview = dynamic(
  () => import('@/components/mdx-editor-with-preview').then(mod => mod.MDXEditorWithPreview),
  { ssr: false, loading: () => <div className="h-96 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" /> }
);

type ViewMode = 'edit' | 'preview' | 'split';
type CreateMode = 'blank' | 'upload' | 'ai';

export default function NewDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as CreateMode) || 'blank';

  const [createMode, setCreateMode] = useState<CreateMode>(initialMode);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(`---
title: ""
description: ""
---

# Título do Documento

Comece a escrever seu conteúdo aqui...
`);
  const [documentType, setDocumentType] = useState<string>('other');

  // Auto-gerar path a partir do título
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!path || path === generateSlug(title)) {
      setPath(generateSlug(value));
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
      // Atualizar frontmatter no conteúdo
      const updatedContent = content.replace(
        /^---\n[\s\S]*?\n---/,
        `---
title: "${title}"
description: "${description}"
---`
      );

      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: path.trim(),
          content: updatedContent,
          title: title.trim(),
          description: description.trim(),
          document_type: documentType,
          status: publish ? 'published' : 'draft'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar documento');
      }

      showSuccess(publish ? 'Documento publicado!' : 'Documento salvo como rascunho');
      router.push('/app/documents');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

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
              Novo Documento
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Publicar'}
          </Button>
        </div>
      </div>

      {/* Seleção de Modo de Criação */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        <button
          onClick={() => setCreateMode('blank')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            createMode === 'blank'
              ? 'bg-white dark:bg-slate-900 shadow-sm'
              : 'hover:bg-white/50 dark:hover:bg-slate-900/50'
          }`}
        >
          <FileText className="h-4 w-4" />
          Do Zero
        </button>
        <button
          onClick={() => setCreateMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            createMode === 'upload'
              ? 'bg-white dark:bg-slate-900 shadow-sm'
              : 'hover:bg-white/50 dark:hover:bg-slate-900/50'
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
        <button
          onClick={() => setCreateMode('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            createMode === 'ai'
              ? 'bg-white dark:bg-slate-900 shadow-sm'
              : 'hover:bg-white/50 dark:hover:bg-slate-900/50'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Gerar com IA
        </button>
      </div>

      {/* Formulário Principal */}
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
                onChange={(e) => handleTitleChange(e.target.value)}
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
