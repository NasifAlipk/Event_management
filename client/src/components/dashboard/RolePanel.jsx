const content = {
  USER: ['My events', 'Browse events and manage your registrations.'],
  ORGANIZER: ['Organizer workspace', 'Create events and manage attendees.'],
  ADMIN: ['Administration', 'Manage users, organizers, and platform settings.'],
}

export default function RolePanel({ role }) {
  const [title, text] = content[role] || ['Dashboard', 'Your account is ready.']
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold tracking-[.15em] text-brand-600">{role}</p><h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2><p className="mt-2 text-slate-600">{text}</p></section>
}
