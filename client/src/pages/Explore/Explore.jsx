import { useState } from "react";
import { CalendarPlus, ChevronDown, Filter, Search, SlidersHorizontal } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import ExploreLayout from "../../components/layout/Explore/Layout";

const filters = ["Category", "Type", "Date"];

export default function Explore() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const isOrganizer = user?.role === "ORGANIZER";

  return (
    <ExploreLayout>
      <main className="px-4 pb-16 pt-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <section className="flex flex-wrap items-end justify-between gap-8 py-10 sm:py-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.25em] text-[#00ff85]">Discover experiences</p>
              <h1 className="mt-3 text-4xl font-light sm:text-6xl"><span className="bg-[#00ff85] px-2 font-normal text-black">Explore</span> Events</h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">Find events, workshops, and experiences happening around you.</p>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:block"><SlidersHorizontal className="text-[#00ff85]" size={28} /><p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Live discovery</p><p className="mt-1 text-sm text-slate-300">New experiences are on the way.</p></div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-xl sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <label className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#0d1418] px-4 text-slate-400"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events..." className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600" /></label>
              <button type="button" className="rounded-xl bg-[#00ff85] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#00d970]">Search</button>
              <div className="flex flex-wrap gap-2">{filters.map((label) => <button key={label} type="button" className="inline-flex items-center justify-between gap-6 rounded-xl border border-white/10 bg-[#0d1418] px-4 py-3 text-sm text-slate-300 hover:border-[#00ff85]/40"><span>{label}</span><ChevronDown size={15} /></button>)}<button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[#00ff85]/30 px-4 py-3 text-sm text-[#00ff85] hover:bg-[#00ff85]/10"><Filter size={15} /> Filters</button></div>
            </div>
          </section>

          <div className="mt-7 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming events</h2>
            {isOrganizer && <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-[#00ff85] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#00d970]"><CalendarPlus size={17} /> Add Event</button>}
          </div>

          <section className="mt-5 grid min-h-80 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <div><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#00ff85]/10 text-[#00ff85]"><CalendarPlus size={28} /></div><h3 className="mt-5 text-xl font-semibold">No events available yet</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">There are no published events to show right now. Check back soon for new Eventora experiences.</p>{query && <p className="mt-3 text-xs text-slate-500">No results for “{query}”.</p>}</div>
          </section>
        </div>
      </main>
    </ExploreLayout>
  );
}
