import RolePanel from '../../components/dashboard/RolePanel';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-sm text-slate-500">
        Welcome back,
      </p>

      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        {user.first_name || user.username}
      </h1>

      <div className="mt-8">
        <RolePanel role={user.role} />
      </div>
    </main>
  );
}