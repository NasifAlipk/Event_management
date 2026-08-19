import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-500">
        Loading…
      </main>
    );
  }

  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <main className="grid min-h-screen place-items-center bg-linear-to-br from-brand-50 via-white to-sky-50 p-5">
      <Outlet />
    </main>
  );
}