'use client';

/**
 * Document Card Component
 * 
 * Card informativo para exibir documentos na lista
 */

import { FileText, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from './button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentCardProps {
  document: {
    path: string;
    url: string;
    title?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function DocumentCard({
  document,
  onView,
  onEdit,
  onDelete,
  showActions = true,
}: DocumentCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "dd 'de' MMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Rascunho';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate">
              {document.title || document.path}
            </h3>
            {document.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                {document.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(document.updatedAt || document.createdAt)}</span>
              </div>
              {document.status && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                  {getStatusLabel(document.status)}
                </span>
              )}
            </div>
            <div className="mt-2">
              <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {document.path}
              </code>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

