import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Edit3,
  MapPin,
  PlusCircle,
  Ticket,
} from "lucide-react";
import { Link } from "react-router-dom";

import ProfileEditor from "../../components/home/ProfileEditor";
import { eventsApi } from "../../services/events";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Sidebar from "../../components/layout/profile/OrganizerProfile";

const formatTime = (value) => value ? value.slice(0, 5) : "—";

function EventCard({ event, onCancel }) {
  const cancelled = event.status === "CANCELLED";
  return (
    <div
      className={`flex gap-4 rounded-xl border p-3 transition ${cancelled ? "border-red-400/60 bg-red-950/20" : "border-white/10 bg-[#202b3b] hover:border-[#00ff85]/50"}`}
    >
      <div className="h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-black">
        <img
          src={event.main_banner}
          alt={event.title}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold">{cancelled ? event.title : <Link to={`/events/${event.id}`} className="hover:text-[#00ff85]">{event.title}</Link>}</h3>

          <div className="flex shrink-0 items-center gap-2">
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${
              event.status === "APPROVED"
                ? "bg-emerald-400/15 text-emerald-300"
                : event.status === "CANCELLED"
                  ? "bg-red-400/15 text-red-300"
                : event.status === "REJECTED"
                  ? "bg-red-400/15 text-red-300"
                  : "bg-amber-400/15 text-amber-300"
            }`}
          >
            {event.status === "PENDING"
              ? "Pending Approval"
              : event.status === "CANCELLED"
                ? "Cancelled"
              : event.status}
          </span>
          {!cancelled && <Link to={`/events/edit/${event.id}`} onClick={(click) => click.stopPropagation()} className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-[#00ff85]" title="Edit event"><Edit3 size={15} /></Link>}
          {!cancelled && <button type="button" onClick={(click) => { click.preventDefault(); click.stopPropagation(); onCancel(event); }} className="rounded-md px-2 py-1.5 text-xs text-red-300 hover:bg-red-400/10" title="Cancel event">Cancel</button>}
          </div>
        </div>

        <p className="mt-1 text-xs text-[#00ff85]">
          {event.category}
        </p>

        <div className="mt-2 grid gap-1 text-xs text-slate-400 sm:grid-cols-2">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={12} />
            {event.start_date}
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock3 size={12} />
            {formatTime(event.start_time)}
          </span>

          <span className="inline-flex items-center gap-1 sm:col-span-2">
            <MapPin size={12} />
            {event.venue_name}, {event.city}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerProfile() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCancel, setSelectedCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    eventsApi
      .organizer()
      .then(({ data }) => setEvents(data.events || []))
      .finally(() => setLoading(false));
  }, []);

  const cancelEvent = async () => {
    if (!selectedCancel) return;
    setCancelling(true);
    setError("");
    try {
      const { data } = await eventsApi.cancel(selectedCancel.id);
      setEvents((current) => current.map((event) => event.id === selectedCancel.id ? data.event : event));
      setSelectedCancel(null);
      setMessage("Event cancelled successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to cancel this event.");
    } finally {
      setCancelling(false);
    }
  };

  const pending = useMemo(
    () => events.filter((event) => event.status === "PENDING"),
    [events]
  );

  return (
    <ProfileEditor
      Sidebar={Sidebar}
      stats={[
        {
          label: "Organized Events",
          value: events.length,
          icon: CalendarDays,
        },
        {
          label: "Approval Pending",
          value: pending.length,
          icon: Clock3,
        },
      ]}
    >
      {(message || error) && <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-400/30 bg-red-400/10 text-red-200" : "border-[#00ff85]/30 bg-[#00ff85]/10 text-[#00ff85]"}`}>{error || message}</div>}
      <div className="space-y-5">
        <section className="rounded-2xl border border-white/10 bg-[#171e2b] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Organized Events
            </h2>

            <Link
              to="/events/add"
              className="inline-flex items-center gap-2 rounded-lg bg-[#00ff85] px-3 py-2 text-sm font-semibold text-black"
            >
              <PlusCircle size={16} />
              Add event
            </Link>
            <Link to="/coupons/add" className="inline-flex items-center gap-2 rounded-lg border border-[#00ff85]/40 px-3 py-2 text-sm font-semibold text-[#00ff85] hover:bg-[#00ff85]/10"><Ticket size={16} /> Add coupon</Link>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="p-6 text-center text-sm text-slate-400">
                Loading your events...
              </p>
            ) : events.length ? (
                events.map((event) => (
                <EventCard key={event.id} event={event} onCancel={setSelectedCancel} />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                You have not created any events yet.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#171e2b] p-5">
          <h2 className="text-lg font-semibold">
            Approval Pending
          </h2>

          <div className="mt-5 space-y-3">
            {pending.length ? (
              pending.map((event) => (
                <EventCard key={event.id} event={event} onCancel={setSelectedCancel} />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                No events are waiting for approval.
              </p>
            )}
          </div>
        </section>
      </div>
      {selectedCancel && <ConfirmModal type="approve" title="Cancel Event?" message={`Are you sure you want to cancel “${selectedCancel.title}”? Cancelled events cannot be edited or published.`} confirmLabel="Cancel event" loading={cancelling} onCancel={() => !cancelling && setSelectedCancel(null)} onConfirm={cancelEvent} />}
    </ProfileEditor>
  );
}
