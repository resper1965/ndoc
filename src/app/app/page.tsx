'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/button';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight,
  BookOpen,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2 as LoaderIcon
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface DashboardStats {
  totalDocuments: number;
  totalTeamMembers: number;
  documentsByType: {
    policy: number;
    procedure: number;
    manual: number;
    other: number;
  };
  processingStats: {
    completed: number;
    processing: number;
    failed: number;
    pending: number;
  };
  recentDocuments: Array<{
    id: string;
    title: string;
    path: string;
    updated_at: string;
  }>;
  documentsLast30Days: number;
  organizationName: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalTeamMembers: 0,
    documentsByType: {
      policy: 0,
      procedure: 0,
      manual: 0,
      other: 0,
    },
    processingStats: {
      completed: 0,
      processing: 0,
      failed: 0,
      pending: 0,
    },
    recentDocuments: [],
    documentsLast30Days: 0,
    organizationName: '',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const supabase = createClient();
      
      // Buscar organização do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!memberData) return;

      const orgId = memberData.organization_id;

      // Buscar organização
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .single();

      // Buscar estatísticas
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        documentsResult,
        membersResult,
        recentDocsResult,
        documentsByTypeResult,
        processingStatsResult,
        documentsLast30DaysResult,
      ] = await Promise.all([
        supabase
          .from('documents')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId),
        supabase
          .from('organization_members')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId),
        supabase
          .from('documents')
          .select('id, title, path, updated_at')
          .eq('organization_id', orgId)
          .order('updated_at', { ascending: false })
          .limit(5),
        supabase
          .from('documents')
          .select('document_type')
          .eq('organization_id', orgId),
        supabase
          .from('documents')
          .select('id')
          .eq('organization_id', orgId),
        supabase
          .from('documents')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .gte('created_at', thirtyDaysAgo.toISOString()),
      ]);

      // Contar documentos por tipo
      const docsByType = {
        policy: 0,
        procedure: 0,
        manual: 0,
        other: 0,
      };
      (documentsByTypeResult.data || []).forEach((doc: any) => {
        const type = doc.document_type || 'other';
        if (type in docsByType) {
          docsByType[type as keyof typeof docsByType]++;
        } else {
          docsByType.other++;
        }
      });

      // Buscar jobs de processamento
      const documentIds = (processingStatsResult.data || []).map((d: any) => d.id);
      const processingStats = {
        completed: 0,
        processing: 0,
        failed: 0,
        pending: 0,
      };
      
      if (documentIds.length > 0) {
        const { data: jobsData } = await supabase
          .from('document_processing_jobs')
          .select('status')
          .in('document_id', documentIds);
        
        (jobsData || []).forEach((job: any) => {
          if (job.status === 'completed') processingStats.completed++;
          else if (job.status === 'processing') processingStats.processing++;
          else if (job.status === 'failed') processingStats.failed++;
          else if (job.status === 'pending') processingStats.pending++;
        });
      }

      setStats({
        totalDocuments: documentsResult.count || 0,
        totalTeamMembers: membersResult.count || 0,
        documentsByType: docsByType,
        processingStats,
        recentDocuments: recentDocsResult.data || [],
        documentsLast30Days: documentsLast30DaysResult.count || 0,
        organizationName: orgData?.name || 'Sua Organização',
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard - {stats.organizationName}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Visão geral da sua organização e documentos
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.totalDocuments}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Documentos
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.totalTeamMembers}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Membros da Equipe
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">{stats.documentsLast30Days}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Documentos (últimos 30 dias)
          </p>
        </div>
      </div>

      {/* Estatísticas de Processamento */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Status de Processamento
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.processingStats.completed}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Concluídos</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <LoaderIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2 animate-spin" />
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.processingStats.processing}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Processando</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.processingStats.pending}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Pendentes</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.processingStats.failed}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Falhados</div>
          </div>
        </div>
      </div>

      {/* Documentos por Tipo */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Documentos por Tipo
        </h2>
        <div className="space-y-3">
          {Object.entries(stats.documentsByType).map(([type, count]) => {
            const total = stats.totalDocuments || 1;
            const percentage = (count / total) * 100;
            const typeLabels: Record<string, string> = {
              policy: 'Políticas',
              procedure: 'Procedimentos',
              manual: 'Manuais',
              other: 'Outros',
            };
            const typeColors: Record<string, string> = {
              policy: 'bg-blue-500',
              procedure: 'bg-green-500',
              manual: 'bg-purple-500',
              other: 'bg-gray-500',
            };
            
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{typeLabels[type] || type}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`${typeColors[type]} h-2 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/app/documents/new">
            <Button variant="outline" className="w-full justify-start h-auto py-4">
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Criar Documento</div>
                  <div className="text-xs text-slate-500">Novo documento do zero</div>
                </div>
              </div>
            </Button>
          </Link>
          <Link href="/app/documents">
            <Button variant="outline" className="w-full justify-start h-auto py-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Gerenciar Documentos</div>
                  <div className="text-xs text-slate-500">Criar, editar e organizar</div>
                </div>
              </div>
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" className="w-full justify-start h-auto py-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Visualizar Documentação</div>
                  <div className="text-xs text-slate-500">Ler documentação publicada</div>
                </div>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Documentos Recentes */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Documentos Recentes</h2>
          <Link href="/app/documents">
            <Button variant="none" size="sm" className="text-primary">
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        {stats.recentDocuments.length > 0 ? (
          <div className="space-y-3">
            {stats.recentDocuments.map((doc) => (
              <Link
                key={doc.id}
                href={`/app/documents/${doc.id}/edit`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="font-medium group-hover:text-primary transition-colors">
                      {doc.title}
                    </div>
                    <div className="text-xs text-slate-500">{doc.path}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum documento ainda</p>
            <Link href="/app/documents/new">
              <Button variant="primary" size="sm" className="mt-4">
                Criar primeiro documento
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

