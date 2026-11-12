import { LogOut, UserRound, Wallet } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";

export default function UserProfileLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isProfile = location.pathname === "/profile";
  const isWallet = location.pathname === "/wallet";

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="hidden rounded-2xl border border-white/10 bg-[#171e2b] p-5 lg:block">
      <p className="text-xs uppercase tracking-[.25em] text-[#00ff85]">
        Account
      </p>

      <nav className="mt-7 space-y-2">
        <Link
          to="/profile"
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold ${isProfile ? "bg-[#00ff85] text-black" : "text-slate-300 hover:bg-white/10 hover:text-[#00ff85]"}`}
        >
          <UserRound size={16} />
          Profile
        </Link>

        <Link to="/wallet" className={`flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left font-semibold ${isWallet ? "bg-[#00ff85] text-black" : "text-slate-300 hover:bg-white/10 hover:text-[#00ff85]"}`}>
          <Wallet size={16} />
          Wallet
        </Link>

        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left text-red-300 hover:bg-red-400/10"
        >
          <LogOut size={16} />
          Logout
        </button>
      </nav>
    </aside>
  );
}
