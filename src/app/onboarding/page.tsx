/**
 * Wizard de Onboarding do Org-Admin
 * 5 etapas: revisar org, configurar IA, criar KB, upload documento, testar chat
 */

'use client';

import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { Button } from '@/components/button';
import { showSuccess } from '@/lib/toast';

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    showSuccess('Onboarding completo!');
    router.push('/docs');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            🎯 Bem-vindo ao nDocs!
          </h1>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
            <p className="text-center">Wizard de onboarding em construção...</p>
            <Button onClick={handleComplete} className="mt-4 mx-auto block">
              Pular Onboarding
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
