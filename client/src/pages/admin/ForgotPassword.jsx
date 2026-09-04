import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.adminForgotPassword(email);
      setMessage(data.detail);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-[#100b2e] via-[#1a1728] to-[#102a28] p-5 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900/80 p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-semibold">Forgot admin password?</h1>
        <p className="mt-2 text-sm text-gray-400">
          Enter the administrator email and we’ll send a secure reset link.
        </p>
        <input
          className="mt-6 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Admin email"
        />
        {message && <p className="mt-4 text-sm text-[#00ff85]">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <button
          className="mt-5 w-full rounded-lg bg-[#00ff85] px-4 py-3 font-semibold text-black disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
        <Link
          to="/admin/login"
          className="mt-5 block text-center text-sm text-[#00ff85]"
        >
          Back to admin login
        </Link>
      </form>
    </main>
  );
}
