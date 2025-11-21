'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { showSuccess, showError } from '@/lib/toast';
import { ArrowLeft, Users, Plus, Mail, Trash2, Shield, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/header';
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/select';

interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function OrganizationUsersPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'viewer' as 'owner' | 'admin' | 'editor' | 'viewer',
  });

  useEffect(() => {
    if (organizationId) {
      loadOrganization();
      loadMembers();
    }
  }, [organizationId]);

  const loadOrganization = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .maybeSingle();

      if (error) {
        logger.error('Error loading organization', error);
        showError('Erro ao carregar organização');
        router.push('/admin');
        return;
      }

      if (!data) {
        showError('Organização não encontrada');
        router.push('/admin');
        return;
      }

      setOrganization(data);
    } catch (error) {
      logger.error('Error loading organization', error);
      showError('Erro ao carregar organização');
      router.push('/admin');
    }
  };

  const loadMembers = async () => {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/members`);
      if (!response.ok) {
        const data = await response.json();
        showError(data.error || 'Erro ao carregar membros');
        return;
      }

      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      logger.error('Error loading members', error);
      showError('Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!newMember.email) {
      showError('Email é obrigatório');
      return;
    }

    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newMember.email,
          role: newMember.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Erro ao adicionar membro');
        return;
      }

      showSuccess('Membro adicionado com sucesso!');
      setShowAddDialog(false);
      setNewMember({ email: '', role: 'viewer' });
      loadMembers();
    } catch (error) {
      logger.error('Error adding member', error);
      showError('Erro ao adicionar membro');
    }
  };

  const removeMember = async (memberId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja remover ${userEmail} desta organização?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/members?memberId=${memberId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Erro ao remover membro');
        return;
      }

      showSuccess('Membro removido com sucesso!');
      loadMembers();
    } catch (error) {
      logger.error('Error removing member', error);
      showError('Erro ao remover membro');
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'owner' | 'admin' | 'editor' | 'viewer') => {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/members?memberId=${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || 'Erro ao atualizar permissão');
        return;
      }

      showSuccess('Permissão atualizada com sucesso!');
      loadMembers();
    } catch (error) {
      logger.error('Error updating member role', error);
      showError('Erro ao atualizar permissão');
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: 'Proprietário',
      admin: 'Administrador',
      editor: 'Editor',
      viewer: 'Visualizador',
    };
    return labels[role] || role;
  };

  const getRoleIcon = (role: string) => {
    if (role === 'owner' || role === 'admin') {
      return <Shield className="h-4 w-4" />;
    }
    return <User className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white dark:bg-gray-950">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-8 text-slate-500">Carregando...</div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-heading font-semibold mb-2 flex items-center gap-2">
              <Users className="h-8 w-8" />
              {organization?.name || 'Organização'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gerenciar usuários da organização
            </p>
          </div>

          {/* Actions */}
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {members.length} {members.length === 1 ? 'membro' : 'membros'}
            </div>
            <Button
              variant="primary"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>

          {/* Members List */}
          {members.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Nenhum membro encontrado nesta organização.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Usuário
              </Button>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden">
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {members.map((member) => {
                  const user = member.user as { id: string; email: string; user_metadata?: { full_name?: string } } | undefined;
                  const displayName = user?.user_metadata?.full_name || user?.email || 'Usuário desconhecido';
                  
                  return (
                    <div
                      key={member.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{displayName}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                            <Mail className="h-3 w-3" />
                            {user?.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <Select
                            value={member.role}
                            onSelect={(value) => {
                              const val = Array.isArray(value) ? value[0] : value;
                              if (val && ['owner', 'admin', 'editor', 'viewer'].includes(val)) {
                                updateMemberRole(member.id, val as 'owner' | 'admin' | 'editor' | 'viewer');
                              }
                            }}
                          >
                            <SelectValue>
                              {getRoleLabel(member.role)}
                            </SelectValue>
                            <SelectContent>
                              <SelectItem value="owner">Proprietário</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Visualizador</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMember(member.id, user?.email || '')}
                          disabled={member.role === 'owner'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Member Dialog */}
          {showAddDialog && (
            <Dialog open={showAddDialog} setOpen={setShowAddDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Usuário</DialogTitle>
                  <DialogDescription>
                    Adicione um usuário existente à organização. O usuário precisa ter uma conta no sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="member-email">Email do Usuário</Label>
                    <Input
                      id="member-email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      placeholder="usuario@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-role">Permissão</Label>
                    <Select
                      value={newMember.role}
                      onSelect={(value) => {
                        const val = Array.isArray(value) ? value[0] : value;
                        if (val && ['owner', 'admin', 'editor', 'viewer'].includes(val)) {
                          setNewMember({ ...newMember, role: val as 'owner' | 'admin' | 'editor' | 'viewer' });
                        }
                      }}
                    >
                      <SelectValue>{getRoleLabel(newMember.role)}</SelectValue>
                      <SelectContent>
                        <SelectItem value="owner">Proprietário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={addMember}>
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

