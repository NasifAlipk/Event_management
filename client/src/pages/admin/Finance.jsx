import { useEffect, useState } from "react";
import { Download, Search, TrendingDown, TrendingUp } from "lucide-react";

import Layout from "../../components/layout/admin/Layout";
import { financeApi } from "../../services/finance";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const statusClasses = { Completed: "bg-[#00ff85]/15 text-[#00ff85]", Pending: "bg-amber-400/15 text-amber-300", Failed: "bg-red-400/15 text-red-300", Cancelled: "bg-slate-400/15 text-slate-300" };

function Change({ value }) {
  if (value === null || value === undefined) return <span className="text-slate-500">No previous data</span>;
  const positive = Number(value) >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return <span className={positive ? "inline-flex items-center gap-1 text-[#00ff85]" : "inline-flex items-center gap-1 text-red-300"}><Icon size={13} />{positive ? "+" : ""}{value}% vs previous period</span>;
}

export default function Finance() {
  const [data, setData] = useState({ overview: {}, transactions: [], page_count: 1, page: 1, event_types: [] });
  const [filters, setFilters] = useState({ q: "", event_type: "", ticket_type: "", period: "ALL", page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    financeApi.overview(filters).then(({ data: response }) => {
      if (active) { setData(response); setError(""); }
    }).catch(() => active && setError("Unable to load finance data.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [filters]);

  const update = (key, value) => { setLoading(true); setFilters((current) => ({ ...current, [key]: value, page: 1 })); };
  const overview = data.overview || {};
  const exportReport = () => {
    const rows = [["Event Name", "Organizer", "Date", "Ticket Type", "Amount", "Status"], ...data.transactions.map((item) => [item.event_name, item.organizer, item.date, item.ticket_type, item.amount, item.status])];
    const blob = new Blob([rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "eventora-finance-report.csv"; link.click(); URL.revokeObjectURL(link.href);
  };

  return <Layout><main className="min-h-screen bg-[#0f0c29] px-5 py-8 text-white sm:px-10"><div className="mx-auto max-w-7xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">Finance</p><h1 className="mt-2 text-3xl font-light">Finance Overview</h1></div><button type="button" onClick={exportReport} className="inline-flex items-center gap-2 rounded-lg bg-[#00ff85] px-4 py-2 text-sm font-semibold text-black"><Download size={15} />Export Report</button></div>
    <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Total Revenue", money(overview.total_revenue), overview.total_revenue_change], ["Today's Revenue", money(overview.today_revenue), overview.today_revenue_change], ["This Month", money(overview.month_revenue), overview.month_revenue_change], ["Total Tickets", Number(overview.total_tickets || 0).toLocaleString("en-IN"), overview.total_tickets_change]].map(([label, value, change]) => <article key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-5"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs"><Change value={change} /></p></article>)}</section>
    <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5"><h2 className="text-xl font-semibold">Transaction History</h2><label className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm"><Search size={15} className="text-slate-400" /><input value={filters.q} onChange={(event) => update("q", event.target.value)} placeholder="Search transactions..." className="w-48 bg-transparent outline-none placeholder:text-slate-500" /></label></div>
      <div className="flex flex-wrap gap-2 border-b border-white/10 p-5"><select value={filters.event_type} onChange={(event) => update("event_type", event.target.value)} className="rounded-lg border border-white/15 bg-[#15132c] px-3 py-2 text-sm"><option value="">All Event Types</option>{data.event_types.map((type) => <option key={type} value={type}>{type}</option>)}</select><select value={filters.ticket_type} onChange={(event) => update("ticket_type", event.target.value)} className="rounded-lg border border-white/15 bg-[#15132c] px-3 py-2 text-sm"><option value="">All Ticket Types</option><option value="regular">Regular</option><option value="vip">VIP</option><option value="premium">Premium</option></select><select value={filters.period} onChange={(event) => update("period", event.target.value)} className="rounded-lg border border-white/15 bg-[#15132c] px-3 py-2 text-sm"><option value="ALL">All Time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></div>
      {loading ? <p className="p-10 text-center text-slate-400">Loading transactions...</p> : error ? <p className="p-10 text-center text-red-300">{error}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-slate-500"><tr>{["Event Name", "Organizer", "Date", "Ticket Type", "Amount", "Status"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead><tbody>{data.transactions.map((item) => <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03]"><td className="px-5 py-4 font-medium">{item.event_name}</td><td className="px-5 py-4 text-slate-300">{item.organizer}</td><td className="px-5 py-4 text-slate-400">{new Date(item.date).toLocaleDateString()}</td><td className="px-5 py-4 text-slate-300">{item.ticket_type}</td><td className={`px-5 py-4 font-semibold ${item.status === "Completed" ? "text-[#00ff85]" : "text-slate-400"}`}>{item.status === "Completed" ? "+" : ""}{money(item.amount)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${statusClasses[item.status] || "bg-white/10 text-slate-300"}`}>{item.status}</span></td></tr>)}</tbody></table>{!data.transactions.length && <p className="p-10 text-center text-slate-400">No transactions match these filters.</p>}</div>}
      {!loading && data.page_count > 1 && <div className="flex flex-wrap justify-center gap-2 border-t border-white/10 p-4"><button type="button" disabled={data.page === 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="rounded-lg border border-white/15 px-3 py-2 text-sm disabled:opacity-40">Previous</button>{Array.from({ length: data.page_count }, (_, index) => index + 1).map((page) => <button type="button" key={page} onClick={() => setFilters((current) => ({ ...current, page }))} className={`h-9 min-w-9 rounded-lg px-3 text-sm ${page === data.page ? "bg-[#00ff85] text-black" : "border border-white/15 text-slate-300"}`}>{page}</button>)}<button type="button" disabled={data.page === data.page_count} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="rounded-lg border border-white/15 px-3 py-2 text-sm disabled:opacity-40">Next</button></div>}
    </section>
  </div></main></Layout>;
}
