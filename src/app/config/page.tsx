'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to avoid SSR issues with hooks
export const dynamic = 'force-dynamic';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import {
  X,
  AlertCircle,
  Lock,
  FileText,
  Sparkles,
  Users,
  Shield,
  Code,
  Home,
} from 'lucide-react';
import { Tabs, TabsList, Tab, TabsContent } from '@/components/tabs';
import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';
import { BrandingText } from '@/components/branding-text';
import { getDisplayLogo } from '../../../config/branding';
import Image from 'next/image';
import { showSuccess, showError } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { UserManagementSection } from '@/components/user-management-section';
import { SuperAdminSection } from '@/components/super-admin-section';
import { AIConfigSection } from '@/components/ai-config-section';
import { TemplateManagementSection } from '@/components/template-management-section';

export default function ConfigPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    updatedAt: null as string | null,
    isDefaultPassword: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [activeTab, setActiveTab] = useState('credentials');

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const response = await fetch('/api/config/credentials');
      if (response.ok) {
        const data = await response.json();
        setCredentials({
          username: data.username,
          updatedAt: data.updatedAt || null,
          isDefaultPassword: data.isDefaultPassword || false,
        });
        setFormData((prev) => ({ ...prev, newUsername: data.username }));

        // Mostrar aviso se senha padrão ainda estiver em uso
        if (data.isDefaultPassword && !data.updatedAt) {
          setShowPasswordWarning(true);
        }
      }
    } catch (error) {
      logger.error('Error loading credentials', error);
      showError('Erro ao carregar credenciais');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Validation
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setSaving(false);
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 3) {
      setMessage({
        type: 'error',
        text: 'A senha deve ter pelo menos 3 caracteres',
      });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/config/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          username: formData.newUsername || undefined,
          password: formData.newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Credenciais atualizadas com sucesso!');
        setMessage({
          type: 'success',
          text: 'Credenciais atualizadas com sucesso!',
        });
        setFormData({
          currentPassword: '',
          newUsername: data.username,
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordWarning(false); // Esconder aviso após troca de senha
        await loadCredentials();
      } else {
        const errorMsg = data.error || 'Erro ao atualizar credenciais';
        showError(errorMsg);
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao atualizar credenciais' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header com Navegação */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {getDisplayLogo() ? (
                  <Image
                    alt="logo"
                    className="h-8 w-auto dark:invert"
                    width={32}
                    height={32}
                    src={getDisplayLogo()!}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <BrandingText className="text-lg" />
              </Link>
              <nav className="hidden md:flex items-center gap-1 ml-6">
                <Link href="/">
                  <Button
                    variant="none"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Início
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button
                    variant="none"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Documentos
                  </Button>
                </Link>
                <Button
                  variant="none"
                  size="sm"
                  className="flex items-center gap-2 bg-primary/10 text-primary"
                >
                  <Shield className="h-4 w-4" />
                  Configurações
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold mb-2">
            Configurações
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gerencie credenciais, documentos, IA, usuários e configurações do
            sistema
          </p>
        </div>

        {/* Aviso de Senha Padrão */}
        {showPasswordWarning && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Senha Padrão em Uso
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Você está usando a senha padrão <strong>admin</strong>. Por
                  segurança, é altamente recomendado alterá-la imediatamente.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setShowPasswordWarning(false);
                    setActiveTab('credentials');
                  }}
                >
                  Alterar Senha Agora
                </Button>
              </div>
              <button
                onClick={() => setShowPasswordWarning(false)}
                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                aria-label="Fechar aviso"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          type="underline"
          className="w-full"
        >
          <TabsList className="w-full justify-start mb-6 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg">
            <Tab value="credentials" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Credenciais
            </Tab>
            <Tab value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </Tab>
            <Tab value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Inteligência Artificial
            </Tab>
            <Tab value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </Tab>
            <Tab value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Administração
            </Tab>
            <Tab value="api" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API
            </Tab>
          </TabsList>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-semibold mb-2">
                  Credenciais de Acesso
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Gerencie seu usuário e senha de acesso ao sistema
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-6">
                <div className="mb-4">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Usuário Atual
                  </Label>
                  <div className="mt-1 text-lg font-medium">
                    {credentials.username}
                  </div>
                </div>
                {credentials.updatedAt && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Última Atualização
                    </Label>
                    <div className="mt-1 text-sm text-slate-500">
                      {new Date(credentials.updatedAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                )}
              </div>

              <form
                id="credentials-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="currentPassword">Senha Atual *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    placeholder="Digite sua senha atual"
                    className="mt-1"
                    autoComplete="current-password"
                  />
                </div>

                <div>
                  <Label htmlFor="newUsername">Novo Usuário</Label>
                  <Input
                    id="newUsername"
                    type="text"
                    value={formData.newUsername}
                    onChange={(e) =>
                      setFormData({ ...formData, newUsername: e.target.value })
                    }
                    placeholder="Deixe em branco para manter o atual"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    placeholder="Deixe em branco para manter a atual"
                    className="mt-1"
                    autoComplete="new-password"
                  />
                </div>

                {formData.newPassword && (
                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirmar Nova Senha
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirme a nova senha"
                      className="mt-1"
                      autoComplete="new-password"
                    />
                  </div>
                )}

                {message && (
                  <div
                    className={`p-4 rounded-lg ${
                      message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <Button type="submit" disabled={saving} variant="primary">
                  {saving ? 'Salvando...' : 'Atualizar Credenciais'}
                </Button>
              </form>
            </section>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-semibold mb-2">
                  Gerenciamento de Templates
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Gerencie templates para Políticas, Procedimentos e Manuais.
                  Templates padrão estão disponíveis automaticamente.
                </p>
              </div>
              <TemplateManagementSection />
            </section>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="space-y-6">
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-semibold mb-2">
                  Configuração de IA
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Configure temas e provedores de IA para geração e melhoria de
                  documentos
                </p>
              </div>
              <AIConfigSection />
            </section>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-semibold mb-2">
                  Gerenciamento de Usuários
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Gerencie membros da organização e permissões
                </p>
              </div>
              <UserManagementSection />
            </section>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6">
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-semibold mb-2">
                  Administração
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Funcionalidades avançadas para super administradores
                </p>
              </div>
              <SuperAdminSection />
            </section>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-semibold mb-2">
                  API de Ingestão
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Use a API REST para gerenciar documentos programaticamente
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      POST /api/ingest
                    </Label>
                    <p className="text-xs text-slate-500">
                      Criar ou atualizar documento
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      PUT /api/ingest
                    </Label>
                    <p className="text-xs text-slate-500">
                      Atualizar documento
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      DELETE /api/ingest
                    </Label>
                    <p className="text-xs text-slate-500">Deletar documento</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      GET /api/ingest?list=true
                    </Label>
                    <p className="text-xs text-slate-500">
                      Listar todos os documentos
                    </p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-sm font-medium">
                      GET /api/ingest?path=xxx
                    </Label>
                    <p className="text-xs text-slate-500">
                      Obter conteúdo de um documento
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open('/api/ingest-docs', '_blank')}
                >
                  Ver Documentação Completa da API
                </Button>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
