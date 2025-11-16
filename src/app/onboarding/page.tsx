'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { showSuccess, showError } from '@/lib/toast';
import { Check, ChevronRight, ChevronLeft, Sparkles, Users, FileText } from 'lucide-react';
import { getDisplayName } from '../../../config/branding';

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [organizationData, setOrganizationData] = useState<any>(null);

  // Step 1: Organization details
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');

  // Step 2: First document
  const [docTitle, setDocTitle] = useState('');
  const [docPath, setDocPath] = useState('');

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
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSkip = () => {
    router.push('/docs');
  };

  const handleFinish = () => {
    showSuccess('Onboarding concluído! Bem-vindo ao ' + getDisplayName());
    router.push('/docs');
  };

  const handleUpdateOrganization = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgName,
          slug: orgSlug,
        })
        .eq('id', organizationData.id);

      if (error) {
        showError('Erro ao atualizar organização: ' + error.message);
      } else {
        showSuccess('Organização atualizada!');
        handleNext();
      }
    } catch {
      showError('Erro ao atualizar organização');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFirstDocument = async () => {
    setLoading(true);
    try {
      const content = `---
title: ${docTitle}
description: Meu primeiro documento
---

# ${docTitle}

Bem-vindo ao ${getDisplayName()}! Este é seu primeiro documento.

## Próximos Passos

- Edite este documento
- Crie novos documentos
- Convide sua equipe
- Explore recursos de IA

Divirta-se documentando!
`;

      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: docPath,
          content: content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        showError(data.error || 'Erro ao criar documento');
      } else {
        showSuccess('Primeiro documento criado!');
        handleNext();
      }
    } catch {
      showError('Erro ao criar documento');
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
    { number: 3, title: 'Primeiro Documento', icon: FileText },
    { number: 4, title: 'Concluído', icon: Check },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
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
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="text-center">
                <Sparkles className="w-16 h-16 mx-auto text-primary-600 mb-4" />
                <h1 className="text-3xl font-bold mb-4">Bem-vindo ao {getDisplayName()}!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Vamos configurar sua conta em apenas alguns passos rápidos.
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-8">
                  <h2 className="font-semibold mb-4">O que você vai configurar:</h2>
                  <ul className="text-left space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <span>Personalizar sua organização</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <span>Criar seu primeiro documento</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <span>Aprender sobre os recursos</span>
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
                  Personalize os detalhes da sua organização.
                </p>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="orgName">Nome da Organização</Label>
                    <Input
                      id="orgName"
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Minha Empresa"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Este nome será exibido em toda a plataforma.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="orgSlug">Slug da Organização</Label>
                    <Input
                      id="orgSlug"
                      type="text"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value.toLowerCase())}
                      placeholder="minha-empresa"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      URL amigável para sua organização (apenas letras minúsculas, números e hífens).
                    </p>
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
                    {loading ? 'Salvando...' : 'Continuar'}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: First Document */}
            {currentStep === 3 && (
              <div>
                <FileText className="w-16 h-16 mx-auto text-primary-600 mb-4" />
                <h1 className="text-3xl font-bold mb-4 text-center">Crie seu Primeiro Documento</h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                  Vamos criar um documento de exemplo para você começar.
                </p>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="docTitle">Título do Documento</Label>
                    <Input
                      id="docTitle"
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="Bem-vindo à Documentação"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="docPath">Caminho do Documento</Label>
                    <Input
                      id="docPath"
                      type="text"
                      value={docPath}
                      onChange={(e) => setDocPath(e.target.value.toLowerCase())}
                      placeholder="inicio/bem-vindo"
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Defina onde este documento aparecerá na navegação.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button onClick={handlePrev} variant="outline" className="flex-1">
                    <ChevronLeft className="mr-2 w-5 h-5" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleCreateFirstDocument}
                    disabled={!docTitle || !docPath || loading}
                    className="flex-1"
                  >
                    {loading ? 'Criando...' : 'Criar Documento'}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>

                <button
                  onClick={handleNext}
                  className="block mx-auto mt-4 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Pular esta etapa
                </button>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Tudo Pronto!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Sua conta está configurada e você está pronto para começar.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-8">
                  <h2 className="font-semibold mb-4">Próximos Passos:</h2>
                  <ul className="text-left space-y-3">
                    <li className="flex items-start">
                      <FileText className="w-5 h-5 text-primary-600 mr-2 mt-0.5" />
                      <span>Crie mais documentos e organize sua documentação</span>
                    </li>
                    <li className="flex items-start">
                      <Users className="w-5 h-5 text-primary-600 mr-2 mt-0.5" />
                      <span>Convide sua equipe para colaborar</span>
                    </li>
                    <li className="flex items-start">
                      <Sparkles className="w-5 h-5 text-primary-600 mr-2 mt-0.5" />
                      <span>Experimente os recursos de IA para gerar e melhorar conteúdo</span>
                    </li>
                  </ul>
                </div>

                <Button onClick={handleFinish} size="lg" className="px-8">
                  Ir para a Documentação
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
