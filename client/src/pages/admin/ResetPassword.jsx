import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../api/auth";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    setError("");
    try {
      await authApi.adminResetPassword(uid, token, password);
      navigate("/admin/login", {
        state: { message: "Password changed. Please sign in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Reset link is invalid or expired.",
      );
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
        <h1 className="text-2xl font-semibold">Set new admin password</h1>
        <input
          className="mt-6 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="New password"
        />
        <input
          className="mt-4 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white"
          type="password"
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Confirm password"
        />
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <button
          className="mt-5 w-full rounded-lg bg-[#00ff85] px-4 py-3 font-semibold text-black"
          disabled={loading}
        >
          {loading ? "Saving…" : "Change password"}
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
