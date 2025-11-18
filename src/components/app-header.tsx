'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Users,
  Book,
  Plus,
  Search,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/button';
import { ModeToggle } from '@/components/mode-toggle';
import { BrandingText } from '@/components/branding-text';
import { getDisplayLogo } from '../../config/branding';
import { useAuth } from '@/hooks/use-auth';
import { useState, useRef, useEffect } from 'react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${active
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        }
      `}
    >
      {icon}
      {children}
    </Link>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Navegação Principal */}
          <div className="flex items-center gap-6">
            {/* Logo */}
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
              <BrandingText className="text-lg font-semibold" />
            </Link>

            {/* Navegação */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem
                href="/app"
                icon={<Home className="h-4 w-4" />}
                active={pathname === '/app'}
              >
                Dashboard
              </NavItem>
              <NavItem
                href="/app/documents"
                icon={<FileText className="h-4 w-4" />}
                active={pathname.startsWith('/app/documents')}
              >
                Documentos
              </NavItem>
              <NavItem
                href="/app/team"
                icon={<Users className="h-4 w-4" />}
                active={pathname.startsWith('/app/team')}
              >
                Equipe
              </NavItem>
              <NavItem
                href="/docs"
                icon={<Book className="h-4 w-4" />}
                active={false}
              >
                Ver Docs
              </NavItem>
            </nav>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3">
            {/* Busca */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-slate-500"
              onClick={() => {
                // TODO: Abrir SemanticSearchDialog
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                document.dispatchEvent(event);
              }}
            >
              <Search className="h-4 w-4" />
              <span className="text-xs">Ctrl+K</span>
            </Button>

            {/* Novo Documento */}
            <Link href="/app/documents/new">
              <Button variant="primary" size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo</span>
              </Button>
            </Link>

            {/* Mode Toggle */}
            <ModeToggle />

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {user?.email || 'Usuário'}
                    </p>
                  </div>
                  <Link
                    href="/app/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Configurações
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
