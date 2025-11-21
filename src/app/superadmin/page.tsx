/**
 * Dashboard do Superadmin
 * Painel de onboarding de clientes e gestão de organizações
 */

'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { showSuccess, showError } from '@/lib/toast';
import {
  Plus,
  Building2,
  Users,
  FileText,
  TrendingUp,
  Search,
  ChevronRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/dialog';
import Link from 'next/link';

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  subscriptions: Array<{
    status: string;
    plans: {
      name: string;
      slug: string;
    };
  }>;
  organization_members: Array<{ count: number }>;
  documents: Array<{ count: number }>;
}

interface DashboardStats {
  total_organizations: number;
  total_users: number;
  total_documents: number;
  active_subscriptions: number;
}

export default function SuperadminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_organizations: 0,
    total_users: 0,
    total_documents: 0,
    active_subscriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Wizard form state
  const [wizardData, setWizardData] = useState({
    organization: {
      name: '',
      slug: '',
      cnpj: '',
      language: 'pt-BR' as 'pt-BR' | 'en-US' | 'es-ES',
    },
    plan_slug: 'free' as 'free' | 'starter' | 'professional' | 'enterprise',
    org_admin: {
      name: '',
      email: '',
      password: '',
      send_welcome_email: true,
    },
    initial_users: [] as Array<{
      name: string;
      email: string;
      role: 'admin' | 'editor' | 'viewer';
    }>,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/superadmin/onboarding');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setOrganizations(data.organizations || []);

      // Calcular stats
      const totalOrgs = data.organizations.length;
      const totalUsers = data.organizations.reduce(
        (sum: number, org: Organization) =>
          sum + (org.organization_members[0]?.count || 0),
        0
      );
      const totalDocs = data.organizations.reduce(
        (sum: number, org: Organization) =>
          sum + (org.documents[0]?.count || 0),
        0
      );
      const activeSubsCount = data.organizations.filter(
        (org: Organization) => org.subscriptions[0]?.status === 'active'
      ).length;

      setStats({
        total_organizations: totalOrgs,
        total_users: totalUsers,
        total_documents: totalDocs,
        active_subscriptions: activeSubsCount,
      });
    } catch (error) {
      showError('Erro ao carregar dados do dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setWizardData({
      ...wizardData,
      organization: {
        ...wizardData.organization,
        name,
        slug,
      },
    });
  };

  const handleSubmitOnboarding = async () => {
    try {
      const response = await fetch('/api/superadmin/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wizardData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar organização');
      }

      showSuccess(
        `Organização "${result.organization.name}" criada com sucesso!`
      );
      setShowOnboardingWizard(false);
      setCurrentStep(1);
      setWizardData({
        organization: { name: '', slug: '', cnpj: '', language: 'pt-BR' },
        plan_slug: 'free',
        org_admin: {
          name: '',
          email: '',
          password: '',
          send_welcome_email: true,
        },
        initial_users: [],
      });

      // Recarregar dados
      loadDashboardData();
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Erro ao criar organização'
      );
      console.error(error);
    }
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AuthGuard requireSuperadmin>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Carregando dashboard...
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireSuperadmin>
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard Superadmin
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Gerencie organizações e onboarding de clientes
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowOnboardingWizard(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Nova Organização
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Organizações
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.total_organizations}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Usuários
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.total_users}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Documentos
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.total_documents}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Assinaturas Ativas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.active_subscriptions}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar organização por nome ou slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Organizations List */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Organizações ({filteredOrganizations.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredOrganizations.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchTerm
                      ? 'Nenhuma organização encontrada'
                      : 'Nenhuma organização criada ainda'}
                  </p>
                </div>
              ) : (
                filteredOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {org.name}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                            {org.subscriptions[0]?.plans?.name || 'Free'}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              org.subscriptions[0]?.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                            }`}
                          >
                            {org.subscriptions[0]?.status || 'inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span>Slug: {org.slug}</span>
                          <span>•</span>
                          <span>
                            {org.organization_members[0]?.count || 0} usuários
                          </span>
                          <span>•</span>
                          <span>{org.documents[0]?.count || 0} documentos</span>
                          <span>•</span>
                          <span>
                            Criada em{' '}
                            {new Date(org.created_at).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </div>
                      </div>
                      <Link href={`/superadmin/organizations/${org.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-2"
                        >
                          Gerenciar
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Onboarding Wizard Dialog */}
        {showOnboardingWizard && (
          <OnboardingWizard
            open={showOnboardingWizard}
            onClose={() => {
              setShowOnboardingWizard(false);
              setCurrentStep(1);
            }}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            wizardData={wizardData}
            setWizardData={setWizardData}
            handleOrgNameChange={handleOrgNameChange}
            handleSubmit={handleSubmitOnboarding}
          />
        )}
      </div>
    </AuthGuard>
  );
}

