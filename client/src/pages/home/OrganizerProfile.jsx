import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileEditor from "../../components/home/ProfileEditor";
import { eventsApi } from "../../services/events";

function EventCard({ event }) {
  return <Link to={`/events/${event.id}`} className="flex gap-4 rounded-xl border border-white/10 bg-[#202b3b] p-3 transition hover:border-[#00ff85]/50"><div className="h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-black"><img src={event.main_banner} alt={event.title} className="h-full w-full object-contain" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="truncate font-semibold">{event.title}</h3><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${event.status === "APPROVED" ? "bg-emerald-400/15 text-emerald-300" : event.status === "REJECTED" ? "bg-red-400/15 text-red-300" : "bg-amber-400/15 text-amber-300"}`}>{event.status === "PENDING" ? "Pending Approval" : event.status}</span></div><p className="mt-1 text-xs text-[#00ff85]">{event.category}</p><div className="mt-2 grid gap-1 text-xs text-slate-400 sm:grid-cols-2"><span className="inline-flex items-center gap-1"><CalendarDays size={12} />{event.start_date}</span><span className="inline-flex items-center gap-1"><Clock3 size={12} />{event.start_time}</span><span className="inline-flex items-center gap-1 sm:col-span-2"><MapPin size={12} />{event.venue_name}, {event.city}</span></div></div></Link>;
}

export default function OrganizerProfile() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { eventsApi.organizer().then(({ data }) => setEvents(data.events || [])).finally(() => setLoading(false)); }, []);
  const pending = useMemo(() => events.filter((event) => event.status === "PENDING"), [events]);
  return <ProfileEditor stats={[{ label: "Organized Events", value: events.length, icon: CalendarDays }, { label: "Approval Pending", value: pending.length, icon: Clock3 }]}><div className="space-y-5"><section className="rounded-2xl border border-white/10 bg-[#171e2b] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Organized Events</h2><Link to="/events/add" className="inline-flex items-center gap-2 rounded-lg bg-[#00ff85] px-3 py-2 text-sm font-semibold text-black"><PlusCircle size={16} /> Add event</Link></div><div className="mt-5 space-y-3">{loading ? <p className="p-6 text-center text-sm text-slate-400">Loading your events...</p> : events.length ? events.map((event) => <EventCard key={event.id} event={event} />) : <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">You have not created any events yet.</p>}</div></section><section className="rounded-2xl border border-white/10 bg-[#171e2b] p-5"><h2 className="text-lg font-semibold">Approval Pending</h2><div className="mt-5 space-y-3">{pending.length ? pending.map((event) => <EventCard key={event.id} event={event} />) : <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">No events are waiting for approval.</p>}</div></section></div></ProfileEditor>;
}
