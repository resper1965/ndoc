'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to avoid SSR issues with hooks
export const dynamic = 'force-dynamic';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Edit, X, AlertCircle, Plus } from 'lucide-react';
import { validateMDX, type ValidationError } from '@/lib/validate-mdx';
import { showSuccess, showError, showWarning } from '@/lib/toast';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { logger } from '@/lib/logger';
import { UserManagementSection } from '@/components/user-management-section';
import { SuperAdminSection } from '@/components/super-admin-section';
import { AIConfigSection } from '@/components/ai-config-section';
import { MDXEditorWithPreview } from '@/components/mdx-editor-with-preview';
import { documentTemplates, applyTemplate } from '@/lib/templates';
import { DocumentCard } from '@/components/document-card';
import { Search, Filter } from 'lucide-react';
import matter from 'gray-matter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/dialog';

export default function ConfigPage() {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const [credentials, setCredentials] = useState({
    username: '',
    updatedAt: null as string | null,
    isDefaultPassword: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Document management
  const [documents, setDocuments] = useState<Array<{ path: string; url: string; title?: string; description?: string; createdAt?: string; updatedAt?: string }>>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'path' | 'date'>('path');
  const [selectedDoc, setSelectedDoc] = useState<{
    path: string;
    content: string;
  } | null>(null);
  const [editingDoc, setEditingDoc] = useState<{
    path: string;
    content: string;
  } | null>(null);
  const [authForDocs, setAuthForDocs] = useState({
    username: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  // Create new document
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    path: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    order: '',
    content: '',
  });

  useEffect(() => {
    loadCredentials();
    loadDocuments();
  }, []);

  useEffect(() => {
    // Load auth from credentials
    if (credentials.username) {
      setAuthForDocs((prev) => ({ ...prev, username: credentials.username }));
    }
  }, [credentials]);

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
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setSaving(false);
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 3) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 3 caracteres' });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/config/credentials', {
        method: 'POST',
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
        setMessage({ type: 'success', text: 'Credenciais atualizadas com sucesso!' });
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

  const loadDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const response = await fetch('/api/ingest?list=true');
      if (response.ok) {
        const data = await response.json();
        // Enriquecer documentos com informações do frontmatter
        const enrichedDocs = await Promise.all(
          (data.documents || []).map(async (doc: { path: string; url: string }) => {
            try {
              const docResponse = await fetch(`/api/ingest?path=${encodeURIComponent(doc.path)}`);
              if (docResponse.ok) {
                const docData = await docResponse.json();
                const parsed = matter(docData.content || '');
                return {
                  ...doc,
                  title: (parsed.data.title as string) || doc.path,
                  description: (parsed.data.description as string) || '',
                  createdAt: (parsed.data.date as string) || '',
                  updatedAt: (parsed.data.date as string) || '',
                };
              }
            } catch {
              // Se falhar, usar dados básicos
            }
            return {
              ...doc,
              title: doc.path,
              description: '',
            };
          })
        );
        setDocuments(enrichedDocs);
      } else {
        showError('Erro ao carregar documentos');
      }
    } catch (error) {
      logger.error('Error loading documents', error);
      showError('Erro ao carregar documentos');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const loadDocument = async (path: string, edit: boolean = false) => {
    try {
      const response = await fetch(`/api/ingest?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        const data = await response.json();
        const doc = { path: data.path, content: data.content };
        setSelectedDoc(doc);
        setEditingDoc(edit ? doc : null);
      }
    } catch (error) {
      logger.error('Error loading document', error);
    }
  };

  const deleteDocument = async (path: string) => {
    if (!authForDocs.password) {
      showWarning('Por favor, informe a senha para deletar documentos');
      return;
    }

    confirm(
      'Confirmar exclusão',
      `Tem certeza que deseja deletar o documento "${path}"? Esta ação não pode ser desfeita.`,
      async () => {
        await performDeleteDocument(path);
      },
      {
        confirmText: 'Deletar',
        cancelText: 'Cancelar',
        variant: 'destructive',
      }
    );
  };

  const performDeleteDocument = async (path: string) => {

    try {
      const response = await fetch('/api/ingest', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: path.replace(/\.mdx$/, ''),
          username: authForDocs.username,
          password: authForDocs.password,
        }),
      });

      if (response.ok) {
        await loadDocuments();
        if (selectedDoc?.path === path) {
          setSelectedDoc(null);
        }
        showSuccess('Documento deletado com sucesso!');
      } else {
        const data = await response.json();
        showError(data.error || 'Erro ao deletar documento');
      }
    } catch {
      showError('Erro ao deletar documento');
    }
  };

  const saveDocument = async () => {
    if (!editingDoc || !authForDocs.password) {
      return;
    }

    // Validar antes de salvar
    const validation = validateMDX(editingDoc.content);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      const errorMessages = validation.errors.map(e => `- ${e.message}`).join('\n');
      showError(`Erros de validação encontrados:\n${errorMessages}`);
      return;
    }

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: editingDoc.path.replace(/\.mdx$/, ''),
          content: editingDoc.content,
          username: authForDocs.username,
          password: authForDocs.password,
        }),
      });

      if (response.ok) {
        await loadDocuments();
        setSelectedDoc(editingDoc);
        setEditingDoc(null);
        showSuccess('Documento salvo com sucesso!');
      } else {
        const data = await response.json();
        showError(data.error || 'Erro ao salvar documento');
      }
    } catch {
      showError('Erro ao salvar documento');
    }
  };

  const generateMDXContent = (form: typeof newDocForm): string => {
    const frontmatter: string[] = [];
    frontmatter.push(`title: ${form.title ? `"${form.title}"` : '""'}`);
    if (form.description) {
      frontmatter.push(`description: "${form.description}"`);
    }
    if (form.date) {
      frontmatter.push(`date: ${form.date}`);
    }
    if (form.order) {
      frontmatter.push(`order: ${parseInt(form.order) || 0}`);
    }

    const frontmatterString = frontmatter.join('\n');
    const content = form.content.trim() || '# ' + form.title + '\n\nAdicione seu conteúdo aqui...';

    return `---\n${frontmatterString}\n---\n\n${content}`;
  };

  const createNewDocument = async () => {
    if (!authForDocs.password) {
      showWarning('Por favor, informe a senha para criar documentos');
      return;
    }

    // Validações
    if (!newDocForm.path.trim()) {
      showError('O caminho do documento é obrigatório');
      return;
    }

    if (!newDocForm.title.trim()) {
      showError('O título é obrigatório');
      return;
    }

    // Gerar conteúdo MDX
    const mdxContent = generateMDXContent(newDocForm);

    // Validar formato MDX
    const validation = validateMDX(mdxContent);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      const errorMessages = validation.errors.map(e => `- ${e.message}`).join('\n');
      showError(`Erros de validação:\n${errorMessages}`);
      return;
    }

    try {
      // Garantir que o path termina com .mdx
      let docPath = newDocForm.path.trim();
      if (!docPath.endsWith('.mdx')) {
        docPath += '.mdx';
      }

      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: docPath.replace(/\.mdx$/, ''),
          content: mdxContent,
          username: authForDocs.username,
          password: authForDocs.password,
        }),
      });

      if (response.ok) {
        showSuccess('Documento criado com sucesso!');
        setShowCreateDialog(false);
        setNewDocForm({
          path: '',
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          order: '',
          content: '',
        });
        setValidationErrors([]);
        await loadDocuments();
      } else {
        const data = await response.json();
        showError(data.error || 'Erro ao criar documento');
      }
    } catch {
      showError('Erro ao criar documento');
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {ConfirmDialogComponent}
      
      {/* Create Document Dialog */}
      <Dialog open={showCreateDialog} setOpen={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Documento</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar um novo documento. O frontmatter será gerado automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newDocPath">Caminho do Arquivo *</Label>
                <Input
                  id="newDocPath"
                  value={newDocForm.path}
                  onChange={(e) => setNewDocForm({ ...newDocForm, path: e.target.value })}
                  placeholder="exemplo/meu-documento.mdx"
                  className="mt-1"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Caminho relativo a /docs (ex: guias/introducao)
                </p>
              </div>

              <div>
                <Label htmlFor="newDocTitle">Título *</Label>
                <Input
                  id="newDocTitle"
                  value={newDocForm.title}
                  onChange={(e) => setNewDocForm({ ...newDocForm, title: e.target.value })}
                  placeholder="Título do Documento"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newDocDescription">Descrição</Label>
              <Input
                id="newDocDescription"
                value={newDocForm.description}
                onChange={(e) => setNewDocForm({ ...newDocForm, description: e.target.value })}
                placeholder="Breve descrição do conteúdo do documento"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Descrição do conteúdo, tema ou assunto do documento. Ajuda na busca e SEO.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newDocDate">Data</Label>
                <Input
                  id="newDocDate"
                  type="date"
                  value={newDocForm.date}
                  onChange={(e) => setNewDocForm({ ...newDocForm, date: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="newDocOrder">Ordem na Sidebar</Label>
                <Input
                  id="newDocOrder"
                  type="number"
                  value={newDocForm.order}
                  onChange={(e) => setNewDocForm({ ...newDocForm, order: e.target.value })}
                  placeholder="1"
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Menor número aparece primeiro
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="newDocContent">Conteúdo</Label>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-slate-500">Template:</Label>
                  <select
                    className="text-xs border rounded px-2 py-1 bg-white dark:bg-slate-800"
                    onChange={(e) => {
                      const template = documentTemplates.find((t) => t.id === e.target.value);
                      if (template) {
                        const applied = applyTemplate(template);
                        setNewDocForm({
                          ...newDocForm,
                          title: applied.title,
                          description: applied.description,
                          date: applied.date,
                          order: applied.order,
                          content: applied.content,
                        });
                        // Validar após aplicar template
                        const fullContent = generateMDXContent({ ...newDocForm, ...applied });
                        const validation = validateMDX(fullContent);
                        setValidationErrors(validation.errors);
                      }
                    }}
                    value=""
                  >
                    <option value="">Selecione um template...</option>
                    {documentTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <MDXEditorWithPreview
                value={newDocForm.content}
                onChange={(value) => {
                  setNewDocForm({ ...newDocForm, content: value });
                  // Validar em tempo real se tiver conteúdo
                  if (value.trim()) {
                    const fullContent = generateMDXContent({ ...newDocForm, content: value });
                    const validation = validateMDX(fullContent);
                    setValidationErrors(validation.errors);
                  } else {
                    setValidationErrors([]);
                  }
                }}
                height="500px"
                placeholder="# Título&#10;&#10;Seu conteúdo em Markdown aqui..."
              />
              <p className="text-xs text-slate-500 mt-2">
                Use os botões acima para alternar entre editor, preview e split-view.
              </p>
            </div>

            {validationErrors.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Erros de validação:
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-red-700 dark:text-red-300">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>
                      {error.field && <strong>{error.field}: </strong>}
                      {error.message}
                      {error.line && ` (linha ${error.line})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Preview do Frontmatter:
              </Label>
              <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
{`---
title: "${newDocForm.title || 'Título'}"
${newDocForm.description ? `description: "${newDocForm.description}"` : ''}
${newDocForm.date ? `date: ${newDocForm.date}` : ''}
${newDocForm.order ? `order: ${parseInt(newDocForm.order) || 0}` : ''}
---`}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setNewDocForm({
                path: '',
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                order: '',
                content: '',
              });
              setValidationErrors([]);
            }}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={createNewDocument}
              disabled={!authForDocs.password || !newDocForm.path.trim() || !newDocForm.title.trim() || validationErrors.length > 0}
            >
              Criar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <h1 className="text-4xl font-heading font-bold mb-2">Configuração do Sistema</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Gerencie credenciais e configurações do sistema
      </p>

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
                Você está usando a senha padrão <strong>admin</strong>. Por segurança, é altamente recomendado alterá-la imediatamente após a primeira implantação.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowPasswordWarning(false);
                  // Scroll para o formulário de credenciais
                  document.getElementById('credentials-form')?.scrollIntoView({ behavior: 'smooth' });
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

      {/* Credentials Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-heading font-semibold mb-4">Gestão de Credenciais</h2>
        
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Usuário Atual
            </Label>
            <div className="mt-1 text-lg font-medium">{credentials.username}</div>
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

        <form id="credentials-form" onSubmit={handleSubmit} className="space-y-4">
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

      {/* Document Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-heading font-semibold mb-4">Gerenciamento de Documentos</h2>
        
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 mb-4">
          <Label className="text-sm font-medium mb-2 block">Senha para Operações</Label>
          <Input
            type="password"
            value={authForDocs.password}
            onChange={(e) =>
              setAuthForDocs({ ...authForDocs, password: e.target.value })
            }
            placeholder="Digite a senha para editar/deletar documentos"
            className="mb-2"
          />
          <p className="text-xs text-slate-500">
            Necessária para editar ou deletar documentos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-heading font-semibold">
                Documentos ({documents.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateDialog(true)}
                  disabled={!authForDocs.password}
                  title={!authForDocs.password ? 'Informe a senha para criar documentos' : ''}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Novo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDocuments}
                  disabled={documentsLoading}
                >
                  {documentsLoading ? 'Carregando...' : 'Atualizar'}
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-4 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  className="text-xs border rounded px-2 py-1 bg-white dark:bg-slate-800"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'path' | 'date')}
                >
                  <option value="path">Ordenar por: Caminho</option>
                  <option value="date">Ordenar por: Data</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 max-h-[600px] overflow-y-auto">
              {documents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhum documento encontrado
                </p>
              ) : (() => {
                // Filtrar documentos
                const filtered = documents.filter((doc) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    doc.path.toLowerCase().includes(query) ||
                    doc.title?.toLowerCase().includes(query) ||
                    doc.description?.toLowerCase().includes(query) ||
                    doc.url.toLowerCase().includes(query)
                  );
                });

                // Ordenar documentos
                const sorted = [...filtered].sort((a, b) => {
                  if (sortBy === 'path') {
                    return a.path.localeCompare(b.path);
                  } else {
                    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                    return dateB - dateA; // Mais recente primeiro
                  }
                });

                if (sorted.length === 0) {
                  return (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Nenhum documento encontrado para "{searchQuery}"
                    </p>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-3">
                    {sorted.map((doc) => (
                      <DocumentCard
                        key={doc.path}
                        document={doc}
                        onView={() => loadDocument(doc.path)}
                        onEdit={() => loadDocument(doc.path, true)}
                        onDelete={doc.path !== 'index.mdx' ? () => deleteDocument(doc.path) : undefined}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Document Viewer/Editor */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-heading font-semibold">
                {editingDoc ? 'Editar Documento' : selectedDoc ? 'Visualizar Documento' : 'Nenhum documento selecionado'}
              </h3>
              {selectedDoc && (
                <Button
                  variant="none"
                  size="sm"
                  onClick={() => {
                    setSelectedDoc(null);
                    setEditingDoc(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {selectedDoc && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                <div className="mb-2">
                  <Label className="text-xs font-medium text-slate-500">Caminho</Label>
                  <div className="text-sm font-mono">{selectedDoc.path}</div>
                </div>
                {editingDoc ? (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Conteúdo</Label>
                    <MDXEditorWithPreview
                      value={editingDoc.content}
                      onChange={(newContent) => {
                        setEditingDoc({ ...editingDoc, content: newContent });
                        // Validar em tempo real
                        const validation = validateMDX(newContent);
                        setValidationErrors(validation.errors);
                      }}
                      height="600px"
                    />
                    {validationErrors.length > 0 && (
                      <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm font-medium text-red-800 dark:text-red-200">
                            Erros de validação encontrados:
                          </span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-red-700 dark:text-red-300">
                          {validationErrors.map((error, idx) => (
                            <li key={idx}>
                              {error.field && <strong>{error.field}: </strong>}
                              {error.message}
                              {error.line && ` (linha ${error.line})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={saveDocument}
                        disabled={!authForDocs.password || validationErrors.length > 0}
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingDoc(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Conteúdo</Label>
                    <pre className="text-xs font-mono bg-white dark:bg-slate-800 p-3 rounded max-h-96 overflow-auto whitespace-pre-wrap">
                      {selectedDoc.content}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setEditingDoc({ ...selectedDoc });
                        // Validar ao entrar no modo de edição
                        const validation = validateMDX(selectedDoc.content);
                        setValidationErrors(validation.errors);
                      }}
                      disabled={!authForDocs.password}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Exportação de Documentos */}
      <section className="mb-12">
        <h2 className="text-2xl font-heading font-semibold mb-4">Exportação de Documentos</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Exporte todos os documentos ou um documento específico como arquivo ZIP.
        </p>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
          <div className="flex gap-4">
            <Button
              variant="primary"
              onClick={async () => {
                if (!authForDocs.password) {
                  showWarning('Por favor, informe a senha para exportar documentos');
                  return;
                }
                try {
                  const url = `/api/export?username=${encodeURIComponent(authForDocs.username)}&password=${encodeURIComponent(authForDocs.password)}`;
                  window.open(url, '_blank');
                  showSuccess('Exportação iniciada');
                } catch {
                  showError('Erro ao exportar documentos');
                }
              }}
              disabled={!authForDocs.password}
            >
              Exportar Todos os Documentos
            </Button>
            {selectedDoc && (
              <Button
                variant="outline"
                onClick={async () => {
                  if (!authForDocs.password) {
                    showWarning('Por favor, informe a senha para exportar documentos');
                    return;
                  }
                  try {
                    const path = selectedDoc.path.replace(/\.mdx$/, '');
                    const url = `/api/export?path=${encodeURIComponent(path)}&username=${encodeURIComponent(authForDocs.username)}&password=${encodeURIComponent(authForDocs.password)}`;
                    window.open(url, '_blank');
                    showSuccess('Exportação iniciada');
                  } catch {
                    showError('Erro ao exportar documento');
                  }
                }}
                disabled={!authForDocs.password}
              >
                Exportar Documento Selecionado
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Configuração de IA */}
      <section className="mb-12">
        <h2 className="text-2xl font-heading font-semibold mb-4">Configuração de IA</h2>
        <AIConfigSection />
      </section>

      {/* Gerenciamento de Usuários */}
      <UserManagementSection />

      {/* Document Ingestion API */}
      <section className="mb-12">
        <h2 className="text-2xl font-heading font-semibold mb-4">API de Ingestão</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use a API REST para gerenciar documentos programaticamente.
        </p>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
          <div className="mb-4 space-y-2">
            <div>
              <Label className="text-sm font-medium">POST /api/ingest</Label>
              <div className="text-xs text-slate-500">Criar ou atualizar documento</div>
            </div>
            <div>
              <Label className="text-sm font-medium">PUT /api/ingest</Label>
              <div className="text-xs text-slate-500">Atualizar documento</div>
            </div>
            <div>
              <Label className="text-sm font-medium">DELETE /api/ingest</Label>
              <div className="text-xs text-slate-500">Deletar documento</div>
            </div>
            <div>
              <Label className="text-sm font-medium">GET /api/ingest?list=true</Label>
              <div className="text-xs text-slate-500">Listar todos os documentos</div>
            </div>
            <div>
              <Label className="text-sm font-medium">GET /api/ingest?path=xxx</Label>
              <div className="text-xs text-slate-500">Obter conteúdo de um documento</div>
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

      {/* Super Admin Section */}
      <SuperAdminSection />
    </div>
  );
}

