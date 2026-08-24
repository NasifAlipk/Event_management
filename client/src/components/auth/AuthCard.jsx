export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[.2em] text-brand-600">
          Eventora
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>

        <p className="mt-2 text-slate-500">
          {subtitle}
        </p>
      </div>

      {children}

      <div className="mt-6 text-center text-sm text-slate-600">
        {footer}
      </div>
    </section>
  );
}