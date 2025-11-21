'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Plus, Edit, Trash2, FileText, AlertCircle, CheckCircle2, Search, X } from 'lucide-react';
import { showSuccess, showError, showWarning } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { useConfirmDialog } from './confirm-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from './select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { MDXEditorWithPreview } from './mdx-editor-with-preview';

interface Template {
  id: string;
  name: string;
  type: 'policy' | 'procedure' | 'manual';
  description?: string;
  template_content: string;
  metadata_schema?: Record<string, any>;
  is_default: boolean;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function TemplateManagementSection() {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'' | 'policy' | 'procedure' | 'manual'>('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'policy' as 'policy' | 'procedure' | 'manual',
    description: '',
    template_content: '',
    metadata_schema: {} as Record<string, any>,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(Array.isArray(data) ? data : data.templates || []);
      } else {
        showError('Erro ao carregar templates');
      }
    } catch (error) {
      logger.error('Error loading templates', { error });
      showError('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      type: 'policy',
      description: '',
      template_content: '',
      metadata_schema: {},
    });
    setSelectedTemplate(null);
    setShowCreateDialog(true);
  };

  const handleEdit = (template: Template) => {
    setFormData({
      name: template.name,
      type: template.type,
      description: template.description || '',
      template_content: template.template_content,
      metadata_schema: template.metadata_schema || {},
    });
    setSelectedTemplate(template);
    setShowEditDialog(true);
  };

  const handleDelete = async (template: Template) => {
    if (template.is_default) {
      showWarning('Templates padrão não podem ser deletados');
      return;
    }

    confirm(
      'Confirmar exclusão',
      `Tem certeza que deseja deletar o template "${template.name}"? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          const response = await fetch(`/api/templates/${template.id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            showSuccess('Template deletado com sucesso!');
            await loadTemplates();
          } else {
            const data = await response.json();
            showError(data.error || 'Erro ao deletar template');
          }
        } catch (error) {
          logger.error('Error deleting template', { error });
          showError('Erro ao deletar template');
        }
      },
      {
        confirmText: 'Deletar',
        cancelText: 'Cancelar',
        variant: 'destructive',
      }
    );
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.template_content.trim()) {
      showError('Nome e conteúdo do template são obrigatórios');
      return;
    }

    try {
      const url = selectedTemplate
        ? `/api/templates/${selectedTemplate.id}`
        : '/api/templates';
      const method = selectedTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess(
          selectedTemplate
            ? 'Template atualizado com sucesso!'
            : 'Template criado com sucesso!'
        );
        setShowCreateDialog(false);
        setShowEditDialog(false);
        setSelectedTemplate(null);
        await loadTemplates();
      } else {
        const data = await response.json();
        showError(data.error || 'Erro ao salvar template');
      }
    } catch (error) {
      logger.error('Error saving template', { error });
      showError('Erro ao salvar template');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'policy':
        return 'Política';
      case 'procedure':
        return 'Procedimento';
      case 'manual':
        return 'Manual';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'policy':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'procedure':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'manual':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Filtrar templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        !searchQuery ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !filterType || template.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [templates, searchQuery, filterType]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">Carregando templates...</p>
      </div>
    );
  }

  return (
    <>
      {ConfirmDialogComponent}
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-heading font-semibold">
              Templates ({filteredTemplates.length} de {templates.length})
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Gerencie templates para diferentes tipos de documentos
            </p>
          </div>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="none"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filterType}
              onSelect={(value) => setFilterType((value as any) || '')}
            >
              <SelectValue placeholder="Todos os tipos" />
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="policy">Política</SelectItem>
                <SelectItem value="procedure">Procedimento</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <FileText className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {templates.length === 0
                ? 'Nenhum template encontrado'
                : 'Nenhum template corresponde aos filtros'}
            </p>
            {templates.length === 0 && (
              <Button variant="primary" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Template
              </Button>
            )}
            {(searchQuery || filterType) && templates.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('');
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                      {template.is_default && (
                        <div title="Template padrão">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getTypeColor(template.type)}`}
                    >
                      {getTypeLabel(template.type)}
                    </span>
                  </div>
                </div>

                {template.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  {!template.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || showEditDialog}
        setOpen={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setShowEditDialog(false);
            setSelectedTemplate(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Editar Template' : 'Criar Novo Template'}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? 'Atualize as informações do template'
                : 'Crie um novo template para documentos'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="templateName">Nome *</Label>
                <Input
                  id="templateName"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Política de Segurança"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="templateType">Tipo *</Label>
                <select
                  id="templateType"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'policy' | 'procedure' | 'manual',
                    })
                  }
                  className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  disabled={selectedTemplate?.is_default}
                >
                  <option value="policy">Política</option>
                  <option value="procedure">Procedimento</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="templateDescription">Descrição</Label>
              <Input
                id="templateDescription"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Breve descrição do template"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="templateContent">Conteúdo do Template (MDX) *</Label>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 mb-2">
                Use placeholders como {'{{title}}'}, {'{{description}}'}, etc.
              </p>
              <MDXEditorWithPreview
                value={formData.template_content}
                onChange={(value) =>
                  setFormData({ ...formData, template_content: value })
                }
                height="400px"
                placeholder="---&#10;title: {{title}}&#10;description: {{description}}&#10;---&#10;&#10;# {{title}}&#10;&#10;Conteúdo do documento..."
              />
            </div>

            {selectedTemplate?.is_default && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Este é um template padrão. Apenas o conteúdo pode ser editado.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                setSelectedTemplate(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {selectedTemplate ? 'Atualizar' : 'Criar'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

