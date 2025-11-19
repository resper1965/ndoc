'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { showSuccess, showError } from '@/lib/toast';
import { Check, ChevronRight, ChevronLeft, Sparkles, Users } from 'lucide-react';
import { getDisplayName } from '../../../config/branding';
import { BrandingText } from '@/components/branding-text';

type Step = 1 | 2;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [organizationData, setOrganizationData] = useState<any>(null);

  // Step 1: Organization details
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');

  // Carregar progresso salvo do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding_progress');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setOrgName(data.orgName || '');
          setOrgSlug(data.orgSlug || '');
          setCurrentStep(data.step || 1);
        } catch {
          // Ignorar erros de parsing
        }
      }
    }
  }, []);

  // Salvar progresso no localStorage
  const saveProgress = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_progress', JSON.stringify({
        orgName,
        orgSlug,
        step: currentStep,
      }));
    }
  };

  // Auto-gerar slug a partir do nome
  useEffect(() => {
    if (orgName && !orgSlug) {
      const generated = orgName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setOrgSlug(generated);
    }
  }, [orgName, orgSlug]);

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch organization on mount
  useEffect(() => {
    if (user) {
      fetchOrganization();
    }
  }, [user]);

  const fetchOrganization = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          organizations (
            id,
            name,
            slug
          )
        `)
        .eq('user_id', user?.id)
        .limit(1)
        .single();

      if (data && data.organizations) {
        const org = Array.isArray(data.organizations) ? data.organizations[0] : data.organizations;
        if (org) {
          setOrganizationData(org);
          setOrgName(org.name);
          setOrgSlug(org.slug);
        }
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
      saveProgress();
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      saveProgress();
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSkip = () => {
    // Limpar progresso salvo
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding_progress');
    }
    router.push('/docs');
  };

  const handleFinish = () => {
    // Limpar progresso salvo
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding_progress');
    }
    showSuccess('Onboarding concluído! Bem-vindo ao ' + getDisplayName());
    router.push('/docs');
  };

  const handleUpdateOrganization = async () => {
    if (!orgName || !orgSlug) {
      showError('Preencha o nome e o slug da organização');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      
      // Se não há organização, criar uma nova
      if (!organizationData || !organizationData.id) {
        const response = await fetch('/api/organization/create', {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao criar organização');
        }

        const result = await response.json();
        const newOrgId = result.organization_id || result.id;

        // Atualizar a organização recém-criada
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            name: orgName,
            slug: orgSlug,
          })
          .eq('id', newOrgId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        showSuccess('Organização criada com sucesso!');
      } else {
        // Atualizar organização existente
        const { error } = await supabase
          .from('organizations')
          .update({
            name: orgName,
            slug: orgSlug,
          })
          .eq('id', organizationData.id);

        if (error) {
          throw new Error(error.message);
        }

        showSuccess('Organização atualizada!');
      }

      saveProgress();
      handleFinish();
    } catch (error: any) {
      console.error('Erro ao salvar organização:', error);
      showError('Erro ao salvar organização: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Bem-vindo', icon: Sparkles },
    { number: 2, title: 'Organização', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-primary-600 text-white scale-110'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="text-center">
                <Sparkles className="w-16 h-16 mx-auto text-primary-600 mb-4" />
                <h1 className="text-3xl font-bold mb-4">Bem-vindo ao <BrandingText className="text-3xl" />!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Vamos configurar sua organização em apenas um passo rápido.
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-8 text-left">
                  <h2 className="font-semibold mb-4">O que você vai fazer:</h2>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Personalizar o nome da sua organização</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Começar a criar documentação imediatamente</span>
                    </li>
                  </ul>
                </div>
                <Button onClick={handleNext} size="lg" className="px-8">
                  Começar
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <button
                  onClick={handleSkip}
                  className="block mx-auto mt-4 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Pular e ir direto para o app
                </button>
              </div>
            )}

            {/* Step 2: Organization */}
            {currentStep === 2 && (
              <div>
                <Users className="w-16 h-16 mx-auto text-primary-600 mb-4" />
                <h1 className="text-3xl font-bold mb-4 text-center">Configure sua Organização</h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                  Personalize o nome da sua organização. Você pode criar documentos depois.
                </p>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="orgName">Nome da Organização *</Label>
                    <Input
                      id="orgName"
                      type="text"
                      value={orgName}
                      onChange={(e) => {
                        setOrgName(e.target.value);
                        saveProgress();
                      }}
                      placeholder="Minha Empresa"
                      className="mt-2"
                      autoFocus
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Este nome será exibido em toda a plataforma.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="orgSlug">URL da Organização (Slug)</Label>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">ndocs.com/</span>
                        <Input
                          id="orgSlug"
                          type="text"
                          value={orgSlug}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                            setOrgSlug(value);
                            saveProgress();
                          }}
                          placeholder="minha-empresa"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Gerado automaticamente a partir do nome. Você pode editar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button onClick={handlePrev} variant="outline" className="flex-1">
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleUpdateOrganization}
                    disabled={!orgName || !orgSlug || loading}
                    className="flex-1"
                  >
                    {loading ? 'Salvando...' : 'Finalizar'}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
                
                <button
                  onClick={handleSkip}
                  className="block mx-auto mt-4 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Pular e configurar depois
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
