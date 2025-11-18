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
  BookOpen
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface DashboardStats {
  totalDocuments: number;
  totalTeamMembers: number;
  recentDocuments: Array<{
    id: string;
    title: string;
    path: string;
    updated_at: string;
  }>;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalTeamMembers: 0,
    recentDocuments: [],
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

      // Buscar estatísticas
      const [documentsResult, membersResult, recentDocsResult] = await Promise.all([
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
      ]);

      setStats({
        totalDocuments: documentsResult.count || 0,
        totalTeamMembers: membersResult.count || 0,
        recentDocuments: recentDocsResult.data || [],
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
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
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
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">100%</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Documentação Atualizada
          </p>
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
                  <div className="font-medium">Ver Documentos</div>
                  <div className="text-xs text-slate-500">Gerenciar documentos</div>
                </div>
              </div>
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" className="w-full justify-start h-auto py-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Ver Documentação</div>
                  <div className="text-xs text-slate-500">Acessar docs publicados</div>
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

