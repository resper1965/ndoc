'use client';

import { UserManagementSection } from '@/components/user-management-section';

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Equipe</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gerencie membros da sua organização
        </p>
      </div>
      <UserManagementSection />
    </div>
  );
}

