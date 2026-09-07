import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Eventora from "../../assets/images/EventOra.png";
import { authApi } from "../../api/auth";

export default function ResetPasswordPage() {
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
      await authApi.resetPassword(uid, token, password);
      navigate("/login", {
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
    <div className="relative flex w-full max-w-4xl items-center justify-center gap-8">
      <div className="w-full max-w-md rounded-xl bg-gray-900/80 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
        <p className="text-2xl font-medium text-white">Set a new password</p>
        <p className="mt-2 text-gray-400">
          Create a secure password for your Eventora account.
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <input
            className="block w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="New password"
          />
          <input
            className="block w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
            type="password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Confirm password"
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            className="w-full rounded-md bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving…" : "Change password →"}
          </button>
        </form>
        <Link
          to="/login"
          className="mt-6 block text-center text-sm text-purple-400 hover:text-purple-300"
        >
          Back to login
        </Link>
      </div>
      <div className="hidden flex-1 items-center justify-center md:flex">
        <img
          src={Eventora}
          alt="Eventora"
          className="mb-8 w-52 object-contain"
        />
      </div>
    </div>
  );
}
