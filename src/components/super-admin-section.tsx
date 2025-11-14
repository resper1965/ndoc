/**
 * Super Admin Section Component
 * 
 * Componente para mostrar link para página de administração (apenas superadmin)
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/button';
import { Shield, Settings } from 'lucide-react';
import { isSuperadmin } from '@/lib/supabase/permissions-client';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

export function SuperAdminSection() {
  const [isSuper, setIsSuper] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const superAdmin = await isSuperadmin();
      setIsSuper(superAdmin);
    } catch (error) {
      logger.error('Error checking superadmin', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isSuper) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-6 border border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-heading font-semibold mb-1">Administração do Sistema</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Acesse a página de administração para gerenciar organizações e usuários do sistema.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push('/admin')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Ir para Administração
        </Button>
      </div>
    </section>
  );
}

