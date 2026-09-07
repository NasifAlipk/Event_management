import { useState } from "react";
import { Link } from "react-router-dom";
import Eventora from "../../assets/images/EventOra.png";
import { authApi } from "../../api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.forgotPassword(email);
      setMessage(data.detail);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative flex w-full max-w-4xl items-center justify-center gap-8">
      <div className="w-full max-w-md rounded-xl bg-gray-900/80 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
        <p className="text-2xl font-medium text-white">Forgot your password?</p>
        <p className="mt-2 text-gray-400">
          We’ll help you get back into Eventora.
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm text-gray-300">
            Enter your email
            <input
              className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email address"
            />
          </label>
          {message && <p className="text-sm text-[#00ff85]">{message}</p>}
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            className="w-full rounded-md bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Sending…" : "Send reset link →"}
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
