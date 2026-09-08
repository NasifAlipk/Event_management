import { useEffect, useState } from "react";
import Layout from "../../components/layout/admin/Layout";
import api from "../../services/api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/admin/customers/")
      .then(({ data }) => setCustomers(data.users || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Layout>
      <main className="min-h-screen bg-[#0f0c29] px-5 py-12 text-white sm:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">
            Customer management
          </p>
          <h1 className="mt-2 text-4xl font-light">Customers</h1>
          <p className="mt-2 text-gray-400">
            All normal users registered on Eventora.
          </p>
          <section className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-6">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-white/10 text-gray-400">
                <tr>
                  {["Username", "Email", "Registered"].map(
                    (heading) => (
                      <th key={heading} className="px-3 py-3">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-white/5">
                    <td className="px-3 py-4 font-medium">
                      {customer.username}
                    </td>
                    <td className="px-3 py-4 text-gray-300">
                      {customer.email}
                    </td>
                    <td className="px-3 py-4 text-gray-400">
                      {customer.date_joined
                        ? new Date(customer.date_joined).toLocaleString()
                        : "—"}
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && customers.length === 0 && (
              <p className="py-8 text-center text-gray-400">
                No customers found.
              </p>
            )}
            {loading && (
              <p className="py-8 text-center text-gray-400">
                Loading customers…
              </p>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}
