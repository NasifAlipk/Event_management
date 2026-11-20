import { useEffect, useState } from "react";
import { Eye, TicketPercent } from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "../../components/layout/admin/Layout";
import { couponsApi } from "../../services/coupons";

const statusClasses = {
  PENDING: "bg-amber-400/15 text-amber-300",
  APPROVED: "bg-emerald-400/15 text-emerald-300",
  REJECTED: "bg-red-400/15 text-red-300",
};

export default function Coupons() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [counts, setCounts] = useState({ ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 });

  useEffect(() => {
    couponsApi
      .admin({ page, status: filter })
      .then(({ data }) => { setItems(data.coupons || []); setPage(data.page || 1); setPageCount(data.page_count || 1); setCounts(data.counts || {}); })
      .finally(() => setLoading(false));
  }, [page, filter]);

  const visible = items;

  const filters = [
    ["ALL", "All"],
    ["PENDING", "Pending Review"],
    ["APPROVED", "Approved"],
    ["REJECTED", "Rejected"],
  ];

  return (
    <Layout>
      <main className="min-h-screen bg-[#0f0c29] px-5 py-8 text-white sm:px-10">
        <div className="mx-auto max-w-7xl">
          {/* Page heading */}
          <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">
            Discount management
          </p>

          <h1 className="mt-2 text-3xl font-light">
            Coupons
          </h1>

          {/* Status filters */}
          <div className="mt-7 flex flex-wrap gap-2">
            {filters.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => { setFilter(value); setPage(1); }}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  filter === value
                    ? "bg-[#00ff85] text-black"
                    : "border border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                {label} <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-xs">{counts[value] || 0}</span>
              </button>
            ))}
          </div>

          {/* Coupons table */}
          <section className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04]">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-slate-500">
                <tr>
                  {[
                    "Coupon",
                    "Organizer",
                    "Discount",
                    "Validity",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visible.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-b border-white/5 transition hover:bg-white/[0.03]"
                  >
                    {/* Coupon */}
                    <td className="px-5 py-4">
                      <p className="font-mono font-semibold text-[#00ff85]">
                        {coupon.code}
                      </p>

                      <p className="text-slate-300">
                        {coupon.name}
                      </p>
                    </td>

                    {/* Organizer */}
                    <td className="px-5 py-4 text-slate-300">
                      {coupon.organizer_name}
                    </td>

                    {/* Discount */}
                    <td className="px-5 py-4">
                      {coupon.discount_type === "PERCENTAGE"
                        ? `${coupon.discount_value}%`
                        : `₹${coupon.discount_value}`}
                    </td>

                    {/* Validity */}
                    <td className="px-5 py-4 text-slate-400">
                      {coupon.start_date} – {coupon.end_date}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          statusClasses[coupon.status]
                        }`}
                      >
                        {coupon.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/coupons/${coupon.id}`}
                        aria-label="View coupon"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-[#00ff85]/50 hover:text-[#00ff85]"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <p className="p-10 text-center text-slate-400">
                Loading coupons...
              </p>
            )}

            {!loading && !visible.length && (
              <div className="p-10 text-center text-slate-400">
                <TicketPercent className="mx-auto mb-2" />
                <p>No coupons found.</p>
              </div>
            )}
          </section>
          {!loading && pageCount > 1 && <nav className="mt-6 flex justify-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-white/15 px-3 py-2 text-sm disabled:opacity-40">Previous</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button type="button" key={number} onClick={() => setPage(number)} className={`h-9 min-w-9 rounded-lg px-3 text-sm ${number === page ? "bg-[#00ff85] text-black" : "border border-white/15 text-slate-300"}`}>{number}</button>)}<button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-white/15 px-3 py-2 text-sm disabled:opacity-40">Next</button></nav>}
        </div>
      </main>
    </Layout>
  );
}
