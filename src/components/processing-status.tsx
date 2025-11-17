'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ProcessingStatusProps {
  documentId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ProcessingJob {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_found';
  stage?: string;
  progress?: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

const STAGE_LABELS: Record<string, string> = {
  conversion: 'Conversão',
  chunking: 'Dividindo em chunks',
  embedding: 'Gerando embeddings',
  complete: 'Concluído',
};

export function ProcessingStatus({
  documentId,
  onComplete,
  onError,
  autoRefresh = true,
  refreshInterval = 2000,
}: ProcessingStatusProps) {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/process/document/${documentId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setJob({ status: 'not_found' });
          setLoading(false);
          return;
        }
        throw new Error('Erro ao buscar status');
      }

      const data = await response.json();
      setJob(data);
      setError(null);
      setLoading(false);

      // Callbacks
      if (data.status === 'completed' && onComplete) {
        onComplete();
      } else if (data.status === 'failed' && onError) {
        onError(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setLoading(false);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  useEffect(() => {
    fetchStatus();

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (job?.status === 'processing' || job?.status === 'pending') {
        fetchStatus();
      } else {
        clearInterval(interval);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [documentId, autoRefresh, refreshInterval, job?.status]);

  if (loading && !job) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Verificando status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <XCircle className="h-4 w-4" />
        <span>{error}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          className="h-6 px-2"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (!job || job.status === 'not_found') {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
        <AlertCircle className="h-4 w-4" />
        <span>Status não disponível</span>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'processing':
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'completed':
        return 'Processamento concluído';
      case 'failed':
        return 'Processamento falhou';
      case 'processing':
        return job.stage ? STAGE_LABELS[job.stage] || job.stage : 'Processando...';
      case 'pending':
        return 'Aguardando processamento...';
      default:
        return 'Status desconhecido';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
        {job.status === 'processing' && job.progress !== undefined && (
          <span className="text-slate-500 dark:text-slate-400">
            ({job.progress}%)
          </span>
        )}
      </div>

      {job.status === 'processing' && job.progress !== undefined && (
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}

      {job.status === 'failed' && job.error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{job.error}</p>
        </div>
      )}

      {job.status === 'processing' && (
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Atualizar
        </Button>
      )}
    </div>
  );
}

