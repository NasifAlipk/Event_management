export function TextField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  autoComplete,
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}

      <input
        className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-3 focus:ring-brand-50"
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
    </label>
  );
}

export function ApiError({ error }) {
  return error ? (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {error}
    </p>
  ) : null;
}
