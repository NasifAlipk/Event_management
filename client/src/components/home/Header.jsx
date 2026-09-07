import { Bell, Compass, LogOut, MessageCircle, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Eventoraslip from "../../assets/images/Eventoraslip.png";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const signOut = async () => {
    await logout();
    setOpen(false);
    navigate("/login");
  };
  const name = user?.first_name || user?.username || "User";
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#171425]/80 px-4 py-2 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          to={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 text-lg font-semibold text-white"
        >
          <img
            src={Eventoraslip}
            alt="Eventora"
            className="h-11 w-11 object-contain"
          />
          <span>Eventora</span>
        </Link>
        <nav className="hidden items-center gap-7 rounded-full border border-white/15 bg-black/20 px-6 py-2 text-sm text-white/85 md:flex">
          <Link to={user ? "/dashboard" : "/"} className="hover:text-[#00ff85]">
            Home
          </Link>
          <Link to="/events" className="hover:text-[#00ff85]">
            <Compass className="mr-1 inline" size={16} /> Explore
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                className="hidden text-white/80 hover:text-[#00ff85] sm:block"
                aria-label="Notifications"
              >
                <Bell size={20} />
              </button>
              <button
                className="hidden text-white/80 hover:text-[#00ff85] sm:block"
                aria-label="Messages"
              >
                <MessageCircle size={20} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 rounded-lg bg-[#00ff85] px-2 py-1 text-left text-black"
                >
                  <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-black/15">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound size={18} />
                    )}
                  </span>
                  <span className="hidden max-w-28 sm:block">
                    <span className="block truncate text-sm font-semibold">
                      {name}
                    </span>
                    <span className="block max-w-28 truncate text-xs opacity-70">
                      {user.email}
                    </span>
                  </span>
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/15 bg-[#1e1e1e] p-2 shadow-xl">
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="block rounded px-3 py-2 text-sm text-white hover:bg-white/10"
                    >
                      View profile
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-300 hover:bg-white/10"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-[#00ff85] px-4 py-2 text-sm font-semibold text-black"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
