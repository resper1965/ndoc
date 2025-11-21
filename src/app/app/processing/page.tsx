'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/button';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Clock,
  FileText
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { showSuccess, showError } from '@/lib/toast';
import { logger } from '@/lib/logger';

interface ProcessingJob {
  id: string;
  document_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stage: 'conversion' | 'chunking' | 'embedding' | 'complete';
  progress_percentage: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
  document?: {
    id: string;
    title: string;
    path: string;
  };
}

export default function ProcessingPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
    // Auto-refresh a cada 5 segundos
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadJobs = async () => {
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

      // Buscar documentos da organização primeiro
      const { data: documents } = await supabase
        .from('documents')
        .select('id, title, path')
        .eq('organization_id', memberData.organization_id);

      const documentIds = documents?.map(d => d.id) || [];

      if (documentIds.length === 0) {
        setJobs([]);
        return;
      }

      // Buscar jobs dos documentos da organização
      const { data, error } = await supabase
        .from('document_processing_jobs')
        .select('*')
        .in('document_id', documentIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Criar mapa de documentos para lookup rápido
      const documentMap = new Map(documents?.map(d => [d.id, d]) || []);

      // Mapear resultados com informações do documento
      const mappedJobs = (data || []).map((job: any) => ({
        ...job,
        document: documentMap.get(job.document_id),
      }));

      setJobs(mappedJobs);
    } catch (error) {
      logger.error('Erro ao carregar jobs', error);
      showError('Erro ao carregar jobs de processamento');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRetry = async (jobId: string, documentId: string) => {
    try {
      const response = await fetch(`/api/process/document/${documentId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao reiniciar processamento');
      }

      showSuccess('Processamento reiniciado!');
      loadJobs();
    } catch (error: any) {
      showError(error.message || 'Erro ao reiniciar processamento');
    }
  };

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'failed':
        return 'Falhou';
      case 'processing':
        return 'Processando';
      default:
        return 'Pendente';
    }
  };

  const getStageLabel = (stage: ProcessingJob['stage']) => {
    switch (stage) {
      case 'conversion':
        return 'Conversão';
      case 'chunking':
        return 'Divisão em Chunks';
      case 'embedding':
        return 'Geração de Embeddings';
      case 'complete':
        return 'Completo';
      default:
        return stage;
    }
  };

  const activeJobs = jobs.filter(j => j.status === 'pending' || j.status === 'processing');
  const failedJobs = jobs.filter(j => j.status === 'failed');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Processamento de Documentos</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitore o processamento e vetorização de documentos
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setRefreshing(true);
            loadJobs();
          }}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Em Processamento</p>
              <p className="text-2xl font-bold">{activeJobs.length}</p>
            </div>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Falhados</p>
              <p className="text-2xl font-bold text-red-500">{failedJobs.length}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Concluídos</p>
              <p className="text-2xl font-bold text-green-500">{completedJobs.length}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Lista de Jobs */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400">
              Nenhum job de processamento encontrado
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(job.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          {job.document?.title || 'Documento desconhecido'}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {getStatusLabel(job.status)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        {job.document?.path || 'N/A'}
                      </p>
                      {job.status === 'processing' && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                            <span>{getStageLabel(job.stage)}</span>
                            <span>{job.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${job.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {job.status === 'failed' && job.error_message && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                          {job.error_message}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mt-2">
                        Criado em {new Date(job.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  {job.status === 'failed' && job.document_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(job.id, job.document_id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Tentar Novamente
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

