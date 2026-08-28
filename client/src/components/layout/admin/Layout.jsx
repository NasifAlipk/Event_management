import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UserRound, LogOut } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export default function Layout({ children }) {
  const { logout } = useAuth();
  const location = useLocation();
  const item = (path, label, Icon) => (
    <Link
      to={path}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 ${location.pathname === path ? "bg-[#00ff85] text-black" : "text-gray-300 hover:bg-white/10"}`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
  return (
    <div className="flex min-h-screen bg-[#0f0c29] text-white">
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#15132c] p-5 md:block">
        <h2 className="mb-8 text-xl font-semibold text-[#00ff85]">
          Eventora Admin
        </h2>
        <nav className="space-y-2">
          {item("/admin", "Dashboard", LayoutDashboard)}
          {item("/admin/profile", "Profile", UserRound)}
        </nav>
        <button
          onClick={logout}
          className="mt-10 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-300 hover:bg-white/10"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
