import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <main className="grid min-h-screen place-items-center text-slate-500">Restoring your session…</main>
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
