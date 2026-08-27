import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  { name: "Starter", price: "Free", text: "Explore public events and join communities.", features: ["Discover events", "Save your favorites", "Connect with attendees"] },
  { name: "Organizer", price: "$19", text: "Everything you need to grow your event community.", features: ["Create unlimited events", "Manage registrations", "Organizer insights"] },
  { name: "Premium", price: "$39", text: "Powerful tools for event professionals.", features: ["Advanced analytics", "Priority support", "Premium community tools"] },
];

export default function SubscriptionPlan() {
  return <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f0c29] to-[#24243e] px-5 py-12 sm:px-8"><div className="relative z-10"><p className="text-sm font-semibold uppercase tracking-[.25em] text-[#00ff85]">Plans for every community</p><h2 className="mt-3 text-3xl font-light text-white sm:text-4xl">Choose how you want to <span className="bg-[#00ff85] px-2 font-normal text-black">experience</span> Eventora.</h2><div className="mt-8 grid gap-5 lg:grid-cols-3">{plans.map((plan, index) => <article key={plan.name} className={`rounded-2xl p-6 ${index === 1 ? "bg-gray-900 ring-2 ring-[#00ff85]" : "bg-white/10 ring-1 ring-white/10"}`}><h3 className="text-lg font-semibold text-[#00ff85]">{plan.name}</h3><p className="mt-3 text-4xl font-semibold text-white">{plan.price}<span className="text-sm font-normal text-gray-400">{index ? "/month" : ""}</span></p><p className="mt-3 text-sm text-gray-400">{plan.text}</p><ul className="mt-5 space-y-3 text-sm text-gray-200">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="shrink-0 text-[#00ff85]" size={18} />{feature}</li>)}</ul><Link to="/register" className="mt-6 block rounded-lg bg-[#00ff85] px-4 py-2.5 text-center text-sm font-semibold text-black hover:bg-[#00cc6a]">Get started</Link></article>)}</div></div></section>;
}
