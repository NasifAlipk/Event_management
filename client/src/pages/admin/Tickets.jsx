import { useEffect, useState } from "react";
import { CheckCircle2, Ticket as TicketIcon, XCircle } from "lucide-react";
import Layout from "../../components/layout/admin/Layout";
import { ticketsApi } from "../../services/tickets";

const TABLE_HEADINGS = [
  "Ticket ID",
  "Event",
  "Customer",
  "Purchased Date",
  "Total Price",
  "Payment Method",
  "Status",
];

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [statistics, setStatistics] = useState({ total: 0, valid: 0, cancelled: 0 });

  useEffect(() => {
    ticketsApi
      .admin({ page })
      .then(({ data }) => {
        setTickets(data.tickets || []);
        setPage(data.page || 1);
        setPageCount(data.page_count || 1);
        setTotal(data.total || 0);
        setStatistics(
          data.statistics || { total: data.total || 0, valid: 0, cancelled: 0 }
        );
      })
      .catch((err) => {
        console.error("Failed to fetch tickets:", err);
        setError("Failed to load tickets. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Layout>
      <main className="min-h-screen bg-[#0f0c29] px-5 py-8 text-white sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">
                Booking management
              </p>
              <h1 className="mt-2 text-3xl font-light">Tickets</h1>
              <p className="mt-1 text-gray-400">
                Tickets issued after verified payments.
              </p>
            </div>
            {!loading && tickets.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                Total Tickets: <span className="font-medium text-white">{total}</span>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={TicketIcon}
              label="Total Tickets"
              value={statistics.total}
              tone="green"
            />
            <StatCard
              icon={CheckCircle2}
              label="Valid Tickets"
              value={statistics.valid}
              tone="blue"
            />
            <StatCard
              icon={XCircle}
              label="Cancelled Tickets"
              value={statistics.cancelled}
              tone="red"
            />
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-md">
            {error ? (
              <div className="py-12 text-center text-red-400">{error}</div>
            ) : loading ? (
              <div className="animate-pulse py-16 text-center text-gray-400">
                Loading tickets…
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                No issued tickets found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase text-slate-400">
                    <tr>
                      {TABLE_HEADINGS.map((heading) => (
                        <th key={heading} className="px-6 py-4 font-semibold tracking-wider">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tickets.map((ticket) => {
                      const isValid = ticket.status === "VALID";
                      return (
                        <tr
                          key={ticket.id}
                          className="transition-colors hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-4 font-mono text-xs text-[#00ff85]">
                            {ticket.id}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            {ticket.event_name}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {ticket.customer_name}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {ticket.purchased_date
                              ? new Date(ticket.purchased_date).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "—"}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            ₹
                            {Number(ticket.total_ticket_price || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {ticket.payment_method || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                isValid
                                  ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                  : "border border-red-400/20 bg-red-400/10 text-red-300"
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {!loading && pageCount > 1 && (
            <nav className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                <button
                  type="button"
                  key={number}
                  onClick={() => setPage(number)}
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm ${
                    number === page
                      ? "bg-[#00ff85] text-black"
                      : "border border-white/15 text-slate-300"
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                disabled={page === pageCount}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </main>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const colors = {
    green: "bg-[#00ff85]/15 text-[#00ff85]",
    blue: "bg-sky-400/15 text-sky-300",
    red: "bg-red-400/15 text-red-300",
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-[#151c2d] p-5 shadow-xl shadow-black/10">
      <div className={`grid h-11 w-11 place-items-center rounded-full ${colors[tone]}`}>
        <Icon size={22} />
      </div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value.toLocaleString()}</p>
    </article>
  );
}