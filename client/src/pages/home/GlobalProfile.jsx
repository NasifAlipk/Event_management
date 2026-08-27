import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Pencil } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/home/Header";

export default function GlobalProfile() {
  const { user } = useAuth();
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "Eventora member";

  return (
    <><Header /><main className="min-h-screen bg-[#0f172b] px-5 pb-12 pt-24 text-white sm:px-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
        <div className="h-36 bg-gradient-to-r from-indigo-900 via-purple-900 to-[#173d38]" />
        <div className="px-6 pb-8 sm:px-10">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-[#0f172b] bg-[#00ff85] text-3xl font-bold text-black">{(user?.username || "E").charAt(0).toUpperCase()}</div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"><Pencil size={15} /> Back to dashboard</Link>
          </div>
          <h1 className="mt-5 text-3xl font-semibold">{name}</h1>
          <p className="mt-1 text-gray-400">@{user?.username || "member"}</p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm text-gray-400"><span className="inline-flex items-center gap-2"><CalendarDays size={16} /> Eventora member</span><span className="inline-flex items-center gap-2"><MapPin size={16} /> Ready to explore</span></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-black/20 p-5"><p className="text-2xl font-semibold text-[#00ff85]">0</p><p className="text-sm text-gray-400">Events joined</p></div><div className="rounded-xl bg-black/20 p-5"><p className="text-2xl font-semibold text-[#00ff85]">0</p><p className="text-sm text-gray-400">Events organized</p></div><div className="rounded-xl bg-black/20 p-5"><p className="text-2xl font-semibold text-[#00ff85]">0</p><p className="text-sm text-gray-400">Connections</p></div></div>
        </div>
      </div>
    </main></>
  );
}
