import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import Header from "../../components/home/Header";
import Sidebar from "../../components/layout/profile/OrganizerProfile";
import { organizerDashboardApi } from "../../services/organizerDashboard";

const STATUS_STYLES = {
  Upcoming: "bg-cyan-400/15 text-cyan-300",
  Live: "bg-[#00ff85]/15 text-[#00ff85]",
  Completed: "bg-slate-400/15 text-slate-300",
  Pending: "bg-amber-400/15 text-amber-300",
  Cancelled: "bg-red-400/15 text-red-300",
};

const TICKET_TIERS = ["Regular", "VIP", "Premium"];

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(`2000-01-01T${value}`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="border-r border-white/10 p-4 last:border-0">
      <Icon size={17} className="text-[#00ff85]" />
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

function ProfileCard({ profile }) {
  const name = profile?.name || "Organizer";
  const initial = profile?.name?.slice(0, 1) || "O";
  const joinedText = profile?.date_joined
    ? new Date(profile.date_joined).toLocaleDateString()
    : "—";

  return (
    <section className="rounded-xl border border-white/10 bg-[#0c2222] p-5">
      <div className="flex flex-wrap items-center gap-5">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#00ff85] text-3xl font-bold text-black">
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{name}</h1>
            <span className="rounded-full bg-[#00ff85]/15 px-3 py-1 text-xs text-[#00ff85]">
              Organizer
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">{profile?.email || "—"}</p>
          <p className="mt-1 text-sm text-slate-400">
            {profile?.phone || "Phone not added"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Joined {joinedText}</p>
        </div>
      </div>
    </section>
  );
}

function PerformanceSection({ data }) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#0d171e] p-4">
      <h2 className="text-sm font-semibold">Performance Overview</h2>
      <div className="mt-4 grid grid-cols-2 divide-x divide-white/10 border-y border-white/10 sm:grid-cols-4 sm:divide-x">
        <Stat
          icon={CalendarDays}
          label="Total Events"
          value={data.organized_events || 0}
        />
        <Stat
          icon={Users}
          label="Total Attendees"
          value={Number(data.total_attendees || 0).toLocaleString()}
        />
        <Stat
          icon={DollarSign}
          label="Total Revenue"
          value={formatMoney(data.total_revenue)}
        />
        <Stat
          icon={CheckCircle2}
          label="Events Completed"
          value={data.completed_events || 0}
        />
      </div>
    </section>
  );
}

