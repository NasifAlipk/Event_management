import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { authApi } from "../../api/auth";
import AuthCard from "../../components/auth/AuthCard";
import { ApiError, TextField } from "../../components/auth/AuthFormFields";
import { useAuth } from "../../hooks/useAuth";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    code: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({
      ...previousForm,
      [name]: name === "code" ? value.replace(/\D/g, "").slice(0, 6) : value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await verifyEmail(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Could not verify this code.");
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError("");
    setMessage("");

    try {
      const { data } = await authApi.resendVerificationCode(form.email);
      setMessage(data.detail);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not resend the code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the six-digit code we sent to your email. The code expires in 10 minutes."
      footer={
        <Link
          className="font-semibold text-brand-600 hover:text-brand-700"
          to="/register"
        >
          Use a different email
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={update}
          required
          autoComplete="email"
        />
        <TextField
          label="Verification code"
          name="code"
          value={form.code}
          onChange={update}
          required
          autoComplete="one-time-code"
        />

        <ApiError error={error} />
        {message && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Verifying..." : "Verify email"}
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={resending || !form.email}
          className="w-full rounded-lg border border-brand-600 px-4 py-2.5 font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-60"
        >
          {resending ? "Sending..." : "Resend code"}
        </button>
      </form>
    </AuthCard>
  );
}
