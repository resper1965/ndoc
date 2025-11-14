'use client';

/**
 * AI Configuration Section
 * 
 * Interface para gerenciar temas e provedores de IA
 */

import { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Plus, Trash2, Edit, Save, Sparkles } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';

interface AITheme {
  id?: string;
  name: string;
  description: string;
  system_prompt: string;
  organization_id?: string;
}

interface AIProvider {
  id?: string;
  provider: 'openai' | 'anthropic';
  api_key: string;
  model: string;
  organization_id?: string;
}

export function AIConfigSection() {
  const [themes, setThemes] = useState<AITheme[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [editingTheme, setEditingTheme] = useState<AITheme | null>(null);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);

  const [themeForm, setThemeForm] = useState<AITheme>({
    name: '',
    description: '',
    system_prompt: '',
  });

  const [providerForm, setProviderForm] = useState<AIProvider>({
    provider: 'openai',
    api_key: '',
    model: 'gpt-4',
  });

  useEffect(() => {
    loadAIConfig();
  }, []);

  const loadAIConfig = async () => {
    setLoading(true);
    try {
      const [themesRes, providersRes] = await Promise.all([
        fetch('/api/ai/themes'),
        fetch('/api/ai/providers'),
      ]);

      if (themesRes.ok) {
        const themesData = await themesRes.json();
        setThemes(themesData.themes || []);
      }

      if (providersRes.ok) {
        const providersData = await providersRes.json();
        setProviders(providersData.providers || []);
      }
    } catch (error) {
      logger.error('Error loading AI config', error);
      showError('Erro ao carregar configurações de IA');
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async () => {
    try {
      const url = editingTheme?.id
        ? `/api/ai/themes/${editingTheme.id}`
        : '/api/ai/themes';
      const method = editingTheme?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeForm),
      });

      if (response.ok) {
        showSuccess(editingTheme?.id ? 'Tema atualizado!' : 'Tema criado!');
        setShowThemeDialog(false);
        setEditingTheme(null);
        setThemeForm({ name: '', description: '', system_prompt: '' });
        await loadAIConfig();
      } else {
        const data = await response.json();
        showError(data.error || 'Erro ao salvar tema');
      }
    } catch (error) {
      logger.error('Error saving theme', error);
      showError('Erro ao salvar tema');
    }
  };

  const saveProvider = async () => {
    try {
      const url = editingProvider?.id
        ? `/api/ai/providers/${editingProvider.id}`
        : '/api/ai/providers';
      const method = editingProvider?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerForm),
      });

      if (response.ok) {
        showSuccess(editingProvider?.id ? 'Provedor atualizado!' : 'Provedor criado!');
        setShowProviderDialog(false);
        setEditingProvider(null);
        setProviderForm({ provider: 'openai', api_key: '', model: 'gpt-4' });
        await loadAIConfig();
      } else {
        const data = await response.json();
        showError(data.error || 'Erro ao salvar provedor');
      }
    } catch (error) {
      logger.error('Error saving provider', error);
      showError('Erro ao salvar provedor');
    }
  };

  const deleteTheme = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este tema?')) return;

    try {
      const response = await fetch(`/api/ai/themes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Tema deletado!');
        await loadAIConfig();
      } else {
        const data = await response.json();
        showError(data.error || 'Erro ao deletar tema');
      }
    } catch (error) {
      logger.error('Error deleting theme', error);
      showError('Erro ao deletar tema');
    }
  };

  const deleteProvider = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este provedor?')) return;

    try {
      const response = await fetch(`/api/ai/providers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Provedor deletado!');
        await loadAIConfig();
      } else {
        const data = await response.json();
        showError(data.error || 'Erro ao deletar provedor');
      }
    } catch (error) {
      logger.error('Error deleting provider', error);
      showError('Erro ao deletar provedor');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      {/* AI Themes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Temas de IA
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Configure temas para geração e melhoria de documentos
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTheme(null);
              setThemeForm({ name: '', description: '', system_prompt: '' });
              setShowThemeDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo Tema
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{theme.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{theme.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="none"
                    size="xs"
                    onClick={() => {
                      setEditingTheme(theme);
                      setThemeForm(theme);
                      setShowThemeDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="none"
                    size="xs"
                    onClick={() => theme.id && deleteTheme(theme.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {theme.system_prompt}
              </p>
            </div>
          ))}
        </div>

        {themes.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            Nenhum tema configurado. Crie um tema para começar.
          </p>
        )}
      </div>

      {/* AI Providers */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Provedores de IA
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Configure provedores de IA (OpenAI, Anthropic)
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingProvider(null);
              setProviderForm({ provider: 'openai', api_key: '', model: 'gpt-4' });
              setShowProviderDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo Provedor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold capitalize">{provider.provider}</h4>
                  <p className="text-sm text-slate-500 mt-1">Modelo: {provider.model}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    API Key: {provider.api_key ? '••••••••' : 'Não configurado'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="none"
                    size="xs"
                    onClick={() => {
                      setEditingProvider(provider);
                      setProviderForm(provider);
                      setShowProviderDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="none"
                    size="xs"
                    onClick={() => provider.id && deleteProvider(provider.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {providers.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            Nenhum provedor configurado. Configure um provedor para usar IA.
          </p>
        )}
      </div>

      {/* Theme Dialog */}
      <Dialog open={showThemeDialog} setOpen={setShowThemeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTheme ? 'Editar Tema' : 'Novo Tema'}
            </DialogTitle>
            <DialogDescription>
              Configure um tema para geração e melhoria de documentos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="themeName">Nome *</Label>
              <Input
                id="themeName"
                value={themeForm.name}
                onChange={(e) =>
                  setThemeForm({ ...themeForm, name: e.target.value })
                }
                placeholder="Ex: Documentação Técnica"
                required
              />
            </div>

            <div>
              <Label htmlFor="themeDescription">Descrição</Label>
              <Input
                id="themeDescription"
                value={themeForm.description}
                onChange={(e) =>
                  setThemeForm({ ...themeForm, description: e.target.value })
                }
                placeholder="Breve descrição do tema"
              />
            </div>

            <div>
              <Label htmlFor="themePrompt">System Prompt *</Label>
              <textarea
                id="themePrompt"
                value={themeForm.system_prompt}
                onChange={(e) =>
                  setThemeForm({ ...themeForm, system_prompt: e.target.value })
                }
                className="w-full h-48 p-2 text-sm font-mono bg-white dark:bg-slate-800 border rounded"
                placeholder="Instruções para a IA sobre como gerar/melhorar documentos neste tema..."
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowThemeDialog(false);
                setEditingTheme(null);
                setThemeForm({ name: '', description: '', system_prompt: '' });
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={saveTheme}
              disabled={!themeForm.name || !themeForm.system_prompt}
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Provider Dialog */}
      <Dialog open={showProviderDialog} setOpen={setShowProviderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProvider ? 'Editar Provedor' : 'Novo Provedor'}
            </DialogTitle>
            <DialogDescription>
              Configure um provedor de IA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="providerType">Provedor *</Label>
              <select
                id="providerType"
                value={providerForm.provider}
                onChange={(e) =>
                  setProviderForm({
                    ...providerForm,
                    provider: e.target.value as 'openai' | 'anthropic',
                    model: e.target.value === 'openai' ? 'gpt-4' : 'claude-3-opus',
                  })
                }
                className="w-full p-2 border rounded bg-white dark:bg-slate-800"
                required
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="providerModel">Modelo *</Label>
              <select
                id="providerModel"
                value={providerForm.model}
                onChange={(e) =>
                  setProviderForm({ ...providerForm, model: e.target.value })
                }
                className="w-full p-2 border rounded bg-white dark:bg-slate-800"
                required
              >
                {providerForm.provider === 'openai' ? (
                  <>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </>
                ) : (
                  <>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <Label htmlFor="providerKey">API Key *</Label>
              <Input
                id="providerKey"
                type="password"
                value={providerForm.api_key}
                onChange={(e) =>
                  setProviderForm({ ...providerForm, api_key: e.target.value })
                }
                placeholder="sk-..."
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                A chave será armazenada de forma segura
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowProviderDialog(false);
                setEditingProvider(null);
                setProviderForm({ provider: 'openai', api_key: '', model: 'gpt-4' });
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={saveProvider}
              disabled={!providerForm.api_key || !providerForm.model}
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

