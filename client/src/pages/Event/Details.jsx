import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import ExploreLayout from "../../components/layout/Explore/Layout";
import { eventsApi } from "../../services/events";

export default function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    eventsApi
      .publishedEvent(eventId)
      .then(({ data }) => setEvent(data.event))
      .catch(() => setError("This event is no longer available."));
  }, [eventId]);

  if (!event) {
    return (
      <ExploreLayout>
        <main className="min-h-screen px-5 pb-12 pt-28 text-slate-400">
          {error || "Loading event..."}
        </main>
      </ExploreLayout>
    );
  }

  return (
    <ExploreLayout>
      <main className="min-h-screen bg-[#0d1418] px-4 pb-16 pt-24 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#00ff85]"
          >
            <ArrowLeft size={16} />
            Back to Events
          </Link>

          <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">
            {event.title}
          </h1>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <img
              src={event.main_banner}
              alt={event.title}
              className="h-64 w-full object-cover sm:h-96"
            />

            <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <CalendarDays className="text-[#00ff85]" size={18} />

                <p className="mt-2 text-xs uppercase text-slate-500">
                  Date
                </p>

                <p className="mt-1 text-sm">
                  {event.start_date} to {event.end_date}
                </p>
              </div>

              <div>
                <Clock3 className="text-[#00ff85]" size={18} />

                <p className="mt-2 text-xs uppercase text-slate-500">
                  Time
                </p>

                <p className="mt-1 text-sm">
                  {event.start_time} – {event.end_time}
                </p>
              </div>

              <div>
                <MapPin className="text-[#00ff85]" size={18} />

                <p className="mt-2 text-xs uppercase text-slate-500">
                  Venue
                </p>

                <p className="mt-1 text-sm">
                  {event.venue_name}, {event.city}
                </p>
              </div>

              <div>
                <Users className="text-[#00ff85]" size={18} />

                <p className="mt-2 text-xs uppercase text-slate-500">
                  Participants
                </p>

                <p className="mt-1 text-sm">
                  Up to {event.max_participants}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_.6fr]">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">
                Event description
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">
                {event.description}
              </p>

              {event.special_instructions && (
                <>
                  <h2 className="mt-7 text-xl font-semibold">
                    Important information
                  </h2>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-400">
                    {event.special_instructions}
                  </p>
                </>
              )}
            </section>

            <aside className="rounded-2xl border border-[#00ff85]/20 bg-[#00ff85]/5 p-6">
              <p className="text-xs uppercase tracking-wider text-[#00ff85]">
                Tickets from
              </p>

              <p className="mt-2 text-3xl font-semibold">
                ₹{event.regular_price}
              </p>

              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <p>
                  Regular: {event.regular_quantity} available
                </p>

                <p>
                  VIP: {event.vip_quantity} available
                </p>

                <p>
                  Premium: {event.premium_quantity} available
                </p>
              </div>

              <button
                type="button"
                className="mt-7 w-full rounded-lg bg-[#00ff85] px-4 py-3 font-semibold text-black hover:bg-[#00d970]"
              >
                Book now
              </button>
            </aside>
          </div>
        </div>
      </main>
    </ExploreLayout>
  );
}