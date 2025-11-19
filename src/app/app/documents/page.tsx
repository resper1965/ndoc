'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { 
  FileText, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { showSuccess, showError } from '@/lib/toast';
import { logger } from '@/lib/logger';

interface Document {
  id: string;
  title: string;
  path: string;
  description?: string;
  updated_at: string;
  created_at: string;
}

export default function DocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!memberData) return;

      const { data, error } = await supabase
        .from('documents')
        .select('id, title, path, description, updated_at, created_at')
        .eq('organization_id', memberData.organization_id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      logger.error('Erro ao carregar documentos', error);
      showError('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/ingest?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir documento');
      }

      showSuccess('Documento excluído com sucesso!');
      loadDocuments();
    } catch (error: any) {
      showError(error.message || 'Erro ao excluir documento');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Documentos</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gerencie todos os seus documentos
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/documents/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Documento
            </Button>
          </Link>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Documentos */}
      {filteredDocuments.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/app/documents/${doc.id}/edit`}
                        className="font-medium hover:text-primary transition-colors block truncate"
                      >
                        {doc.title}
                      </Link>
                      <div className="text-sm text-slate-500 truncate">
                        {doc.path}
                      </div>
                      {doc.description && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {doc.description}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mt-1">
                        Atualizado em {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/app/documents/${doc.id}/edit`}>
                      <Button variant="none" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="none"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? 'Nenhum documento encontrado' : 'Nenhum documento ainda'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {searchQuery
              ? 'Tente ajustar sua busca'
              : 'Comece criando seu primeiro documento'}
          </p>
          {!searchQuery && (
            <Link href="/app/documents/new">
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Criar Documento
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

