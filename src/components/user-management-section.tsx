/**
 * User Management Section Component
 * 
 * Componente para gerenciar usuários (superadmin e orgadmin)
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Trash2, Edit, UserPlus, Shield, Users } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';
import { createClient } from '@/lib/supabase/client';
import { isSuperadmin, getUserPermissions, canManageUsers } from '@/lib/supabase/permissions-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/dialog';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

export function UserManagementSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    organizationId: '',
    role: 'viewer' as 'orgadmin' | 'admin' | 'editor' | 'viewer',
  });
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  useEffect(() => {
    checkPermissions();
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (canManage) {
      loadUsers();
    }
  }, [canManage, organizationId]);

  const checkPermissions = async () => {
    try {
      const permissions = await getUserPermissions();
      const superAdmin = await isSuperadmin();
      const canManageUsersCheck = await canManageUsers(permissions.organizationId || undefined);

      setIsSuper(superAdmin);
      setCanManage(canManageUsersCheck);
      setOrganizationId(permissions.organizationId);
    } catch {
      // Ignorar erros silenciosamente
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .order('name');

      if (error) {
        // Ignorar erros silenciosamente
        return;
      }

      setOrganizations(data || []);
      
      // Se não é superadmin e tem organização, definir como padrão
      if (!isSuper && organizationId) {
        setNewUser((prev) => ({ ...prev, organizationId }));
      } else if (data && data.length > 0) {
        setNewUser((prev) => ({ ...prev, organizationId: data[0].id }));
      }
    } catch {
      // Ignorar erros silenciosamente
    }
  };

  const loadUsers = async () => {
    try {
      const url = organizationId
        ? `/api/users?organization_id=${organizationId}`
        : '/api/users';
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Erro ao carregar usuários');
        return;
      }

      setUsers(data.users || []);
    } catch {
      showError('Erro ao carregar usuários');
    }
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.organizationId) {
      showError('E-mail, senha e organização são obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Erro ao criar usuário');
        return;
      }

      showSuccess('Usuário criado com sucesso!');
      setShowCreateDialog(false);
      setNewUser({
        email: '',
        password: '',
        name: '',
        organizationId: organizations[0]?.id || '',
        role: 'viewer',
      });
      loadUsers();
    } catch {
      showError('Erro ao criar usuário');
    }
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          organizationId: selectedUser.organizationId,
          role: newUser.role,
          name: newUser.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Erro ao atualizar usuário');
        return;
      }

      showSuccess('Usuário atualizado com sucesso!');
      setShowEditDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch {
      showError('Erro ao atualizar usuário');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Erro ao deletar usuário');
        return;
      }

      showSuccess('Usuário deletado com sucesso!');
      loadUsers();
    } catch {
      showError('Erro ao deletar usuário');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      email: user.email,
      password: '',
      name: user.name,
      organizationId: user.organizationId,
      role: user.role as 'orgadmin' | 'admin' | 'editor' | 'viewer',
    });
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-heading font-semibold mb-4">Gerenciamento de Usuários</h2>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </section>
    );
  }

  if (!canManage) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-heading font-semibold mb-4">Gerenciamento de Usuários</h2>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
          <p className="text-slate-600 dark:text-slate-400">
            Você não tem permissão para gerenciar usuários. Apenas superadmins e orgadmins podem gerenciar usuários.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-heading font-semibold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Gerenciamento de Usuários
        </h2>
        <Button
          variant="primary"
          onClick={() => setShowCreateDialog(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400">
              Nenhum usuário encontrado. Crie um novo usuário para começar.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{user.name || user.email}</h3>
                    {user.role === 'orgadmin' && (
                      <Shield className="h-4 w-4 text-primary" />
                    )}
                    {isSuper && user.role === 'superadmin' && (
                      <Shield className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>Role: <strong>{user.role}</strong></span>
                    {user.organization && (
                      <span>Org: <strong>{user.organization.name}</strong></span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {isSuper && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
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

      {/* Dialog de Criação */}
      {showCreateDialog && (
        <Dialog open={showCreateDialog} setOpen={setShowCreateDialog}>
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              {isSuper
                ? 'Crie um novo usuário e atribua-o a uma organização.'
                : 'Crie um novo usuário para sua organização.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Nome</Label>
              <Input
                id="user-name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="user-email">E-mail</Label>
              <Input
                id="user-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="usuario@exemplo.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="user-password">Senha</Label>
              <Input
                id="user-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            {isSuper && (
              <div>
                <Label htmlFor="user-org">Organização</Label>
                <select
                  id="user-org"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                  value={newUser.organizationId}
                  onChange={(e) => setNewUser({ ...newUser, organizationId: e.target.value })}
                  required
                >
                  <option value="">Selecione uma organização</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label htmlFor="user-role">Role</Label>
              <select
                id="user-role"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
              >
                <option value="viewer">Viewer (Apenas leitura)</option>
                <option value="editor">Editor (Leitura e escrita)</option>
                <option value="admin">Admin (Acesso total na organização)</option>
                {isSuper && <option value="orgadmin">Org Admin (Administrador da organização)</option>}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={createUser}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Edição */}
      {showEditDialog && (
        <Dialog open={showEditDialog} setOpen={setShowEditDialog}>
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-user-name">Nome</Label>
              <Input
                id="edit-user-name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="edit-user-email">E-mail</Label>
              <Input
                id="edit-user-email"
                type="email"
                value={newUser.email}
                disabled
                className="bg-slate-100 dark:bg-slate-700"
              />
            </div>
            <div>
              <Label htmlFor="edit-user-role">Role</Label>
              <select
                id="edit-user-role"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
              >
                <option value="viewer">Viewer (Apenas leitura)</option>
                <option value="editor">Editor (Leitura e escrita)</option>
                <option value="admin">Admin (Acesso total na organização)</option>
                {isSuper && <option value="orgadmin">Org Admin (Administrador da organização)</option>}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={updateUser}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      )}
    </section>
  );
}

