import { Link } from "react-router-dom";

import Header from "../../components/home/Header";
import SubscriptionPlan from "../../components/home/SubscriptionPlan";

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1744] via-[#1a1728] to-[#1a2826] pt-20 text-white">
      <Header />

      <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <section className="max-w-3xl py-12">
          <p className="text-sm font-semibold uppercase tracking-[.25em] text-[#00ff85]">
            Your next experience starts here
          </p>

          <h1 className="mt-5 text-5xl font-light leading-tight sm:text-7xl">
            Discover events.
            <br />

            <span className="bg-[#00ff85] px-2 font-normal text-black">
              Build community.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
            Eventora brings organizers and attendees together to create, share,
            and celebrate unforgettable moments.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/register"
              className="rounded-full bg-[#00ff85] px-7 py-3 font-semibold text-black hover:bg-[#00cc6a]"
            >
              Join Eventora
            </Link>

            <Link
              to="/login"
              className="rounded-full border border-white/20 px-7 py-3 font-semibold hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </section>

        <SubscriptionPlan />
      </main>
    </div>
  );
}