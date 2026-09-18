import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "../../components/layout/admin/Layout";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { eventsApi } from "../../services/events";

const statusLabels = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const statusClasses = {
  PENDING: "bg-amber-400/15 text-amber-300",
  APPROVED: "bg-emerald-400/15 text-emerald-300",
  REJECTED: "bg-red-400/15 text-red-300",
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    eventsApi
      .admin()
      .then(({ data }) => setEvents(data.events || []))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () => ({
      ALL: events.length,
      PENDING: events.filter(
        (item) => item.status === "PENDING"
      ).length,
      APPROVED: events.filter(
        (item) => item.status === "APPROVED"
      ).length,
      REJECTED: events.filter(
        (item) => item.status === "REJECTED"
      ).length,
    }),
    [events]
  );

  const review = async () => {
    const status =
      selected.type === "reject" ? "REJECTED" : "APPROVED";

    setSaving(true);

    try {
      const { data } = await eventsApi.review(
        selected.event.id,
        status,
        reason.trim()
      );

      setEvents((current) =>
        current.map((event) =>
          event.id === data.event.id ? data.event : event
        )
      );

      setSelected(null);
      setReason("");

      setSuccess(
        status === "APPROVED"
          ? "Event approved successfully."
          : "Event rejected successfully."
      );
    } finally {
      setSaving(false);
    }
  };

  const visible = events.filter(
    (event) => filter === "ALL" || event.status === filter
  );

  return (
    <Layout>
      <main className="min-h-screen bg-[#0f0c29] px-5 py-8 text-white sm:px-10">
        <div className="mx-auto max-w-7xl">

          <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">
            Event management
          </p>

          <h1 className="mt-2 text-3xl font-light">
            Event Approval
          </h1>

          <p className="mt-2 text-slate-400">
            Review organizer events before they appear in Explore.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              ["ALL", "All Events"],
              ["PENDING", "Pending Review"],
              ["APPROVED", "Approved"],
              ["REJECTED", "Rejected"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-lg px-4 py-2 text-sm ${
                  filter === value
                    ? "bg-[#00ff85] font-semibold text-black"
                    : "border border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                {label}

                <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-xs">
                  {counts[value]}
                </span>
              </button>
            ))}
          </div>

          {success && (
            <p className="mt-4 text-sm text-emerald-300">
              {success}
            </p>
          )}

          <section className="mt-6 space-y-4">
            {loading && (
              <p className="p-8 text-center text-slate-400">
                Loading events...
              </p>
            )}

            {!loading && visible.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-400">
                No events in this status.
              </p>
            )}

            {visible.map((event) => (
              <article
                key={event.id}
                className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl lg:flex-row"
              >
                <img
                  src={event.main_banner}
                  alt=""
                  className="h-40 w-full rounded-xl object-cover lg:w-56"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {event.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        {event.organizer_name} · {event.venue_name},{" "}
                        {event.city}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses[event.status]}`}
                    >
                      {statusLabels[event.status]}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-4">
                    <span>
                      <b className="block text-xs text-slate-500">
                        Date
                      </b>
                      {event.start_date}
                    </span>

                    <span>
                      <b className="block text-xs text-slate-500">
                        Category
                      </b>
                      {event.category}
                    </span>

                    <span>
                      <b className="block text-xs text-slate-500">
                        Regular ticket
                      </b>
                      ₹{event.regular_price}
                    </span>

                    <span>
                      <b className="block text-xs text-slate-500">
                        Max attendance
                      </b>
                      {event.max_participants}
                    </span>
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <Link to={`/admin/events/${event.id}`} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/10">Details</Link>
                    {event.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelected({
                              event,
                              type: "reject",
                            });
                            setReason("");
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-400/50 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
                        >
                          <XCircle size={15} />
                          Reject
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelected({
                              event,
                              type: "approve",
                            });
                            setReason("");
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#00ff85] px-4 py-2 text-sm font-semibold text-black hover:bg-[#00d970]"
                        >
                          <CheckCircle2 size={15} />
                          Approve Event
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>

      {selected && (
        <ConfirmModal
          type={selected.type}
          title={
            selected.type === "reject"
              ? "Reject Event"
              : "Approve Event?"
          }
          message={
            selected.type === "reject"
              ? "Please provide a reason so the organizer understands why this event was rejected."
              : "Are you sure you want to approve this event? It will become visible in Explore."
          }
          reason={reason}
          onReasonChange={setReason}
          onCancel={() => !saving && setSelected(null)}
          onConfirm={review}
          loading={saving}
        />
      )}
    </Layout>
  );
}
