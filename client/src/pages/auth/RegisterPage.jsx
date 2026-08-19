import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import AuthCard from '../../components/auth/AuthCard';
import EventOra from "../../assets/images/EventOra.png";
import {
  ApiError,
  TextField,
} from '../../components/auth/AuthFormFields';
import { useAuth } from '../../hooks/useAuth';

const initialForm = {
  username: '',
  email: '',
  password: '',
  password_confirm: '',
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
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
    setError('');

    try {
      await register(form);

      navigate('/dashboard', {
        replace: true,
      });
    } catch (err) {
      const detail = err.response?.data;

      setError(
        typeof detail === 'object'
          ? Object.values(detail).flat().join(' ')
          : 'Could not create this account.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="New accounts are created as normal users."
      footer={
        <>
          <span>Already have an account? </span>

          <Link
            className="font-semibold text-brand-600 hover:text-brand-700"
            to="/login"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
        </div>

        <TextField
          label="Username"
          name="username"
          value={form.username}
          onChange={update}
          required
          autoComplete="username"
        />

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
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={update}
          required
          autoComplete="new-password"
        />

        <TextField
          label="Confirm password"
          name="password_confirm"
          type="password"
          value={form.password_confirm}
          onChange={update}
          required
          autoComplete="new-password"
        />

        <ApiError error={error} />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}