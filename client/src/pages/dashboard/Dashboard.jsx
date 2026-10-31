import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

import ExploreLayout from "../../components/layout/Explore/Layout";
import { useAuth } from "../../hooks/useAuth";
import { eventsApi } from "../../services/events";

const formatDate = (value) => {
  if (!value) return "Date to be announced";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "Time to be announced";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hours, minutes));
};

function ParticipatedEventCard({ event }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-[#00ff85]/50"
    >
      <div className="h-52 overflow-hidden bg-[#080d12]">
        {event.main_banner ? (
          <img
            src={event.main_banner}
            alt={event.title}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-500">
            <Ticket size={34} />
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs uppercase tracking-wider text-[#00ff85]">
          {event.category || "Event"}
        </p>
        <h3 className="mt-2 truncate text-xl font-semibold text-white">
          {event.title}
        </h3>
        <div className="mt-4 space-y-2 text-sm text-slate-400">
          <p className="flex items-center gap-2">
            <CalendarDays size={15} className="text-[#00ff85]" />
            {formatDate(event.start_date)}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 size={15} className="text-[#00ff85]" />
            {formatTime(event.start_time)}
          </p>
          <p className="flex items-center gap-2 truncate">
            <MapPin size={15} className="shrink-0 text-[#00ff85]" />
            {[event.venue_name, event.city].filter(Boolean).join(", ") || "Venue to be announced"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    eventsApi
      .participated()
      .then(({ data }) => {
        if (active) setEvents(data.events || []);
      })
      .catch(() => {
        if (active) {
          setEvents([]);
          setError("Participated events are not available yet.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <ExploreLayout>
      <main className="min-h-screen bg-[#0d1418] px-4 pb-16 pt-24 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <section className="flex flex-wrap items-end justify-between gap-8 py-10 sm:py-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.25em] text-[#00ff85]">
                Welcome back, {user?.first_name || user?.username || "there"}
              </p>
              <h1 className="mt-3 text-4xl font-light sm:text-6xl">
                My <span className="bg-[#00ff85] px-2 font-normal text-black">Participated Events</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
                Keep track of the Eventora experiences you have registered for.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <Ticket className="text-[#00ff85]" size={28} />
              <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Your activity</p>
              <p className="mt-1 text-sm text-slate-300">
                {events.length} registered {events.length === 1 ? "event" : "events"}
              </p>
            </div>
          </section>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Events</h2>
            <Link to="/events" className="text-sm text-[#00ff85] hover:underline">
              Explore events
            </Link>
          </div>

          {loading ? (
            <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-white/10 text-slate-400">
              Loading your events...
            </div>
          ) : events.length === 0 ? (
            <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <div>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#00ff85]/10 text-[#00ff85]">
                  <CalendarDays size={28} />
                </div>
                <h3 className="mt-5 text-xl font-semibold">No participated events yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Register for an event from Explore and it will appear here.
                </p>
                {error && <p className="mt-3 text-xs text-amber-300">{error}</p>}
                <Link to="/events" className="mt-5 inline-flex rounded-xl bg-[#00ff85] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#00d970]">
                  Browse events
                </Link>
              </div>
            </div>
          ) : (
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {events.map((event) => <ParticipatedEventCard key={event.id} event={event} />)}
            </section>
          )}
        </div>
      </main>
    </ExploreLayout>
  );
}