function EarningsSection({ earnings, period, onPeriodChange }) {
  const chartItems = earnings?.chart || [];
  const chartMax = Math.max(
    ...chartItems.map((item) => Number(item.amount)),
    1
  );
  const growth = earnings?.growth;
  const isPositiveGrowth = Number(growth || 0) >= 0;

  return (
    <section className="rounded-xl border border-white/10 bg-[#0d171e] p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Earnings Overview</h2>
          <p className="mt-2 text-2xl font-semibold text-[#00ff85]">
            {formatMoney(earnings?.total)}
          </p>
          <p
            className={`mt-1 text-xs ${
              isPositiveGrowth ? "text-[#00ff85]" : "text-red-300"
            }`}
          >
            <TrendingUp size={13} className="mr-1 inline" />
            {growth == null
              ? "No previous data"
              : `${growth >= 0 ? "+" : ""}${growth}% vs previous period`}
          </p>
        </div>

        <select
          value={period}
          onChange={(event) => onPeriodChange(event.target.value)}
          className="rounded-lg border border-white/10 bg-[#17232b] px-3 py-2 text-xs"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="mt-5 flex h-28 items-end gap-2 border-b border-white/10 px-2">
        {chartItems.map((item) => {
          const heightPercent = Math.max(
            (Number(item.amount) / chartMax) * 88,
            4
          );

          return (
            <div
              key={item.label}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <div
                title={formatMoney(item.amount)}
                className="w-full max-w-7 rounded-t bg-[#25bd83] transition group-hover:bg-[#00ff85]"
                style={{ height: `${heightPercent}%` }}
              />
              <span className="w-10 truncate text-center text-[9px] text-slate-500">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EventsTable({ events = [] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#0d171e] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Events</h2>
        <Link to="/events" className="text-xs text-[#00ff85] hover:underline">
          View All Events
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed text-left text-xs">
          <thead className="border-b border-white/10 text-slate-500">
            <tr>
              <th className="w-[34%] px-2 py-3">Event Details</th>
              <th className="w-[16%] px-2 py-3">Status</th>
              <th className="w-[19%] px-2 py-3">Date</th>
              <th className="w-[16%] px-2 py-3">Attendance/Tickets</th>
              <th className="w-[11%] px-2 py-3">Revenue</th>
              <th className="w-[4%] px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const badgeStyle =
                STATUS_STYLES[event.status] || "bg-white/10 text-slate-300";

              return (
                <tr key={event.id} className="border-b border-white/5">
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-12 shrink-0 overflow-hidden rounded bg-black/30">
                        {event.main_banner && (
                          <img
                            src={event.main_banner}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <span className="truncate font-medium">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className={`rounded px-2 py-1 ${badgeStyle}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-slate-300">
                    {formatDate(event.start_date)}
                    <span className="block text-[10px] text-slate-500">
                      {formatTime(event.start_time)}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-slate-300">
                    {event.sold_tickets.toLocaleString()} /{" "}
                    {event.total_tickets.toLocaleString()}
                  </td>
                  <td className="px-2 py-3 font-semibold text-[#00ff85]">
                    {formatMoney(event.revenue)}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <Link to={`/events/${event.id}`} aria-label="View event">
                      <ArrowRight
                        size={17}
                        className="ml-auto text-slate-400 hover:text-[#00ff85]"
                      />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!events.length && (
          <p className="p-8 text-center text-slate-500">
            No events created yet.
          </p>
        )}
      </div>
    </section>
  );
}

function BottomSummaryRow({ data }) {
  const ticketCounts = data.ticket_counts || {};

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <section className="rounded-xl border border-white/10 bg-[#0d171e] p-4">
        <p className="text-xs text-slate-400">Top Performance Event</p>
        {data.top_event ? (
          <div className="mt-4 flex items-center gap-3">
            <div className="h-12 w-14 overflow-hidden rounded bg-black/30">
              {data.top_event.main_banner && (
                <img
                  src={data.top_event.main_banner}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {data.top_event.title}
              </p>
              <p className="mt-1 text-xs text-[#00ff85]">
                {formatMoney(data.top_event.revenue)}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No revenue yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-[#0d171e] p-4">
        <p className="text-xs text-slate-400">Types of tickets sold</p>
        <div className="mt-4 space-y-2 text-xs">
          {TICKET_TIERS.map((tier) => (
            <p key={tier} className="flex justify-between">
              <span>{tier}</span>
              <b>{ticketCounts[tier] || 0}</b>
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-red-400/20 bg-[#1a151b] p-4">
        <XCircle className="text-red-300" size={18} />
        <p className="mt-4 text-2xl font-semibold">
          {data.cancelled_events || 0}
        </p>
        <p className="mt-1 text-xs text-slate-400">Total Cancelled Events</p>
      </section>
    </div>
  );
}

function DashboardShell({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#071117] px-4 pb-16 pt-24 text-white sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[210px_1fr]">
          <Sidebar />
          <div className="min-w-0 space-y-5">{children}</div>
        </div>
      </main>
    </>
  );
}

export default function OrganizerDashboard() {
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    organizerDashboardApi
      .summary({ period })
      .then(({ data }) => {
        if (active) setSummary(data);
      })
      .catch(() => {
        if (active) setError("Unable to load dashboard summary.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [period]);

  if (loading && !summary) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#071117] px-5 pb-16 pt-24 text-white">
          <div className="mx-auto max-w-7xl text-center text-slate-400">
            Loading organizer dashboard...
          </div>
        </main>
      </>
    );
  }

  if (error && !summary) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#071117] px-5 pb-16 pt-24 text-white">
          <div className="mx-auto max-w-7xl rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
            {error}
          </div>
        </main>
      </>
    );
  }

  const data = summary || {};

  return (
    <DashboardShell>
      <ProfileCard profile={data.profile} />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_1.95fr]">
        <PerformanceSection data={data} />
        <EarningsSection
          earnings={data.earnings}
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>

      <EventsTable events={data.events} />
      <BottomSummaryRow data={data} />
    </DashboardShell>
  );
}