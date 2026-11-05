import { useEffect, useState } from "react";
import Layout from "../../components/layout/admin/Layout";
import { ticketsApi } from "../../services/tickets";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsApi.admin().then(({ data }) => setTickets(data.tickets || [])).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <main className="min-h-screen bg-[#0f0c29] px-5 py-8 text-white sm:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">Booking management</p>
          <h1 className="mt-2 text-3xl font-light">Tickets</h1>
          <p className="mt-2 text-gray-400">Tickets issued after verified payments.</p>
          <section className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04]">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-slate-500">
                <tr>{["Ticket ID", "Event", "Customer", "Purchased date", "Total price", "Status"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-mono text-xs text-[#00ff85]">{ticket.id}</td>
                    <td className="px-5 py-4 font-medium">{ticket.event_name}</td>
                    <td className="px-5 py-4 text-slate-300">{ticket.customer_name}</td>
                    <td className="px-5 py-4 text-slate-400">{ticket.purchased_date ? new Date(ticket.purchased_date).toLocaleString() : "—"}</td>
                    <td className="px-5 py-4">₹{Number(ticket.total_ticket_price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${ticket.status === "VALID" ? "bg-emerald-400/15 text-emerald-300" : "bg-red-400/15 text-red-300"}`}>{ticket.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && tickets.length === 0 && <p className="py-10 text-center text-gray-400">No issued tickets found.</p>}
            {loading && <p className="py-10 text-center text-gray-400">Loading tickets…</p>}
          </section>
        </div>
      </main>
    </Layout>
  );
}
