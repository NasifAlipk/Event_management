import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Ticket as TicketIcon } from "lucide-react";

import DigitalTicket from "../booking/DigitalTicket";
import ProfileEditor from "../../components/home/ProfileEditor";
import Sidebar from "../../components/layout/profile/UserProfile";
import { ticketsApi } from "../../services/tickets";

const formatTime = (value) => {
  if (!value) return "Time to be announced";
  const [hours, minutes] = value.split(":").map(Number);
  return Number.isNaN(hours) ? value : new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
};

function BookingCard({ booking, onMore }) {
  const ticket = booking.ticket;
  return (
    <article className="flex gap-4 rounded-xl border border-white/10 bg-[#202b3b] p-3 transition hover:border-[#00ff85]/50">
      <div className="h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-black">{ticket.event_image && <img src={ticket.event_image} alt={ticket.event_name} className="h-full w-full object-cover" />}</div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{ticket.event_name}</h3>
        <div className="mt-2 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
          <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{ticket.event_date}</span>
          <span className="inline-flex items-center gap-1"><Clock3 size={12} />{formatTime(ticket.event_time)}</span>
          <span className="sm:col-span-2">{booking.ticket_types} · {booking.ticket_count} ticket{booking.ticket_count === 1 ? "" : "s"}</span>
        </div>
      </div>
      <button type="button" onClick={() => onMore(booking)} className="self-center rounded-lg bg-[#00ff85] px-3 py-2 text-xs font-semibold text-black hover:bg-[#00d970]">More</button>
    </article>
  );
}

function BookingSection({ title, icon: Icon, bookings, message, onMore }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#171e2b] p-5">
      <div className="flex items-center gap-2"><Icon className="text-[#00ff85]" size={20} /><h2 className="text-lg font-semibold">{title}</h2></div>
      <div className="mt-5 space-y-3">{bookings.length ? bookings.map((booking) => <BookingCard key={booking.id} booking={booking} onMore={onMore} />) : <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">{message}</p>}</div>
    </section>
  );
}

export default function UserProfile() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ tickets_booked: 0, events_attended: 0 });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => ticketsApi.profile().then(({ data }) => { setBookings(data.bookings || []); setStats(data); setError(""); }).catch(() => setError("Unable to load your ticket activity.")).finally(() => setLoading(false));
    load();
    const refresh = window.setInterval(load, 60_000);
    return () => window.clearInterval(refresh);
  }, []);

  const booked = bookings.filter((booking) => !booking.attended);
  const attended = bookings.filter((booking) => booking.attended);

  return (
    <ProfileEditor Sidebar={Sidebar} stats={[{ label: "Tickets Booked", value: stats.tickets_booked, icon: TicketIcon }, { label: "Events Attended", value: stats.events_attended, icon: CalendarDays }]}>
      {error && <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      {loading ? <p className="rounded-2xl border border-white/10 bg-[#171e2b] p-10 text-center text-sm text-slate-400">Loading your tickets...</p> : <div className="grid gap-5 xl:grid-cols-2"><BookingSection title="Booked Tickets" icon={TicketIcon} bookings={booked} message="Your upcoming booked tickets will appear here." onMore={setSelected} /><BookingSection title="Participated Events" icon={CalendarDays} bookings={attended} message="Your attended events will appear here." onMore={setSelected} /></div>}
      {selected && <DigitalTicket ticket={selected.ticket} totalTickets={selected.ticket_count} onClose={() => setSelected(null)} />}
    </ProfileEditor>
  );
}
