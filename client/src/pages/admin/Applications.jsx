import { useEffect, useMemo, useState } from "react";
import { Eye, Filter, MoreVertical, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/admin/Layout";
import { organizerApi } from "../../services/organizer";

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

function formatDate(value) {
  return value
    ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "—";
}

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organizerApi
      .adminApplications()
      .then(({ data }) => setApplications(data.applications || []))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () => ({
      ALL: applications.length,
      PENDING: applications.filter((item) => item.status === "PENDING").length,
      APPROVED: applications.filter((item) => item.status === "APPROVED").length,
      REJECTED: applications.filter((item) => item.status === "REJECTED").length,
    }),
    [applications],
  );
  const visible = applications.filter((item) => {
    const matchesStatus = filter === "ALL" || item.status === filter;
    const query = search.toLowerCase();
    return (
      matchesStatus &&
      (!query ||
        `${item.full_name} ${item.organization_name} ${item.applicant_email}`
          .toLowerCase()
          .includes(query))
    );
  });

  return (
    <Layout>
      <main className="min-h-screen bg-[#0f0c29] px-5 py-8 text-white sm:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">Organizer management</p>
          <h1 className="mt-2 text-3xl font-light sm:text-4xl">Organizer Applications</h1>
          <p className="mt-2 text-gray-400">Review and manage requests to host events on Eventora.</p>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl">
            <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
              {[
                ["ALL", "All Applications"],
                ["PENDING", "Pending Review"],
                ["APPROVED", "Approved"],
                ["REJECTED", "Rejected"],
              ].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-sm transition ${filter === value ? "bg-[#00ff85] font-semibold text-black" : "text-slate-300 hover:bg-white/10"}`}>
                  {label} <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-xs">{counts[value]}</span>
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 text-slate-400">
                <Search size={16} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applications" className="w-40 bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-500" />
              </div>
              <button type="button" className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 sm:flex"><Filter size={15} /> Filter</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-white/10 bg-black/10 text-xs uppercase tracking-wide text-slate-500">
                  <tr>{["Application", "Applicant", "Organizer / business", "Type", "Submitted", "Status", "Actions"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr>
                </thead>
                <tbody>
                  {visible.map((application) => (
                    <tr key={application.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4 font-medium text-[#00ff85]">#ORG-{String(application.id).padStart(4, "0")}</td>
                      <td className="px-5 py-4"><p className="font-medium text-white">{application.full_name}</p><p className="mt-1 text-xs text-slate-500">{application.phone_number}</p></td>
                      <td className="px-5 py-4 text-slate-300">{application.organization_name}</td>
                      <td className="px-5 py-4 capitalize text-slate-300">{application.organizer_type.toLowerCase()}</td>
                      <td className="px-5 py-4 text-slate-400">{formatDate(application.created_at)}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[application.status]}`}>{statusLabels[application.status]}</span></td>
                      <td className="px-5 py-4"><div className="flex items-center gap-2"><Link to={`/admin/applications/${application.id}`} aria-label="Review application" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 hover:border-[#00ff85]/50 hover:text-[#00ff85]"><Eye size={16} /></Link><button type="button" aria-label="More actions" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/10"><MoreVertical size={16} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && visible.length === 0 && <p className="p-10 text-center text-slate-400">No organizer applications found.</p>}
            {loading && <p className="p-10 text-center text-slate-400">Loading applications…</p>}
          </section>
        </div>
      </main>
    </Layout>
  );
}
