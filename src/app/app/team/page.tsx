import { UserManagementSection } from '@/components/user-management-section';

export const dynamic = 'force-dynamic';

export default function TeamPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Equipe</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Gerencie os membros da sua organização
        </p>
      </div>

      {/* User Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
        <UserManagementSection />
      </div>
    </div>
  );
}
