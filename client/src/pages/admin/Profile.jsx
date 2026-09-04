import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Layout from "../../components/layout/admin/Profile/Layout";
import { authApi } from "../../api/auth";
import { useState } from "react";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const changePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (form.new_password !== form.confirm)
      return setError("Passwords do not match.");
    try {
      const { data } = await authApi.adminChangePassword(
        form.current_password,
        form.new_password,
      );
      setMessage(data.detail);
      setForm({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to change password.");
    }
  };
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
        <form
          onSubmit={changePassword}
          className="mt-10 border-t border-white/10 pt-8"
        >
          <h2 className="text-xl font-semibold">Change password</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["current_password", "Current password"],
              ["new_password", "New password"],
              ["confirm", "Confirm password"],
            ].map(([name, placeholder]) => (
              <input
                key={name}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                type="password"
                placeholder={placeholder}
                minLength={8}
                required
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              />
            ))}
          </div>
          {message && <p className="mt-3 text-sm text-[#00ff85]">{message}</p>}
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          <button className="mt-4 rounded-lg bg-[#00ff85] px-4 py-2 font-semibold text-black">
            Update password
          </button>
        </form>
      </section>
    </Layout>
  );
}