// Wizard Component (componentizado para melhor organização)
function OnboardingWizard({
  open,
  onClose,
  currentStep,
  setCurrentStep,
  wizardData,
  setWizardData,
  handleOrgNameChange,
  handleSubmit,
}: any) {
  const steps = [
    { number: 1, title: 'Dados da Organização' },
    { number: 2, title: 'Escolher Plano' },
    { number: 3, title: 'Criar Org-Admin' },
    { number: 4, title: 'Usuários Iniciais' },
  ];

  const plans = [
    {
      slug: 'free',
      name: 'Free',
      price: 'R$ 0/mês',
      limits: '1 usuário, 10 docs',
      features: ['Básico', 'Sem IA'],
    },
    {
      slug: 'starter',
      name: 'Starter',
      price: 'R$ 49/mês',
      limits: '5 usuários, 100 docs',
      features: ['IA inclusa', '100 req/mês'],
    },
    {
      slug: 'professional',
      name: 'Professional',
      price: 'R$ 149/mês',
      limits: '20 usuários, ∞ docs',
      features: ['IA avançada', '1000 req/mês', 'Branding'],
    },
    {
      slug: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      limits: 'Ilimitado',
      features: ['Tudo incluso', 'Suporte prioritário'],
    },
  ];

  return (
    <Dialog open={open} setOpen={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboarding de Nova Organização</DialogTitle>
          <DialogDescription>
            Wizard em 4 etapas para criar uma nova organização
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.number
                      ? 'bg-primary text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.number
                      ? 'text-gray-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded ${
                    currentStep > step.number
                      ? 'bg-primary'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="org-name">Nome da Organização *</Label>
                <Input
                  id="org-name"
                  value={wizardData.organization.name}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <Label htmlFor="org-slug">Slug *</Label>
                <Input
                  id="org-slug"
                  value={wizardData.organization.slug}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      organization: {
                        ...wizardData.organization,
                        slug: e.target.value,
                      },
                    })
                  }
                  placeholder="acme-corp"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Será usado na URL: ndocs.com/{wizardData.organization.slug}
                </p>
              </div>

              <div>
                <Label htmlFor="org-cnpj">CNPJ (opcional)</Label>
                <Input
                  id="org-cnpj"
                  value={wizardData.organization.cnpj}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      organization: {
                        ...wizardData.organization,
                        cnpj: e.target.value,
                      },
                    })
                  }
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <Label htmlFor="org-language">Idioma</Label>
                <select
                  id="org-language"
                  value={wizardData.organization.language}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      organization: {
                        ...wizardData.organization,
                        language: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="pt-BR">Português (BR)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-4">
              {plans.map((plan) => (
                <button
                  key={plan.slug}
                  onClick={() =>
                    setWizardData({
                      ...wizardData,
                      plan_slug: plan.slug as any,
                    })
                  }
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    wizardData.plan_slug === plan.slug
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-2">
                    {plan.price}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {plan.limits}
                  </p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-name">Nome do Administrador *</Label>
                <Input
                  id="admin-name"
                  value={wizardData.org_admin.name}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      org_admin: {
                        ...wizardData.org_admin,
                        name: e.target.value,
                      },
                    })
                  }
                  placeholder="João Silva"
                />
              </div>

              <div>
                <Label htmlFor="admin-email">Email *</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={wizardData.org_admin.email}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      org_admin: {
                        ...wizardData.org_admin,
                        email: e.target.value,
                      },
                    })
                  }
                  placeholder="joao@acme.com"
                />
              </div>

              <div>
                <Label htmlFor="admin-password">
                  Senha Temporária (ou deixe vazio para enviar convite)
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={wizardData.org_admin.password}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      org_admin: {
                        ...wizardData.org_admin,
                        password: e.target.value,
                      },
                    })
                  }
                  placeholder="Senha123"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="send-email"
                  checked={wizardData.org_admin.send_welcome_email}
                  onChange={(e) =>
                    setWizardData({
                      ...wizardData,
                      org_admin: {
                        ...wizardData.org_admin,
                        send_welcome_email: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="send-email">Enviar email de boas-vindas</Label>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Adicionar usuários iniciais é opcional. Você pode pular esta
                etapa e o Org-Admin poderá adicionar usuários depois.
              </p>

              {wizardData.initial_users.map((user: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="Nome"
                      value={user.name}
                      onChange={(e) => {
                        const updated = [...wizardData.initial_users];
                        updated[index].name = e.target.value;
                        setWizardData({
                          ...wizardData,
                          initial_users: updated,
                        });
                      }}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={user.email}
                      onChange={(e) => {
                        const updated = [...wizardData.initial_users];
                        updated[index].email = e.target.value;
                        setWizardData({
                          ...wizardData,
                          initial_users: updated,
                        });
                      }}
                    />
                    <select
                      value={user.role}
                      onChange={(e) => {
                        const updated = [...wizardData.initial_users];
                        updated[index].role = e.target.value as any;
                        setWizardData({
                          ...wizardData,
                          initial_users: updated,
                        });
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const updated = wizardData.initial_users.filter(
                        (_: any, i: number) => i !== index
                      );
                      setWizardData({ ...wizardData, initial_users: updated });
                    }}
                  >
                    Remover
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => {
                  setWizardData({
                    ...wizardData,
                    initial_users: [
                      ...wizardData.initial_users,
                      { name: '', email: '', role: 'viewer' },
                    ],
                  });
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Usuário
              </Button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
          >
            Voltar
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            {currentStep < 4 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !wizardData.organization.name) ||
                  (currentStep === 3 && !wizardData.org_admin.email)
                }
              >
                Próximo
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit}>
                Criar Organização
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
