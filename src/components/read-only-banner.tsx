'use client';

/**
 * Read Only Banner
 * 
 * Banner exibido quando o usuário está em modo leitura (não autenticado)
 */

import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export function ReadOnlyBanner() {
  const { user, loading } = useAuth();

  // Não mostrar se estiver carregando ou se estiver autenticado
  if (loading || user) {
    return null;
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
      <div className="container mx-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <AlertCircle className="w-4 h-4" />
        <span>
          Você está em modo leitura.{' '}
          <Link
            href="/login"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Faça login
          </Link>{' '}
          para editar documentos.
        </span>
      </div>
    </div>
  );
}

