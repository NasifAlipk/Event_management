import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Users } from "lucide-react";
import Layout from "../../components/layout/admin/Layout";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/admin/users/")
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Layout>
      <main className="min-h-screen bg-[#0f0c29] px-5 py-12 text-white sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">
                Admin control center
              </p>
              <h1 className="mt-2 text-4xl font-light">
                Hello, {user?.first_name || user?.username}
              </h1>
              <p className="mt-2 text-gray-400">
                Manage your Eventora platform.
              </p>
            </div>
            <Link
              to="/admin/profile"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              View profile
            </Link>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[#00ff85]/40 bg-white/5 p-6">
              <Users className="text-[#00ff85]" />
              <p className="mt-5 text-3xl font-semibold">
                {loading ? "…" : users.length}
              </p>
              <p className="mt-2 text-gray-400">Registered users</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <ShieldCheck className="text-[#00ff85]" />
              <p className="mt-5 text-3xl font-semibold">Roles</p>
              <p className="mt-2 text-gray-400">Control permissions.</p>
            </div>
            {/* <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Settings className="text-[#00ff85]" />
              <p className="mt-5 text-3xl font-semibold">Settings</p>
              <p className="mt-2 text-gray-400">Configure platform options.</p>
            </div> */}
          </div>
          <section className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-2xl font-semibold">All users</h2>
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-white/10 text-gray-400">
                <tr>
                  {["Username", "Email", "Role"].map((heading) => (
                    <th key={heading} className="px-3 py-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry.id} className="border-b border-white/5">
                    <td className="px-3 py-3 font-medium">{entry.username}</td>
                    <td className="px-3 py-3 text-gray-300">{entry.email}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-[#00ff85]/15 px-2 py-1 text-xs text-[#00ff85]">
                        {entry.role}
                      </span>
                    </td>
                    {/* <td className="px-3 py-3 text-gray-400">
                      {entry.last_login
                        ? new Date(entry.last_login).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-3 py-3 text-gray-400">
                      {entry.date_joined
                        ? new Date(entry.date_joined).toLocaleDateString()
                        : "—"}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && users.length === 0 && (
              <p className="py-6 text-center text-gray-400">No users found.</p>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}
