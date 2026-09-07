import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Eventora from "../../assets/images/EventOra.png";
import { ApiError } from "../../components/auth/AuthFormFields";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      await login(form);

      const redirectPath = location.state?.from?.pathname || "/dashboard";

      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  return (
    <div className="relative flex w-full max-w-4xl items-center justify-center gap-8">
      <div className="w-full max-w-md rounded-xl bg-gray-900/80 p-8 pt-6 shadow-2xl backdrop-blur-sm sm:p-10 sm:pt-7">
        <div className="mb-7">
          <p className="text-2xl font-medium text-white">Hola, to Eventora</p>
          <p className="mt-1 text-gray-400">
            Login now to access your account!
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <label className="block text-sm text-gray-300">
            Enter your username*
            <input
              className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="Username"
            />
          </label>

          <label className="block text-sm text-gray-300">
            Enter your password
            <input
              className="mt-2 block w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="Password"
            />
          </label>

          <ApiError error={error} />

          <Link
            to="/forgot-password"
            className="mt-4 block text-right text-sm text-purple-400 hover:text-purple-300"
          >
            Forgot password?
          </Link>

          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-sm text-gray-400">Need an account?</span>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-purple-600 px-5 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          New to Eventora?{" "}
          <Link
            className="font-semibold text-purple-400 hover:text-purple-300"
            to="/register"
          >
            Create an account
          </Link>
        </p>
      </div>

      <div className="hidden flex-1 items-center justify-center md:flex">
        <img
          src={Eventora}
          alt="Eventora"
          className="mb-8 w-52 object-contain opacity-100"
        />
      </div>
    </div>
  );
}
