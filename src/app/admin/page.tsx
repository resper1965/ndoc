'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Tabs } from '@/components/tabs';
import { NessLogo } from '@/components/ness-logo';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Users,
  FileText,
  LogOut,
  UserPlus,
  Upload,
  Trash2,
} from 'lucide-react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([
    { id: '1', email: 'admin@ness.dev', name: 'Administrador', role: 'admin' },
  ]);
  const [documents, setDocuments] = useState<
    Array<{ id: string; name: string; path: string }>
  >([]);
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = (users.length + 1).toString();
    setUsers([
      ...users,
      { id: newId, email: newUser.email, name: newUser.name, role: 'user' },
    ]);
    setNewUser({ email: '', name: '', password: '' });
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadFile) {
      const newDoc = {
        id: (documents.length + 1).toString(),
        name: uploadFile.name,
        path: `/docs/${uploadFile.name}`,
      };
      setDocuments([...documents, newDoc]);
      setUploadFile(null);
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <NessLogo size="md" />
            <span className="text-muted-foreground">Painel Administrativo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {session.user?.email}
            </span>
            <ModeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e documentos da plataforma Ness
          </p>
        </div>

        <Tabs
          defaultValue="users"
          tabs={[
            {
              label: 'Usuários',
              value: 'users',
              icon: <Users className="h-4 w-4" />,
              content: (
                <div className="space-y-6">
                  {/* Create User Form */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Criar Novo Usuário
                    </h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="name">Nome</Label>
                          <Input
                            id="name"
                            value={newUser.name}
                            onChange={(e) =>
                              setNewUser({ ...newUser, name: e.target.value })
                            }
                            placeholder="Nome do usuário"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) =>
                              setNewUser({ ...newUser, email: e.target.value })
                            }
                            placeholder="email@exemplo.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Senha</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) =>
                              setNewUser({
                                ...newUser,
                                password: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" variant="primary">
                        Criar Usuário
                      </Button>
                    </form>
                  </div>

                  {/* Users List */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Usuários Cadastrados
                    </h2>
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-ness-blue/20 text-ness-blue">
                              {user.role}
                            </span>
                            {user.role !== 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: 'Documentos',
              value: 'documents',
              icon: <FileText className="h-4 w-4" />,
              content: (
                <div className="space-y-6">
                  {/* Upload Document Form */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Fazer Upload de Documento
                    </h2>
                    <form onSubmit={handleUploadDocument} className="space-y-4">
                      <div>
                        <Label htmlFor="document">Arquivo MDX</Label>
                        <Input
                          id="document"
                          type="file"
                          accept=".mdx,.md"
                          onChange={(e) =>
                            setUploadFile(e.target.files?.[0] || null)
                          }
                          required
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Aceita apenas arquivos .mdx ou .md
                        </p>
                      </div>
                      <Button type="submit" variant="primary" disabled={!uploadFile}>
                        Fazer Upload
                      </Button>
                    </form>
                  </div>

                  {/* Documents List */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Documentos Carregados
                    </h2>
                    {documents.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhum documento carregado ainda
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                          >
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.path}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </main>
    </div>
  );
}
