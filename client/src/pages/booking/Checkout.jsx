import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, Minus, Plus, Ticket, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import ExploreLayout from "../../components/layout/Explore/Layout";
import { useAuth } from "../../hooks/useAuth";
import { eventsApi } from "../../services/events";

const ticketStyles = {
  regular: { label: "Regular", accent: "#00f5a0", border: "border-[#00f5a0]", text: "text-[#00f5a0]", benefits: ["Entry to the Event", "Access to Main Area", "Standard Seating"] },
  vip: { label: "VIP", accent: "#b65cff", border: "border-[#b65cff]", text: "text-[#c276ff]", benefits: ["All Regular Benefits", "VIP Lounge Access", "Dedicated VIP Entry", "Complimentary Drinks", "Premium Seating"] },
  premium: { label: "Premium", accent: "#f7c843", border: "border-[#f7c843]", text: "text-[#f7d568]", benefits: ["All VIP Benefits", "Front Row Access", "Meet & Greet with DJ", "Complimentary Food & Drinks", "Exclusive Merchandise"] },
};

const formatDate = (value) => {
  if (!value) return "Date to be announced";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date);
};
const formatTime = (value) => {
  if (!value) return "Time to be announced";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
};
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

function TicketCard({ type, price, available, quantity, onChange }) {
  const style = ticketStyles[type];
  return (
    <article className={`flex min-h-[375px] flex-col rounded-xl border-2 bg-[#111820] p-6 transition ${style.border} ${quantity ? "ring-1 ring-white/20" : ""}`}>
      <div className="flex items-start justify-between gap-3"><h3 className={`text-2xl font-semibold ${style.text}`}>{style.label}</h3><span className={`text-sm ${style.text}`}>Remaining {available}</span></div>
      <p className="mt-3 text-3xl font-semibold text-slate-100">{money(price)}</p>
      <ul className="mt-7 space-y-4 text-sm leading-5 text-slate-300">{style.benefits.map((benefit) => <li key={benefit} className="flex items-start gap-3"><Check size={20} className="mt-0.5 shrink-0" style={{ color: style.accent }} /><span>{benefit}</span></li>)}</ul>
      <div className="mt-auto flex items-center justify-between rounded-lg border px-4 py-2" style={{ borderColor: style.accent }}><button type="button" disabled={quantity <= 0} onClick={() => onChange(quantity - 1)} className="p-1 disabled:opacity-40" aria-label={`Decrease ${style.label} tickets`}><Minus size={21} style={{ color: style.accent }} /></button><span className="text-xl font-medium text-white">{quantity}</span><button type="button" disabled={quantity >= available} onClick={() => onChange(quantity + 1)} className="p-1 disabled:opacity-40" aria-label={`Increase ${style.label} tickets`}><Plus size={21} style={{ color: style.accent }} /></button></div>
    </article>
  );
}

export default function Checkout() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [quantities, setQuantities] = useState({ regular: 0, vip: 0, premium: 0 });

  useEffect(() => {
    const loadEvent = async () => {
      try { const { data } = await eventsApi.publishedEvent(eventId); setEvent(data.event); }
      catch { try { if (!user) throw new Error("Not signed in"); const { data } = await eventsApi.organizerEvent(eventId); setEvent(data.event); } catch { setError("This event is no longer available."); } }
    };
    loadEvent();
  }, [eventId, user]);

  const tickets = useMemo(() => ({
    regular: { price: event?.regular_price, available: Number(event?.regular_quantity || 0) },
    vip: { price: event?.vip_price, available: Number(event?.vip_quantity || 0) },
    premium: { price: event?.premium_price, available: Number(event?.premium_quantity || 0) },
  }), [event]);
  const total = Object.keys(tickets).reduce((sum, type) => sum + Number(tickets[type].price || 0) * quantities[type], 0);
  const count = Object.values(quantities).reduce((sum, value) => sum + value, 0);
  const updateQuantity = (type, value) => setQuantities((current) => ({ ...current, [type]: Math.max(0, Math.min(value, tickets[type].available)) }));

  if (!event) return <ExploreLayout><main className="min-h-screen bg-[#0b1116] px-5 pb-12 pt-28 text-slate-400">{error || "Loading checkout..."}</main></ExploreLayout>;

  return (
    <ExploreLayout>
      <main className="min-h-screen bg-[#0b1116] px-4 pb-16 pt-24 text-white sm:px-8"><div className="mx-auto max-w-7xl">
        <Link to={`/events/${event.id}`} className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#00f5a0]"><ArrowLeft size={16} />Back to Event Details</Link>
        <section className="mt-6 grid gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-[170px_1fr] lg:p-6"><div className="flex h-44 items-center justify-center overflow-hidden rounded-xl bg-[#080d12]">{event.main_banner ? <img src={event.main_banner} alt={event.title} className="h-full w-full object-contain" /> : <Ticket className="text-slate-500" size={36} />}</div><div><p className="text-xs uppercase tracking-[.2em] text-[#00f5a0]">Checkout</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{event.title}</h1><div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2"><p className="flex items-center gap-2"><CalendarDays size={16} className="text-[#00f5a0]" />{formatDate(event.start_date)}</p><p className="flex items-center gap-2"><Clock3 size={16} className="text-[#00f5a0]" />{formatTime(event.start_time)}</p><p className="flex items-center gap-2"><MapPin size={16} className="text-[#00f5a0]" />{[event.venue_name, event.city].filter(Boolean).join(", ") || "Venue to be announced"}</p><p className="flex items-center gap-2"><Users size={16} className="text-[#00f5a0]" />{event.max_participants || 0} Participants</p></div></div></section>
        <section className="mt-8"><h2 className="text-3xl font-semibold">Choose Your Ticket</h2><p className="mt-2 text-slate-400">Select the perfect experience for you</p><div className="mt-6 grid gap-5 xl:grid-cols-3">{Object.keys(ticketStyles).map((type) => <TicketCard key={type} type={type} {...tickets[type]} quantity={quantities[type]} onChange={(value) => updateQuantity(type, value)} />)}</div></section>
        <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"><div><p className="text-sm text-slate-400">{count} {count === 1 ? "ticket" : "tickets"} selected</p><p className="mt-1 text-3xl font-semibold">{money(total)}</p></div><button type="button" disabled={!count} className="inline-flex items-center gap-3 rounded-lg bg-[#00e692] px-8 py-3 font-semibold text-[#03110c] transition hover:bg-[#00f5a0] disabled:cursor-not-allowed disabled:opacity-40">Continue to Payment <ArrowRight size={19} /></button></section>
      </div></main>
    </ExploreLayout>
  );
}
