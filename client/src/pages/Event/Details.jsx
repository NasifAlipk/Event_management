import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, MapPin, Ticket, Users, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ExploreLayout from "../../components/layout/Explore/Layout";
import { useAuth } from "../../hooks/useAuth";
import { eventsApi } from "../../services/events";

const formatDate = (value) => {
  if (!value) return "Date to be announced";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "Time to be announced";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
};

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { data } = await eventsApi.publishedEvent(eventId);
        setEvent(data.event);
      } catch {
        try {
          if (!user) throw new Error("Not signed in");
          const { data } = await eventsApi.organizerEvent(eventId);
          setEvent(data.event);
        } catch {
          setError("This event is no longer available.");
        }
      }
    };
    loadEvent();
  }, [eventId, user]);

  if (!event) {
    return (
      <ExploreLayout>
        <main className="min-h-screen bg-[#0b1116] px-5 pb-12 pt-28 text-slate-400">
          {error || "Loading event..."}
        </main>
      </ExploreLayout>
    );
  }

  const isOwner = Number(event.organizer) === Number(user?.id);
  const venue = [event.venue_name, event.city, event.state, event.country].filter(Boolean).join(", ");

  return (
    <ExploreLayout>
      <main className="min-h-screen bg-[#0b1116] px-4 pb-36 pt-24 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <Link to="/events" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#00f5a0]"><ArrowLeft size={16} />Back to Events</Link>
            <button type="button" onClick={() => navigate("/events")} className="grid h-11 w-11 place-items-center rounded-full border border-slate-500/60 bg-slate-800/60 text-slate-100 transition hover:border-[#00f5a0] hover:text-[#00f5a0]" aria-label="Close event details"><X size={23} /></button>
          </div>

          <section className="mt-5 grid gap-8 border-b border-slate-700/70 pb-8 lg:grid-cols-[350px_1fr] lg:gap-10">
            <div className="flex min-h-[430px] items-center justify-center overflow-hidden rounded-xl border border-slate-600 bg-[#080d12] p-2">
              {event.main_banner ? <img src={event.main_banner} alt={event.title} className="h-full max-h-[530px] w-full object-contain" /> : <div className="grid h-full min-h-[410px] place-items-center text-slate-500"><Ticket size={42} /></div>}
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#00f5a0] px-4 py-1.5 text-sm text-[#00f5a0]"><Ticket size={17} />{event.category || "Event"}</span>
                {isOwner && event.status === "APPROVED" && <span className="rounded-full bg-[#00f5a0]/10 px-3 py-1.5 text-xs text-[#00f5a0]">Approved event</span>}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{event.title}</h1>
              <p className="mt-2 text-xl text-slate-300">{event.event_type || "Live Event"}</p>

              <div className="mt-8 space-y-5 text-base text-slate-200">
                <p className="flex items-center gap-4"><CalendarDays className="shrink-0" size={25} />{formatDate(event.start_date)}{event.end_date && event.end_date !== event.start_date ? ` – ${formatDate(event.end_date)}` : ""}</p>
                <p className="flex items-center gap-4"><Clock3 className="shrink-0" size={25} />{formatTime(event.start_time)}{event.end_time ? ` – ${formatTime(event.end_time)}` : ""}</p>
                <p className="flex items-center gap-4"><MapPin className="shrink-0" size={25} />{venue || "Venue to be announced"}</p>
                <p className="flex items-center gap-4"><Users className="shrink-0" size={25} />{event.max_participants || 0} Participants</p>
              </div>

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-700/80 pt-5">
                <div><p className="text-xs uppercase tracking-wider text-slate-500">Available seats</p><p className="mt-1 text-lg font-semibold text-[#00f5a0]">{Number(event.max_participants || 0).toLocaleString("en-IN")} total seats</p></div>
                <p className="text-right text-sm text-slate-400">{event.address || ""}</p>
              </div>
            </div>
          </section>

          <section className="py-8">
            <h2 className="text-2xl font-semibold">About This Event</h2>
            <p className="mt-3 max-w-5xl whitespace-pre-line text-base leading-7 text-slate-300">{event.description || "More information about this event will be available soon."}</p>
            {event.special_instructions && <div className="mt-7 border-t border-slate-700/70 pt-6"><h2 className="text-xl font-semibold">Important Information</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-400">{event.special_instructions}</p></div>}
          </section>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-700 bg-[#0b1116]/95 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div><p className="text-sm text-slate-300">Tickets from</p><p className="text-2xl font-semibold">{money(event.regular_price)}</p></div>
          <div className="flex items-center gap-3"><Link to="/events" className="hidden rounded-lg border border-slate-600 px-8 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-400 sm:block">Back</Link><Link to={`/booking/checkout/${event.id}`} className="inline-flex items-center gap-3 rounded-lg bg-[#00e692] px-7 py-3 text-sm font-semibold text-[#03110c] transition hover:bg-[#00f5a0] sm:min-w-64 sm:justify-center">Proceed to Checkout <ArrowRight size={19} /></Link></div>
        </div>
      </footer>
    </ExploreLayout>
  );
}
