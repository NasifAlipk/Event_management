import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Eventoraslip from "../../assets/images/Eventoraslip.png";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Administrator login failed.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-[#100b2e] via-[#1a1728] to-[#102a28] p-5 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900/80 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <img
            src={Eventoraslip}
            alt="Eventora"
            className="mx-auto h-16 w-16 object-contain"
          />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[.25em] text-[#00ff85]">
            Administrator portal
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Welcome back</h1>
        </div>
        <form className="space-y-5" onSubmit={submit}>
          <label className="block text-sm text-gray-300">
            Username
            <input
              className="mt-2 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </label>
          <label className="block text-sm text-gray-300">
            Password
            <input
              className="mt-2 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            className="w-full rounded-lg bg-[#00ff85] px-4 py-3 font-semibold text-black"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Admin sign in →"}
          </button>
        </form>
        <Link
          to="/admin/forgot-password"
          className="mt-4 block text-right text-sm text-[#00ff85]"
        >
          Forgot password?
        </Link>
        <p className="mt-6 text-center text-sm text-gray-400">
          <Link to="/login" className="text-[#00ff85]">
            Back to user login
          </Link>
        </p>
      </div>
    </main>
  );
}
