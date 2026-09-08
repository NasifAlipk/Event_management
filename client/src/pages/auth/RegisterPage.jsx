import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Eventora from "../../assets/images/EventOra.png";
import { ApiError } from "../../components/auth/AuthFormFields";
import { useAuth } from "../../hooks/useAuth";
import GoogleButton from "../../components/auth/GoogleButton";

const initialForm = {
  username: "",
  email: "",
  password: "",
  password_confirm: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const { email } = await register(form);

      navigate("/verify-email", {
        replace: true,
        state: { email },
      });
    } catch (err) {
      const detail = err.response?.data;

      setError(
        typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : "Could not create this account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "mt-2 block w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500";

  return (
    <div className="relative flex w-full max-w-4xl items-center justify-center gap-8">
      {/* Registration Form */}
      <div className="w-full max-w-md rounded-xl bg-gray-900/80 p-8 pt-6 shadow-2xl backdrop-blur-sm sm:p-10 sm:pt-7">
        <div className="mb-7">
          <p className="text-2xl font-medium text-white">
            Hola, to Eventora
          </p>

          <p className="mt-1 text-gray-400">
            Sign up now to make your event awesome!
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {/* Username */}
          <label className="block text-sm text-gray-300">
            Username

            <input
              className={fieldClass}
              name="username"
              value={form.username}
              onChange={update}
              required
              autoComplete="username"
              placeholder="Username"
            />
          </label>

          {/* Email */}
          <label className="block text-sm text-gray-300">
            Email

            <input
              className={fieldClass}
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              required
              autoComplete="email"
              placeholder="Email address"
            />
          </label>

          {/* Password */}
          <label className="block text-sm text-gray-300">
            Password

            <input
              className={fieldClass}
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              required
              autoComplete="new-password"
              placeholder="Password"
            />
          </label>

          {/* Confirm Password */}
          <label className="block text-sm text-gray-300">
            Confirm password

            <input
              className={fieldClass}
              name="password_confirm"
              type="password"
              value={form.password_confirm}
              onChange={update}
              required
              autoComplete="new-password"
              placeholder="Confirm password"
            />
          </label>

          <ApiError error={error} />

          <div className="flex items-center justify-between gap-4 pt-2">
            <Link
              className="text-sm text-gray-400 hover:text-white"
              to="/login"
            >
              Already have an account?
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-purple-600 px-5 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Get OTP →"}
            </button>
          </div>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-500"><span className="h-px flex-1 bg-gray-700" />OR<span className="h-px flex-1 bg-gray-700" /></div>
        <GoogleButton onError={setError} onSuccess={() => navigate("/dashboard", { replace: true })} />

        <div className="mt-6 text-center text-sm text-gray-400">
          We will send a verification code to your email.
        </div>
      </div>

      {/* Eventora Logo */}
      <div className="hidden flex-1 items-center justify-center md:flex">
        <img
          src={Eventora}
          alt="Eventora"
          className="mb-8 w-52 object-contain opacity-95"
        />
      </div>
    </div>
  );
}
