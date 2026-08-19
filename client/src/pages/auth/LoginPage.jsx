import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import AuthCard from '../../components/auth/AuthCard';
import EventOra from "../../assets/images/EventOra.png";
import { ApiError, TextField } from '../../components/auth/AuthFormFields';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError('');

    try {
      await login(form);

      const redirectPath =
        location.state?.from?.pathname || '/dashboard';

      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Invalid username or password.'
      );
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
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to access your events."
      footer={
        <>
          <span>New to Eventora? </span>

          <Link
            className="font-semibold text-brand-600 hover:text-brand-700"
            to="/register"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <TextField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          autoComplete="username"
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />

        <ApiError error={error} />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthCard>
  );
}