import { Link } from "react-router-dom";
import { CalendarDays, Compass, Plus, Users } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/home/Header";
import SubscriptionPlan from "../../components/home/SubscriptionPlan";

const features = [
  { icon: CalendarDays, title: "Your events", text: "Keep your registrations and upcoming experiences in one place." },
  { icon: Compass, title: "Discover", text: "Find events and communities that match your interests." },
  { icon: Users, title: "Connect", text: "Meet organizers and attendees before the event begins." },
];

export default function Home() {
  const { user } = useAuth();
  const displayName = user?.first_name || user?.username || "there";

  return (
    <><Header /><main className="min-h-screen overflow-hidden bg-[#1a1728] px-5 pb-12 pt-24 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <section className="grid items-center gap-12 py-8 lg:grid-cols-[1.1fr_.9fr] lg:py-16">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[.25em] text-[#00ff85]">Welcome back, {displayName}</p>
            <h1 className="text-4xl font-light leading-tight sm:text-6xl">
              Connect through <span className="bg-[#00ff85] px-2 font-normal text-black">events</span>,<br />
              share every moment.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
              Discover experiences, build communities, and make your next event unforgettable with Eventora.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/events" className="inline-flex items-center gap-2 rounded-full bg-[#00ff85] px-6 py-3 font-semibold text-black transition hover:bg-[#00cc6a]"><Compass size={18} /> Explore events</Link>
              <Link to="/profile" className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10">View profile</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8 flex items-center justify-between"><span className="text-sm text-gray-400">Your Eventora space</span><span className="h-3 w-3 rounded-full bg-[#00ff85] shadow-[0_0_16px_#00ff85]" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/20 p-5"><p className="text-3xl font-semibold text-[#00ff85]">0</p><p className="mt-1 text-sm text-gray-400">Upcoming events</p></div>
              <div className="rounded-2xl bg-black/20 p-5"><p className="text-3xl font-semibold text-[#00ff85]">0</p><p className="mt-1 text-sm text-gray-400">Connections</p></div>
            </div>
            <Link to="/events" className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 hover:bg-white/10"><Plus size={16} /> Start exploring</Link>
          </div>
        </section>

        <section className="border-t border-white/10 py-12">
          <h2 className="text-3xl font-light">Everything you need to <span className="bg-[#00ff85] px-2 font-normal text-black">belong</span>.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6"><Icon className="text-[#00ff85]" size={28} /><h3 className="mt-5 text-xl font-medium">{title}</h3><p className="mt-2 text-gray-400">{text}</p></article>)}
          </div>
        </section>
        <SubscriptionPlan />
      </div>
    </main>
    </>
  );
}
