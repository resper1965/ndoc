import { createClient } from '@/lib/supabase/server';
import { getUserOrganization } from '@/lib/supabase/utils';
import Link from 'next/link';
import {
  FileText,
  Users,
  HardDrive,
  Sparkles,
  Plus,
  Upload,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from '@/components/button';

export const dynamic = 'force-dynamic';

// Componente de Card de Métrica
function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  max,
  color = 'primary'
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: string;
  max?: number | string;
  color?: 'primary' | 'green' | 'blue' | 'purple';
}) {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {value}
          {max && <span className="text-sm font-normal text-slate-500">/{max}</span>}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{title}</p>
      </div>
    </div>
  );
}

// Componente de Ação Rápida
function QuickAction({
  href,
  icon: Icon,
  title,
  description
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all group"
    >
      <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
    </Link>
  );
}

// Componente de Documento Recente
function RecentDocumentCard({
  title,
  path,
  updatedAt,
  status
}: {
  title: string;
  path: string;
  updatedAt: string;
  status: string;
}) {
  return (
    <Link
      href={`/docs/${path}`}
      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(updatedAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
      <span className={`
        text-xs px-2 py-1 rounded-full
        ${status === 'published'
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        }
      `}>
        {status === 'published' ? 'Publicado' : 'Rascunho'}
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const organizationId = await getUserOrganization();

  // Buscar métricas
  let documentCount = 0;
  let memberCount = 0;
  let recentDocuments: any[] = [];

  if (organizationId) {
    // Contar documentos
    const { count: docCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);
    documentCount = docCount || 0;

    // Contar membros
    const { count: memCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);
    memberCount = memCount || 0;

    // Buscar documentos recentes
    const { data: docs } = await supabase
      .from('documents')
      .select('id, title, path, updated_at, status')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false })
      .limit(5);
    recentDocuments = docs || [];
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Visão geral da sua documentação
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Documentos"
          value={documentCount}
          icon={FileText}
          color="primary"
        />
        <MetricCard
          title="Membros da Equipe"
          value={memberCount}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Armazenamento"
          value="--"
          max="10 GB"
          icon={HardDrive}
          color="green"
        />
        <MetricCard
          title="Uso de IA"
          value="--"
          max="500"
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            href="/app/documents/new"
            icon={Plus}
            title="Novo Documento"
            description="Criar do zero"
          />
          <QuickAction
            href="/app/documents/new?mode=upload"
            icon={Upload}
            title="Fazer Upload"
            description="PDF, DOCX, MD"
          />
          <QuickAction
            href="/app/documents/new?mode=ai"
            icon={Sparkles}
            title="Gerar com IA"
            description="Usar templates"
          />
          <QuickAction
            href="/app/team"
            icon={UserPlus}
            title="Convidar Membro"
            description="Adicionar à equipe"
          />
        </div>
      </div>

      {/* Documentos Recentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Documentos Recentes
          </h2>
          <Link href="/app/documents">
            <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400">
              Ver todos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {recentDocuments.length > 0 ? (
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <RecentDocumentCard
                key={doc.id}
                title={doc.title}
                path={doc.path}
                updatedAt={doc.updated_at}
                status={doc.status}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Nenhum documento ainda
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Comece criando seu primeiro documento
            </p>
            <Link href="/app/documents/new">
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Criar Documento
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
