import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Ticket as TicketIcon } from "lucide-react";

import DigitalTicket from "../booking/DigitalTicket";
import ProfileEditor from "../../components/home/ProfileEditor";
import Sidebar from "../../components/layout/profile/UserProfile";
import { ticketsApi } from "../../services/tickets";
import ConfirmModal from "../../components/ui/ConfirmModal";

const formatTime = (value) => {
  if (!value) return "Time to be announced";
  const [hours, minutes] = value.split(":").map(Number);
  return Number.isNaN(hours)
    ? value
    : new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(2000, 0, 1, hours, minutes));
};

function BookingCard({ booking, onMore, onCancel }) {
  const ticket = booking.ticket;

  return (
    <article className={`flex gap-4 rounded-xl border p-3 transition ${booking.cancelled ? "border-red-400/50 bg-red-950/25" : "border-white/10 bg-[#202b3b] hover:border-[#00ff85]/50"}`}>
      <div className="h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-black">
        {ticket.event_image && (
          <img
            src={ticket.event_image}
            alt={ticket.event_name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><h3 className="truncate font-semibold">{ticket.event_name}</h3>{booking.cancelled && <span className="rounded-full bg-red-400/15 px-2 py-1 text-[10px] font-semibold tracking-wide text-red-300">CANCELLED</span>}</div>
        <div className="mt-2 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={12} />
            {ticket.event_date}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={12} />
            {formatTime(ticket.event_time)}
          </span>
          <span className="sm:col-span-2">
            {booking.ticket_types} · {booking.ticket_count} ticket
            {booking.ticket_count === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 self-center">
        <button type="button" onClick={() => onMore(booking)} className="rounded-lg bg-[#00ff85] px-3 py-2 text-xs font-semibold text-black hover:bg-[#00d970]">More</button>
        {booking.can_cancel && <button type="button" onClick={() => onCancel(booking)} className="rounded-lg border border-red-400/40 px-3 py-2 text-xs text-red-300 hover:bg-red-400/10">Cancel Ticket</button>}
      </div>
    </article>
  );
}

function BookingSection({ title, icon: Icon, bookings, message, onMore, onCancel }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#171e2b] p-5">
      <div className="flex items-center gap-2">
        <Icon className="text-[#00ff85]" size={20} />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="mt-5 space-y-3">
        {bookings.length ? (
          bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onMore={onMore} onCancel={onCancel} />
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}

export default function UserProfile() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ tickets_booked: 0, events_attended: 0 });
  const [selected, setSelected] = useState(null);
  const [selectedCancel, setSelectedCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () =>
      ticketsApi
        .profile()
        .then(({ data }) => {
          setBookings(data.bookings || []);
          setStats(data);
          setError("");
        })
        .catch(() => setError("Unable to load your ticket activity."))
        .finally(() => setLoading(false));

    load();
    const refresh = window.setInterval(load, 60_000);
    return () => window.clearInterval(refresh);
  }, []);

  const booked = bookings.filter((booking) => !booking.attended);
  const attended = bookings.filter((booking) => booking.attended);

  const cancelBooking = async () => {
    if (!selectedCancel) return;
    setCancelling(true);
    setError("");
    try {
      await ticketsApi.cancelBooking(selectedCancel.id);
      setSelectedCancel(null);
      setMessage("Ticket booking cancelled successfully.");
      const { data } = await ticketsApi.profile();
      setBookings(data.bookings || []);
      setStats(data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to cancel this ticket booking.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <ProfileEditor
      Sidebar={Sidebar}
      stats={[
        { label: "Tickets Booked", value: stats.tickets_booked, icon: TicketIcon },
        { label: "Events Attended", value: stats.events_attended, icon: CalendarDays },
      ]}
    >
      {error && (
        <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}
      {message && <p className="mb-4 rounded-xl border border-[#00ff85]/30 bg-[#00ff85]/10 px-4 py-3 text-sm text-[#00ff85]">{message}</p>}

      {loading ? (
        <p className="rounded-2xl border border-white/10 bg-[#171e2b] p-10 text-center text-sm text-slate-400">
          Loading your tickets...
        </p>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <BookingSection
            title="Booked Tickets"
            icon={TicketIcon}
            bookings={booked}
            message="Your upcoming booked tickets will appear here."
            onMore={setSelected}
            onCancel={setSelectedCancel}
          />
          <BookingSection
            title="Participated Events"
            icon={CalendarDays}
            bookings={attended}
            message="Your attended events will appear here."
            onMore={setSelected}
            onCancel={setSelectedCancel}
          />
        </div>
      )}

      {selected && (
        <DigitalTicket
          ticket={selected.ticket}
          totalTickets={selected.ticket_count}
          onClose={() => setSelected(null)}
        />
      )}
      {selectedCancel && <ConfirmModal type="cancel" title="Cancel Ticket?" message="Are you sure you want to cancel this ticket? Once cancelled, this action cannot be undone. Your applicable refund will be processed according to the refund policy." confirmLabel="Yes, Cancel Ticket" cancelLabel="Keep Ticket" loading={cancelling} onCancel={() => !cancelling && setSelectedCancel(null)} onConfirm={cancelBooking} />}
    </ProfileEditor>
  );
}
