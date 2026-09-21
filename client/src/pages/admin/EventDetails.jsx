import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Layout from "../../components/layout/admin/Layout";
import { eventsApi } from "../../services/events";

export default function EventDetails() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    eventsApi
      .adminEvent(eventId)
      .then(({ data }) => setEvent(data.event))
      .catch(() => setError("Unable to load event details."));
  }, [eventId]);

  if (!event) {
    return (
      <Layout>
        <main className="min-h-screen bg-[#0f0c29] p-10 text-slate-400">
          {error || "Loading event details..."}
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="min-h-screen bg-[#0f0c29] px-5 py-8 text-white sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#00ff85]"
          >
            <ArrowLeft size={16} />
            Back to events
          </Link>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">
                Event details
              </p>

              <h1 className="mt-2 text-3xl font-light">
                {event.title}
              </h1>

              <p className="mt-2 text-slate-400">
                Submitted by {event.organizer_name}
              </p>
            </div>

            <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-sm text-amber-300">
              {event.status}
            </span>
          </div>

          <img
            src={event.main_banner}
            alt={event.title}
            className="mt-7 h-72 w-full rounded-2xl border border-white/10 object-cover"
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <CalendarDays className="text-[#00ff85]" />

              <p className="mt-4 text-xs uppercase text-slate-500">
                Date
              </p>

              <p className="mt-1 text-sm">
                {event.start_date} to {event.end_date}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <Clock3 className="text-[#00ff85]" />

              <p className="mt-4 text-xs uppercase text-slate-500">
                Time
              </p>

              <p className="mt-1 text-sm">
                {event.start_time} – {event.end_time}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <MapPin className="text-[#00ff85]" />

              <p className="mt-4 text-xs uppercase text-slate-500">
                Venue
              </p>

              <p className="mt-1 text-sm">
                {event.venue_name}, {event.city}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <Users className="text-[#00ff85]" />

              <p className="mt-4 text-xs uppercase text-slate-500">
                Capacity
              </p>

              <p className="mt-1 text-sm">
                {event.max_participants}
              </p>
            </div>
          </div>

          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-semibold">
              Description
            </h2>

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">
              {event.description}
            </p>

            <h2 className="mt-7 text-xl font-semibold">
              Ticket details
            </h2>

            <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <p>
                Regular: ₹{event.regular_price} ({event.regular_quantity})
              </p>

              <p>
                VIP: ₹{event.vip_price} ({event.vip_quantity})
              </p>

              <p>
                Premium: ₹{event.premium_price} ({event.premium_quantity})
              </p>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}