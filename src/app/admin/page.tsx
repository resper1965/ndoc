/**
 * Admin Page
 * 
 * Página de administração para superadmin gerenciar organizações
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { showSuccess, showError } from '@/lib/toast';
import { Plus, Trash2, Users, Building2, Home, Settings, FileText, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ModeToggle } from '@/components/mode-toggle';
import { BrandingText } from '@/components/branding-text';
import { getDisplayLogo } from '../../../config/branding';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/dialog';

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '',
    slug: '',
  });

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const supabase = createClient();
      const { data, error: loadError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (loadError) {
        showError(`Erro ao carregar organizações: ${loadError.message}`);
        return;
      }

      setOrganizations(data || []);
    } catch {
      showError('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrg.name || !newOrg.slug) {
      showError('Nome e slug são obrigatórios');
      return;
    }

    try {
      const supabase = createClient();
      const { error: createError } = await supabase
        .from('organizations')
        .insert([{
          name: newOrg.name,
          slug: newOrg.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        }])
        .select()
        .single();

      if (createError) {
        showError(`Erro ao criar organização: ${createError.message}`);
        return;
      }

      showSuccess('Organização criada com sucesso!');
      setShowCreateDialog(false);
      setNewOrg({ name: '', slug: '' });
      loadOrganizations();
    } catch {
      showError('Erro ao criar organização');
    }
  };

  const deleteOrganization = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta organização? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (deleteError) {
        showError(`Erro ao deletar organização: ${deleteError.message}`);
        return;
      }

      showSuccess('Organização deletada com sucesso!');
      loadOrganizations();
    } catch {
      showError('Erro ao deletar organização');
    }
  };

  return (
    <AuthGuard requireSuperadmin>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Header com Navegação */}
        <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {getDisplayLogo() ? (
                    <Image
                      alt="logo"
                      className="h-8 w-auto dark:invert"
                      width={32}
                      height={32}
                      src={getDisplayLogo()!}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <BrandingText className="text-lg" />
                </Link>
                <nav className="hidden md:flex items-center gap-1 ml-6">
                  <Link href="/">
                    <Button variant="none" size="sm" className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Início
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button variant="none" size="sm" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documentação
                    </Button>
                  </Link>
                  <Link href="/config">
                    <Button variant="none" size="sm" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configurações
                    </Button>
                  </Link>
                  <Button variant="none" size="sm" className="flex items-center gap-2 bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                    Administração
                  </Button>
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <Link href="/config">
              <Button variant="none" size="sm" className="mb-4 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar para Configurações
              </Button>
            </Link>
            <h1 className="text-3xl font-heading font-bold mb-2">Administração</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gerencie organizações e usuários do sistema
            </p>
          </div>

        {/* Organizações */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-heading font-semibold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Organizações
            </h2>
            <Button
              variant="primary"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Organização
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500">Carregando...</div>
          ) : organizations.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">
                Nenhuma organização encontrada. Crie uma nova organização para começar.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{org.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Slug: <code className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">{org.slug}</code>
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Criada em: {new Date(org.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `/admin/organizations/${org.id}`}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Usuários
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => deleteOrganization(org.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Dialog de Criação */}
        {showCreateDialog && (
          <Dialog open={showCreateDialog} setOpen={setShowCreateDialog}>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Organização</DialogTitle>
              <DialogDescription>
                Crie uma nova organização para agrupar usuários e documentos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="org-name">Nome</Label>
                <Input
                  id="org-name"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  placeholder="Nome da organização"
                />
              </div>
              <div>
                <Label htmlFor="org-slug">Slug</Label>
                <Input
                  id="org-slug"
                  value={newOrg.slug}
                  onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                  placeholder="slug-da-organizacao"
                />
                <p className="text-xs text-slate-500 mt-1">
                  O slug será usado na URL e deve ser único. Apenas letras minúsculas, números e hífens.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={createOrganization}>
                Criar
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

