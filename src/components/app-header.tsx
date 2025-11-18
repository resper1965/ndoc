'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/button';
import { ModeToggle } from '@/components/mode-toggle';
import { BrandingText } from '@/components/branding-text';
import { getDisplayLogo } from '../../config/branding';
import Image from 'next/image';
import { 
  FileText, 
  Users, 
  Settings, 
  LayoutDashboard,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function AppHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/app/documents', label: 'Documentos', icon: FileText },
    { href: '/app/processing', label: 'Processamento', icon: RefreshCw },
    { href: '/app/team', label: 'Equipe', icon: Users },
    { href: '/app/settings', label: 'Configurações', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/app') {
      return pathname === '/app';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Branding */}
          <div className="flex items-center gap-4">
            <Link href="/app" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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

            {/* Navegação Principal */}
            <nav className="hidden md:flex items-center gap-1 ml-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "secondary" : "none"}
                      size="sm"
                      className={`flex items-center gap-2 ${
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-3">
            {/* Link para Documentação */}
            <Link href="/docs">
              <Button
                variant="none"
                size="sm"
                className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden lg:inline">Documentação</span>
              </Button>
            </Link>

            {/* Toggle de Tema */}
            <ModeToggle />

            {/* Avatar do Usuário */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <Button
                  variant="none"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Sair
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

