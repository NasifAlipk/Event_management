import { LogOut, Wallet, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export default function UserProfileLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => { await logout(); navigate("/login", { replace: true }); };
  return <aside className="hidden rounded-2xl border border-white/10 bg-[#171e2b] p-5 lg:block"><p className="text-xs uppercase tracking-[.25em] text-[#00ff85]">Account</p><nav className="mt-7 space-y-2"><a href="#profile" className="flex items-center gap-2 rounded-lg bg-[#00ff85] px-4 py-2.5 font-semibold text-black"><UserRound size={16} /> Profile</a><button type="button" disabled className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left text-slate-500"><Wallet size={16} /> Wallet</button><button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-left text-red-300 hover:bg-red-400/10"><LogOut size={16} /> Logout</button></nav></aside>;
}
