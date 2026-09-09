import { useState } from "react";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import IconButton from "../../ui/IconButton";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/customers": "Customers",
  "/admin/applications": "Applications",
  "/admin/profile": "Profile",
};

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(true);
  const title = pageTitles[location.pathname] || "Admin workspace";
  const initials = (user?.first_name || user?.username || "A")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#11102a]/95 px-4 py-3 backdrop-blur-xl sm:px-8">
      <div className="flex min-h-12 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open admin navigation"
          className="grid h-10 w-10 place-items-center rounded-xl text-slate-300 hover:bg-white/10 md:hidden"
        >
          <Menu size={20} />
        </button>
        <Link to="/admin" className="flex items-center gap-2 md:hidden">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#00ff85] text-sm font-black text-[#11102a]">
            E
          </span>
          <span className="font-semibold text-[#00ff85]">EventOra</span>
        </Link>
        <div className="hidden md:block">
          <p className="text-xs uppercase tracking-[0.22em] text-[#00ff85]">
            Admin panel
          </p>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <label className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-slate-400 lg:flex">
            <Search size={16} />
            <input
              aria-label="Search"
              placeholder="Search"
              className="w-36 bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
          <IconButton label="Notifications" badge="">
            <Bell size={18} />
          </IconButton>
          <IconButton
            label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          <Link
            to="/admin/profile"
            className="ml-1 flex items-center gap-2 rounded-xl border border-white/10 py-1 pl-1 pr-3 transition hover:border-[#00ff85]/40 hover:bg-white/[0.05]"
          >
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-[#00ff85] font-bold text-[#11102a]">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </span>
            <span className="hidden max-w-28 truncate text-sm font-medium text-white sm:block">
              {user?.first_name || user?.username || "Admin"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
