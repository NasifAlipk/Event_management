
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Ticket } from "lucide-react";
import Header from "../../components/home/Header";
import Sidebar from "../../components/layout/profile/OrganizerProfile";
import { organizerDashboardApi } from "../../services/organizerDashboard";

export default function OrganizerDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    organizerDashboardApi
      .summary()
      .then(({ data }) => setSummary(data))
      .catch(() => setError("Unable to load dashboard summary."));
  }, []);

  const cards = summary
    ? [
        ["Organized events", summary.organized_events, CalendarDays],
        ["Pending events", summary.pending_events, Clock3],
        ["Total coupons", summary.total_coupons, Ticket],
      ]
    : [];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#0d1420] px-4 pb-16 pt-24 text-white sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[210px_1fr]">
          <Sidebar />

          <section className="min-w-0">
            <div className="rounded-2xl border border-white/10 bg-[#112b2a] p-6">
              <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">
                Organizer workspace
              </p>

              <h1 className="mt-2 text-4xl font-light">
                Dashboard
              </h1>

              <p className="mt-2 text-slate-400">
                A quick overview of your events and coupons.
              </p>
            </div>

            {error && (
              <p className="mt-5 rounded-xl bg-red-400/10 p-4 text-sm text-red-200">
                {error}
              </p>
            )}

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {summary ? (
                cards.map(([label, value, Icon]) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-white/10 bg-[#171e2b] p-6"
                  >
                    <Icon className="text-[#00ff85]" size={24} />

                    <p className="mt-5 text-4xl font-semibold">
                      {value}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {label}
                    </p>
                  </article>
                ))
              ) : (
                <p className="col-span-full rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-400">
                  Loading dashboard...
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}