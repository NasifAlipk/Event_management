import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function AdminProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading)
    return (
      <main className="grid min-h-screen place-items-center bg-[#0f0c29] text-gray-300">
        Restoring admin session…
      </main>
    );
  if (!user)
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  if (user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
