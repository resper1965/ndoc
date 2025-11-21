'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Tabs, TabsList, Tab, TabsContent } from '@/components/tabs';
import { Lock, Sparkles, Code, Shield } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';
import { AIConfigSection } from '@/components/ai-config-section';
import { TemplateManagementSection } from '@/components/template-management-section';
import { SuperAdminSection } from '@/components/super-admin-section';

export default function SettingsPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    updatedAt: null as string | null,
    isDefaultPassword: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
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
          isDefaultPassword: data.isDefaultPassword || false,
        });
        setFormData((prev) => ({ ...prev, newUsername: data.username }));
      }
    } catch {
      showError('Erro ao carregar credenciais');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      showError('As senhas não coincidem');
      setSaving(false);
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 3) {
      showError('A senha deve ter pelo menos 3 caracteres');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/config/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          username: formData.newUsername || undefined,
          password: formData.newPassword || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar credenciais');
      }

      showSuccess('Credenciais atualizadas com sucesso!');
      setFormData({
        currentPassword: '',
        newUsername: credentials.username,
        newPassword: '',
        confirmPassword: '',
      });
      loadCredentials();
    } catch (error: any) {
      showError(error.message || 'Erro ao atualizar credenciais');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Configurações</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gerencie credenciais, IA, templates e configurações do sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <Tab value="credentials">
            <Lock className="h-4 w-4 mr-2" />
            Credenciais
          </Tab>
          <Tab value="templates">
            <Code className="h-4 w-4 mr-2" />
            Templates
          </Tab>
          <Tab value="ai">
            <Sparkles className="h-4 w-4 mr-2" />
            Inteligência Artificial
          </Tab>
          <Tab value="admin">
            <Shield className="h-4 w-4 mr-2" />
            Administração
          </Tab>
        </TabsList>

        <TabsContent value="credentials" className="mt-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha Atual *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
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
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    placeholder="Confirme a nova senha"
                    className="mt-1"
                    autoComplete="new-password"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplateManagementSection />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AIConfigSection />
        </TabsContent>

        <TabsContent value="admin" className="mt-6">
          <SuperAdminSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

