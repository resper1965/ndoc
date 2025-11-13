'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Trash2, Edit, Eye, X, AlertCircle } from 'lucide-react';
import { validateMDX, type ValidationError } from '@/lib/validate-mdx';

export default function ConfigPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    updatedAt: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Document management
  const [documents, setDocuments] = useState<Array<{ path: string; url: string }>>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
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
        setCredentials(data);
        setFormData((prev) => ({ ...prev, newUsername: data.username }));
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
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
        setMessage({ type: 'success', text: 'Credenciais atualizadas com sucesso!' });
        setFormData({
          currentPassword: '',
          newUsername: data.username,
          newPassword: '',
          confirmPassword: '',
        });
        await loadCredentials();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar credenciais' });
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
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
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
      console.error('Error loading document:', error);
    }
  };

  const deleteDocument = async (path: string) => {
    if (!confirm(`Tem certeza que deseja deletar o documento "${path}"?`)) {
      return;
    }

    if (!authForDocs.password) {
      alert('Por favor, informe a senha para deletar documentos');
      return;
    }

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
        alert('Documento deletado com sucesso!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao deletar documento');
      }
    } catch {
      alert('Erro ao deletar documento');
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
      alert(`Erros de validação encontrados:\n${validation.errors.map(e => `- ${e.message}`).join('\n')}`);
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
        alert('Documento salvo com sucesso!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao salvar documento');
      }
    } catch {
      alert('Erro ao salvar documento');
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
      <h1 className="text-4xl font-heading font-bold mb-2">Configuração do Sistema</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Gerencie credenciais e configurações do sistema
      </p>

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
              <Button
                variant="outline"
                size="sm"
                onClick={loadDocuments}
                disabled={documentsLoading}
              >
                {documentsLoading ? 'Carregando...' : 'Atualizar'}
              </Button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              {documents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhum documento encontrado
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.path}
                      className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{doc.path}</div>
                        <div className="text-xs text-slate-500 truncate">{doc.url}</div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="none"
                          size="xs"
                          onClick={() => loadDocument(doc.path)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="none"
                          size="xs"
                          onClick={() => loadDocument(doc.path, true)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {doc.path !== 'index.mdx' && (
                          <Button
                            variant="none"
                            size="xs"
                            onClick={() => deleteDocument(doc.path)}
                            title="Deletar"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    <textarea
                      value={editingDoc.content}
                      onChange={(e) => {
                        const newContent = e.target.value;
                        setEditingDoc({ ...editingDoc, content: newContent });
                        // Validar em tempo real
                        const validation = validateMDX(newContent);
                        setValidationErrors(validation.errors);
                      }}
                      className={`w-full h-96 p-2 text-sm font-mono bg-white dark:bg-slate-800 border rounded ${
                        validationErrors.length > 0 ? 'border-red-500' : ''
                      }`}
                      spellCheck={false}
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
                  alert('Por favor, informe a senha para exportar documentos');
                  return;
                }
                try {
                  const url = `/api/export?username=${encodeURIComponent(authForDocs.username)}&password=${encodeURIComponent(authForDocs.password)}`;
                  window.open(url, '_blank');
                } catch {
                  alert('Erro ao exportar documentos');
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
                    alert('Por favor, informe a senha para exportar documentos');
                    return;
                  }
                  try {
                    const path = selectedDoc.path.replace(/\.mdx$/, '');
                    const url = `/api/export?path=${encodeURIComponent(path)}&username=${encodeURIComponent(authForDocs.username)}&password=${encodeURIComponent(authForDocs.password)}`;
                    window.open(url, '_blank');
                  } catch {
                    alert('Erro ao exportar documento');
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

      {/* Gerenciamento de Usuários */}
      <section className="mb-12">
        <h2 className="text-2xl font-heading font-semibold mb-4">Gerenciamento de Usuários</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Gerencie usuários e permissões do sistema. Requer permissão admin.
        </p>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            A interface de gerenciamento de usuários está disponível via API REST.
            Use os endpoints em <code>/api/users</code> para criar, atualizar e deletar usuários.
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <strong>GET /api/users</strong> - Listar todos os usuários (requer admin)
            </div>
            <div>
              <strong>POST /api/users</strong> - Criar novo usuário (requer admin)
            </div>
            <div>
              <strong>PUT /api/users</strong> - Atualizar usuário (requer admin)
            </div>
            <div>
              <strong>DELETE /api/users</strong> - Deletar usuário (requer admin)
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            <strong>Permissões:</strong> read (apenas leitura), write (leitura e escrita), admin (acesso total)
          </p>
        </div>
      </section>

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

      {/* Default Credentials Info */}
      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-heading font-semibold mb-2">Credenciais Padrão</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          As credenciais padrão são <strong>admin/admin</strong>. É altamente recomendado alterá-las
          após o primeiro acesso.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          As credenciais são armazenadas em <code>config/credentials.json</code> com a senha
          criptografada usando SHA-256.
        </p>
      </section>
    </div>
  );
}

