import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Layout from "../../components/layout/admin/Profile/Layout";

export default function Profile() {
  const { user } = useAuth();
  return (
    <Layout>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">
          Administrator profile
        </p>
        <h1 className="mt-4 text-3xl font-semibold">
          {user?.first_name || user?.username}
        </h1>
        <p className="mt-2 text-gray-400">{user?.email}</p>
        <span className="mt-6 inline-block rounded-full bg-[#00ff85]/15 px-3 py-1 text-sm text-[#00ff85]">
          {user?.role}
        </span>
        <div className="mt-8">
          <Link to="/admin" className="text-[#00ff85]">
            ← Back to admin dashboard
          </Link>
        </div>
      </section>
    </Layout>
  );
}
