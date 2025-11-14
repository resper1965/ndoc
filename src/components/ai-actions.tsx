'use client';

/**
 * AI Actions Component
 * 
 * Botões e ações para gerar e melhorar documentos com IA
 */

import { useState } from 'react';
import { Button } from './button';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { generateDocument, improveDocument } from '@/lib/ai-service';
import { showSuccess, showError } from '@/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Input } from './input';
import { Label } from './label';
import { useAuth } from '@/hooks/use-auth';

interface AIActionsProps {
  onContentGenerated?: (content: string) => void;
  onContentImproved?: (content: string) => void;
  currentContent?: string;
  themeId?: string;
}

export function AIActions({
  onContentGenerated,
  onContentImproved,
  currentContent = '',
  themeId,
}: AIActionsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showImproveDialog, setShowImproveDialog] = useState(false);
  const [generateTopic, setGenerateTopic] = useState('');
  const [generatePath, setGeneratePath] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState(themeId || '');
  const [themes, setThemes] = useState<Array<{ id: string; name: string }>>([]);
  const [improveInstructions, setImproveInstructions] = useState('');

  const loadThemes = async () => {
    try {
      const response = await fetch('/api/ai/themes');
      if (response.ok) {
        const data = await response.json();
        setThemes(data.themes || []);
      }
    } catch {
      // Ignorar erro
    }
  };

  const handleGenerate = async () => {
    if (!generateTopic || !generatePath || !selectedThemeId) {
      showError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const result = await generateDocument({
        topic: generateTopic,
        theme_id: selectedThemeId,
        path: generatePath,
      });

      if (onContentGenerated) {
        onContentGenerated(result.content);
      }

      showSuccess('Documento gerado com sucesso!');
      setShowGenerateDialog(false);
      setGenerateTopic('');
      setGeneratePath('');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Erro ao gerar documento');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!currentContent) {
      showError('Nenhum conteúdo para melhorar');
      return;
    }

    setLoading(true);
    try {
      const result = await improveDocument({
        content: currentContent,
        theme_id: selectedThemeId || undefined,
        instructions: improveInstructions || undefined,
      });

      if (onContentImproved) {
        onContentImproved(result.improved_content);
      }

      showSuccess('Documento melhorado com sucesso!');
      setShowImproveDialog(false);
      setImproveInstructions('');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Erro ao melhorar documento');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Não mostrar ações de IA se não estiver autenticado
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          loadThemes();
          setShowGenerateDialog(true);
        }}
        disabled={loading}
      >
        <Sparkles className="h-4 w-4 mr-1" />
        Gerar com IA
      </Button>

      {currentContent && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadThemes();
            setShowImproveDialog(true);
          }}
          disabled={loading}
        >
          <Wand2 className="h-4 w-4 mr-1" />
          Melhorar com IA
        </Button>
      )}

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} setOpen={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Documento com IA</DialogTitle>
            <DialogDescription>
              Gere um novo documento MDX sobre um tópico específico
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="generateTopic">Tópico *</Label>
              <Input
                id="generateTopic"
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                placeholder="Ex: Introdução ao React"
                required
              />
            </div>

            <div>
              <Label htmlFor="generatePath">Caminho *</Label>
              <Input
                id="generatePath"
                value={generatePath}
                onChange={(e) => setGeneratePath(e.target.value)}
                placeholder="exemplo/introducao-react"
                required
              />
            </div>

            <div>
              <Label htmlFor="generateTheme">Tema *</Label>
              <select
                id="generateTheme"
                value={selectedThemeId}
                onChange={(e) => setSelectedThemeId(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-slate-800"
                required
              >
                <option value="">Selecione um tema...</option>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowGenerateDialog(false);
                setGenerateTopic('');
                setGeneratePath('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={loading || !generateTopic || !generatePath || !selectedThemeId}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Gerar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Improve Dialog */}
      <Dialog open={showImproveDialog} setOpen={setShowImproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Melhorar Documento com IA</DialogTitle>
            <DialogDescription>
              Melhore o documento atual usando IA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="improveTheme">Tema (opcional)</Label>
              <select
                id="improveTheme"
                value={selectedThemeId}
                onChange={(e) => setSelectedThemeId(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-slate-800"
              >
                <option value="">Usar tema padrão</option>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="improveInstructions">Instruções Adicionais (opcional)</Label>
              <textarea
                id="improveInstructions"
                value={improveInstructions}
                onChange={(e) => setImproveInstructions(e.target.value)}
                className="w-full h-24 p-2 text-sm border rounded bg-white dark:bg-slate-800"
                placeholder="Ex: Melhore a clareza, adicione exemplos de código..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImproveDialog(false);
                setImproveInstructions('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleImprove}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Melhorando...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-1" />
                  Melhorar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

