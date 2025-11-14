/**
 * Auth Guard Component
 * 
 * Componente para proteger rotas baseado em permissões
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getUserPermissions } from '@/lib/supabase/permissions-client';
import { showError } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSuperadmin?: boolean;
  requireOrgAdmin?: boolean;
  requireRole?: 'orgadmin' | 'admin' | 'editor' | 'viewer';
  organizationId?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireSuperadmin = false,
  requireOrgAdmin = false,
  requireRole,
  organizationId,
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [requireAuth, requireSuperadmin, requireOrgAdmin, requireRole, organizationId]);

  const checkAccess = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Se não requer autenticação, permitir acesso
      if (!requireAuth) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Se requer autenticação mas não há usuário, redirecionar
      if (!user) {
        router.push('/login');
        return;
      }

      // Verificar permissões
      const userPermissions = await getUserPermissions(organizationId);
      
      // Importar isSuperadmin dinamicamente para verificar
      const { isSuperadmin: checkIsSuperadmin } = await import('@/lib/supabase/permissions-client');

      // Verificar superadmin
      if (requireSuperadmin) {
        const isSuper = await checkIsSuperadmin();
        if (!isSuper) {
          showError('Acesso negado. Requer permissões de superadmin.');
          router.push('/config');
          return;
        }
      }

      // Verificar orgadmin
      if (requireOrgAdmin) {
        if (!userPermissions.isOrgAdmin && !userPermissions.isSuperadmin) {
          showError('Acesso negado. Requer permissões de administrador da organização.');
          router.push('/config');
          return;
        }
      }

      // Verificar role específico
      if (requireRole) {
        const roleHierarchy: Record<string, number> = {
          viewer: 1,
          editor: 2,
          admin: 3,
          orgadmin: 4,
          superadmin: 5,
        };

        const userRoleLevel = userPermissions.role ? roleHierarchy[userPermissions.role] : 0;
        const requiredRoleLevel = roleHierarchy[requireRole];

        if (userRoleLevel < requiredRoleLevel && !userPermissions.isSuperadmin) {
          showError(`Acesso negado. Requer permissões de ${requireRole} ou superior.`);
          router.push('/config');
          return;
        }
      }

      setHasAccess(true);
    } catch (error) {
      logger.error('Error checking access', error);
      showError('Erro ao verificar permissões');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

