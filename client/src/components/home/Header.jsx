import { Bell, Compass, LogOut, Menu, MessageCircle, UserRound, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import Eventoraslip from "../../assets/images/Eventoraslip.png";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const signOut = async () => { await logout(); setOpen(false); navigate("/login"); };
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#171425]/75 px-4 py-2 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-lg font-semibold text-white"><img src={Eventoraslip} alt="Eventora" className="h-11 w-11 object-contain" /><span>Eventora</span></Link>
        <nav className="hidden items-center gap-7 rounded-full border border-white/15 bg-black/20 px-6 py-2 text-sm text-white/85 md:flex"><Link to={user ? "/dashboard" : "/"} className="hover:text-[#00ff85]">Home</Link><Link to="/events" className="hover:text-[#00ff85]"><Compass className="mr-1 inline" size={16} /> Explore</Link>{user && <Link to="/profile" className="hover:text-[#00ff85]">Profile</Link>}</nav>
        <div className="flex items-center gap-3">{user ? <><button className="hidden text-white/80 hover:text-[#00ff85] sm:block" aria-label="Notifications"><Bell size={20} /></button><button className="hidden text-white/80 hover:text-[#00ff85] sm:block" aria-label="Messages"><MessageCircle size={20} /></button><button onClick={signOut} className="hidden items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10 sm:flex"><LogOut size={16} /> Sign out</button></> : <Link to="/login" className="rounded-lg bg-[#00ff85] px-4 py-2 text-sm font-semibold text-black hover:bg-[#00cc6a]">Login</Link>}<button className="text-white md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button></div>
      </div>
      {open && <div className="mx-auto mt-3 space-y-3 border-t border-white/10 py-4 text-white md:hidden"><Link className="block" to={user ? "/dashboard" : "/"} onClick={() => setOpen(false)}>Home</Link><Link className="block" to="/events" onClick={() => setOpen(false)}>Explore events</Link>{user && <Link className="block" to="/profile" onClick={() => setOpen(false)}>Profile</Link>}{user && <button onClick={signOut} className="flex items-center gap-2 text-red-300"><UserRound size={16} /> Sign out</button>}</div>}
    </header>
  );
}
