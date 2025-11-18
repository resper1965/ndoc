import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';

export const dynamic = 'force-dynamic';

// Componente de Card de Documento
function DocumentCard({
  id,
  title,
  description,
  path,
  status,
  documentType,
  updatedAt
}: {
  id: string;
  title: string;
  description?: string;
  path: string;
  status: string;
  documentType?: string;
  updatedAt: string;
}) {
  const typeLabels: Record<string, string> = {
    policy: 'Política',
    procedure: 'Procedimento',
    manual: 'Manual',
    other: 'Outro'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {title}
            </h3>
          </div>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
              {description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(updatedAt).toLocaleDateString('pt-BR')}
            </span>
            {documentType && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                {typeLabels[documentType] || documentType}
              </span>
            )}
            <span className={`
              flex items-center gap-1 px-2 py-0.5 rounded
              ${status === 'published'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
              }
            `}>
              {status === 'published' ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Publicado
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Rascunho
                </>
              )}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1">
          <Link href={`/docs/${path}`}>
            <Button variant="ghost" size="sm" title="Visualizar">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/app/documents/${id}/edit`}>
            <Button variant="ghost" size="sm" title="Editar">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" title="Mais opções" className="text-slate-400">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default async function DocumentsPage() {
  const supabase = await createClient();
  const organizationId = await getUserOrganization();

  let documents: any[] = [];

  if (organizationId) {
    const { data } = await supabase
      .from('documents')
      .select('id, title, description, path, status, document_type, updated_at')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false });
    documents = data || [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Documentos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gerencie todos os seus documentos
          </p>
        </div>
        <Link href="/app/documents/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Documento
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Lista de Documentos */}
      {documents.length > 0 ? (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              description={doc.description}
              path={doc.path}
              status={doc.status}
              documentType={doc.document_type}
              updatedAt={doc.updated_at}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Nenhum documento ainda
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Comece criando seu primeiro documento. Você pode criar do zero, fazer upload ou gerar com IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/app/documents/new">
              <Button variant="primary" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Criar Documento
              </Button>
            </Link>
            <Link href="/app/documents/new?mode=upload">
              <Button variant="outline">
                Fazer Upload
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
