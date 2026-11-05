import { useEffect, useState } from "react";
import Layout from "../../components/layout/admin/Layout";
import { ticketsApi } from "../../services/tickets";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ticketsApi
      .admin()
      .then(({ data }) => {
        setTickets(data.tickets || []);
      })
      .catch((err) => {
        console.p("Failed to fetch tickets:", err);
        setError("Failed to load tickets. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <main className="min-h-screen bg-[#0f0c29] px-5 py-8 text-white sm:px-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
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
                Total Tickets: <span className="font-medium text-white">{tickets.length}</span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl backdrop-blur-md">
            {error ? (
              <div className="py-12 text-center text-red-400">{error}</div>
            ) : loading ? (
              <div className="py-16 text-center text-gray-400 animate-pulse">
                Loading tickets…
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                No issued tickets found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase text-slate-400 bg-white/[0.02]">
                    <tr>
                      {["Ticket ID", "Event", "Customer", "Purchased Date", "Total Price", "Status"].map((heading) => (
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
                        <tr key={ticket.id} className="transition-colors hover:bg-white/[0.03]">
                          <td className="px-6 py-4 font-mono text-xs text-[#00ff85]">
                            {ticket.id}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            {ticket.event_name}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {ticket.customer_name}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs">
                            {ticket.purchased_date
                              ? new Date(ticket.purchased_date).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "—"}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            ₹{Number(ticket.total_ticket_price || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                isValid
                                  ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20"
                                  : "bg-red-400/10 text-red-300 border border-red-400/20"
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
        </div>
      </main>
    </Layout>
  );
}