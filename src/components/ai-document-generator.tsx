'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Sparkles, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from './select';

interface AIDocumentGeneratorProps {
  onContentGenerated: (content: string, path: string, title: string) => void;
  onCancel?: () => void;
}

interface Theme {
  id: string;
  name: string;
  description?: string;
}

export function AIDocumentGenerator({
  onContentGenerated,
  onCancel,
}: AIDocumentGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [formData, setFormData] = useState({
    topic: '',
    path: '',
    themeId: '',
  });

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const response = await fetch('/api/ai/themes');
      if (response.ok) {
        const data = await response.json();
        setThemes(data.themes || []);
        if (data.themes && data.themes.length > 0) {
          setFormData((prev) => ({ ...prev, themeId: data.themes[0].id }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar temas:', error);
      showError('Erro ao carregar temas de IA');
    } finally {
      setLoadingThemes(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.topic || !formData.path || !formData.themeId) {
      showError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formData.topic,
          theme_id: formData.themeId,
          path: formData.path,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao gerar documento');
      }

      const result = await response.json();
      
      // Extrair título do tópico ou do conteúdo gerado
      const title = formData.topic;
      
      // O conteúdo já vem formatado com frontmatter
      onContentGenerated(result.content, formData.path, title);
      showSuccess('Documento gerado com sucesso!');
    } catch (error: any) {
      showError(error.message || 'Erro ao gerar documento com IA');
    } finally {
      setLoading(false);
    }
  };

  const suggestedPaths = [
    'getting-started/intro',
    'guides/tutorial',
    'reference/api',
    'examples/example',
  ];

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary mb-1">
              Gerar Documento com IA
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Descreva o tópico do documento e a IA irá gerar o conteúdo automaticamente
              usando o tema selecionado.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="ai-topic">
            Tópico do Documento <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ai-topic"
            placeholder="ex: Introdução ao React, Guia de API, Tutorial de Autenticação"
            value={formData.topic}
            onChange={(e) =>
              setFormData({ ...formData, topic: e.target.value })
            }
            disabled={loading}
            className="mt-1"
          />
          <p className="text-xs text-slate-500 mt-1">
            Descreva o que você quer que o documento contenha
          </p>
        </div>

        <div>
          <Label htmlFor="ai-path">
            Caminho (Path) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ai-path"
            placeholder="ex: getting-started/intro"
            value={formData.path}
            onChange={(e) =>
              setFormData({ ...formData, path: e.target.value })
            }
            disabled={loading}
            className="mt-1"
          />
          <p className="text-xs text-slate-500 mt-1">
            Caminho onde o documento será salvo (sem extensão .mdx)
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestedPaths.map((path) => (
              <Button
                key={path}
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, path })}
                disabled={loading}
                className="text-xs"
              >
                {path}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="ai-theme">
            Tema de IA <span className="text-red-500">*</span>
          </Label>
          {loadingThemes ? (
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando temas...
            </div>
          ) : (
            <Select
              value={formData.themeId}
              onSelect={(value) =>
                setFormData({ ...formData, themeId: value as string })
              }
              disabled={loading}
              className="mt-1"
            >
              <SelectValue placeholder="Selecione um tema" />
              <SelectContent>
                {themes.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-slate-500">
                    Nenhum tema disponível
                  </div>
                ) : (
                  themes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      <div>
                        <div className="font-medium">{theme.name}</div>
                        {theme.description && (
                          <div className="text-xs text-slate-500">
                            {theme.description}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-slate-500 mt-1">
            O tema define o estilo e formato do documento gerado
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={loading || !formData.topic || !formData.path || !formData.themeId || loadingThemes}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Documento
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

