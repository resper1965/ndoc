'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, Tab, TabsContent } from '@/components/tabs';
import { Lock, Sparkles, FileText, Code } from 'lucide-react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { AIConfigSection } from '@/components/ai-config-section';
import { TemplateManagementSection } from '@/components/template-management-section';
import { showSuccess, showError } from '@/lib/toast';
import { logger } from '@/lib/logger';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('credentials');
  const [credentials, setCredentials] = useState({
    username: '',
    updatedAt: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
        });
      }
    } catch (error) {
      logger.error('Error loading credentials', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (formData.newPassword !== formData.confirmPassword) {
      showError('As senhas não coincidem');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/config/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          password: formData.newPassword || undefined,
        }),
      });

      if (response.ok) {
        showSuccess('Credenciais atualizadas!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        await loadCredentials();
      } else {
        const data = await response.json();
        showError(data.error || 'Erro ao atualizar credenciais');
      }
    } catch {
      showError('Erro ao atualizar credenciais');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Configurações</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Gerencie suas credenciais, IA e templates
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} type="underline">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <Tab value="credentials" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Credenciais
          </Tab>
          <Tab value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Inteligência Artificial
          </Tab>
          <Tab value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Tab>
          <Tab value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API
          </Tab>
        </TabsList>

        {/* Credentials Tab */}
        <TabsContent value="credentials">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Credenciais de Acesso</h2>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Usuário:</strong> {credentials.username}
              </p>
              {credentials.updatedAt && (
                <p className="text-sm text-slate-500 mt-1">
                  Última atualização: {new Date(credentials.updatedAt).toLocaleString('pt-BR')}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="currentPassword">Senha Atual *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="mt-1"
                />
              </div>
              {formData.newPassword && (
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="mt-1"
                  />
                </div>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Atualizar Credenciais'}
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Configuração de IA</h2>
            <AIConfigSection />
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Gerenciamento de Templates</h2>
            <TemplateManagementSection />
          </div>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold mb-4">API de Ingestão</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Use a API REST para gerenciar documentos programaticamente
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <code className="text-sm font-medium">POST /api/ingest</code>
                <p className="text-xs text-slate-500 mt-1">Criar documento</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <code className="text-sm font-medium">PUT /api/ingest</code>
                <p className="text-xs text-slate-500 mt-1">Atualizar documento</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <code className="text-sm font-medium">DELETE /api/ingest</code>
                <p className="text-xs text-slate-500 mt-1">Deletar documento</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <code className="text-sm font-medium">GET /api/ingest?list=true</code>
                <p className="text-xs text-slate-500 mt-1">Listar documentos</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
