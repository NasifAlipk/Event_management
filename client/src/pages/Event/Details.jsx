import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Minus,
  Plus,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ExploreLayout from "../../components/layout/Explore/Layout";
import { useAuth } from "../../hooks/useAuth";
import { eventsApi } from "../../services/events";

const TICKET_STYLES = {
  regular: {
    label: "Regular",
    accent: "#00f5a0",
    border: "border-[#00f5a0]",
    text: "text-[#00f5a0]",
    glow: "shadow-[0_0_35px_rgba(0,245,160,0.08)]",
    benefits: [
      "Entry to the Event",
      "Access to Main Area",
      "Standard Seating",
    ],
  },
  vip: {
    label: "VIP",
    accent: "#b65cff",
    border: "border-[#b65cff]",
    text: "text-[#c276ff]",
    glow: "shadow-[0_0_35px_rgba(182,92,255,0.08)]",
    benefits: [
      "All Regular Benefits",
      "VIP Lounge Access",
      "Dedicated VIP Entry",
      "Complimentary Drinks",
      "Premium Seating",
    ],
  },
  premium: {
    label: "Premium",
    accent: "#f7c843",
    border: "border-[#f7c843]",
    text: "text-[#f7d568]",
    glow: "shadow-[0_0_35px_rgba(247,200,67,0.08)]",
    benefits: [
      "All VIP Benefits",
      "Front Row Access",
      "Meet & Greet with DJ",
      "Complimentary Food & Drinks",
      "Exclusive Merchandise",
    ],
  },
};

const formatDate = (value) => {
  if (!value) return "Date to be announced";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
};

const formatTime = (value) => {
  if (!value) return "Time to be announced";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hours, minutes));
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

function TicketCard({ type, price, available, quantity, onChange }) {
  const style = TICKET_STYLES[type];
  const selected = quantity > 0;

  return (
    <article
      className={`flex min-h-[405px] flex-col rounded-xl border-2 bg-[#111820] p-6 transition ${style.border} ${style.glow} ${
        selected ? "ring-1 ring-white/20" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className={`text-2xl font-semibold ${style.text}`}>
          {style.label}
        </h3>
        <span className={`flex items-center gap-2 text-sm ${style.text}`}>
          Remaining {available}
          <span
            className="h-5 w-5 rounded-full border-2"
            style={{
              borderColor: style.accent,
              backgroundColor: selected ? style.accent : "transparent",
            }}
          />
        </span>
      </div>

      <p className="mt-3 text-3xl font-semibold text-slate-100">
        {money(price)}
      </p>

      <ul className="mt-7 space-y-4 text-sm leading-5 text-slate-300">
        {style.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-3">
            <Check
              size={20}
              className="mt-0.5 shrink-0"
              style={{ color: style.accent }}
            />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <div
        className="mt-auto flex items-center justify-between rounded-lg border px-4 py-2"
        style={{ borderColor: style.accent }}
      >
        <button
          type="button"
          disabled={quantity <= 0}
          onClick={() => onChange(quantity - 1)}
          className="p-1 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Decrease ${style.label} tickets`}
        >
          <Minus size={21} style={{ color: style.accent }} />
        </button>
        <span className="text-xl font-medium text-white">{quantity}</span>
        <button
          type="button"
          disabled={quantity >= available}
          onClick={() => onChange(quantity + 1)}
          className="p-1 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Increase ${style.label} tickets`}
        >
          <Plus size={21} style={{ color: style.accent }} />
        </button>
      </div>
    </article>
  );
}

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [quantities, setQuantities] = useState({
    regular: 0,
    vip: 0,
    premium: 0,
  });
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { data } = await eventsApi.publishedEvent(eventId);
        setEvent(data.event);
      } catch {
        try {
          if (!user) throw new Error("Not signed in");
          const { data } = await eventsApi.organizerEvent(eventId);
          setEvent(data.event);
        } catch {
          setError("This event is no longer available.");
        }
      }
    };
    loadEvent();
  }, [eventId, user]);

  const tickets = useMemo(
    () => ({
      regular: {
        price: event?.regular_price,
        available: Number(event?.regular_quantity || 0),
      },
      vip: {
        price: event?.vip_price,
        available: Number(event?.vip_quantity || 0),
      },
      premium: {
        price: event?.premium_price,
        available: Number(event?.premium_quantity || 0),
      },
    }),
    [event]
  );

  const totalAmount = Object.keys(tickets).reduce(
    (total, type) =>
      total + Number(tickets[type].price || 0) * quantities[type],
    0
  );

  const selectedTickets = Object.values(quantities).reduce(
    (sum, value) => sum + value,
    0
  );

  const remainingSeats = Object.values(tickets).reduce(
    (sum, ticket) => sum + ticket.available,
    0
  );

  const isOwner = Number(event?.organizer) === Number(user?.id);

  const updateQuantity = (type, value) => {
    setCheckoutMessage("");
    setQuantities((current) => ({
      ...current,
      [type]: Math.max(0, Math.min(value, tickets[type].available)),
    }));
  };

  if (!event) {
    return (
      <ExploreLayout>
        <main className="min-h-screen bg-[#0b1116] px-5 pb-12 pt-28 text-slate-400">
          {error || "Loading event..."}
        </main>
      </ExploreLayout>
    );
  }

  return (
    <ExploreLayout>
      <main className="min-h-screen bg-[#0b1116] px-4 pb-28 pt-24 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#00f5a0]"
            >
              <ArrowLeft size={16} />
              Back to Events
            </Link>
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="grid h-11 w-11 place-items-center rounded-full border border-slate-500/60 bg-slate-800/60 text-slate-100 transition hover:border-[#00f5a0] hover:text-[#00f5a0]"
              aria-label="Close event details"
            >
              <X size={23} />
            </button>
          </div>

          <section className="mt-5 grid gap-8 border-b border-slate-700/70 pb-8 lg:grid-cols-[350px_1fr] lg:gap-10">
            <div className="flex min-h-[430px] items-center justify-center overflow-hidden rounded-xl border border-slate-600 bg-[#080d12] p-2">
              {event.main_banner ? (
                <img
                  src={event.main_banner}
                  alt={event.title}
                  className="h-full max-h-[530px] w-full object-contain"
                />
              ) : (
                <div className="grid h-full min-h-[410px] place-items-center text-slate-500">
                  <Ticket size={42} />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#00f5a0] px-4 py-1.5 text-sm text-[#00f5a0]">
                  <Ticket size={17} />
                  {event.category || "Event"}
                </span>
                {isOwner && event.status === "APPROVED" && (
                  <span className="rounded-full bg-[#00f5a0]/10 px-3 py-1.5 text-xs text-[#00f5a0]">
                    Approved event
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                {event.title}
              </h1>
              <p className="mt-2 text-xl text-slate-300">
                {event.event_type || "Live Event"}
              </p>

              <div className="mt-8 space-y-5 text-base text-slate-200">
                <p className="flex items-center gap-4">
                  <CalendarDays className="shrink-0" size={25} />
                  {formatDate(event.start_date)}
                  {event.end_date && event.end_date !== event.start_date
                    ? ` – ${formatDate(event.end_date)}`
                    : ""}
                </p>
                <p className="flex items-center gap-4">
                  <Clock3 className="shrink-0" size={25} />
                  {formatTime(event.start_time)}
                  {event.end_time ? ` – ${formatTime(event.end_time)}` : ""}
                </p>
                <p className="flex items-center gap-4">
                  <MapPin className="shrink-0" size={25} />
                  {[
                    event.venue_name,
                    event.city,
                    event.state,
                    event.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Venue to be announced"}
                </p>
                <p className="flex items-center gap-4">
                  <Users className="shrink-0" size={25} />
                  {event.max_participants || 0} Participants
                </p>
              </div>

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-700/80 pt-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Available seats
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#00f5a0]">
                    Only {remainingSeats} seats left!
                  </p>
                </div>
                <p className="text-right text-sm text-slate-400">
                  {event.address || ""}
                </p>
              </div>
            </div>
          </section>

          <section className="border-b border-slate-700/70 py-8">
            <h2 className="text-2xl font-semibold">About This Event</h2>
            <p className="mt-3 max-w-5xl whitespace-pre-line text-base leading-7 text-slate-300">
              {event.description ||
                "More information about this event will be available soon."}
            </p>
            {event.special_instructions && (
              <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-400">
                {event.special_instructions}
              </p>
            )}
          </section>

          <section className="pt-8">
            <h2 className="text-3xl font-semibold">Choose Your Ticket</h2>
            <p className="mt-2 text-base text-slate-400">
              Select the perfect experience for you
            </p>
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              {Object.keys(TICKET_STYLES).map((type) => (
                <TicketCard
                  key={type}
                  type={type}
                  {...tickets[type]}
                  quantity={quantities[type]}
                  onChange={(value) => updateQuantity(type, value)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-700 bg-[#0b1116]/95 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-300">Total Amount</p>
            <p className="text-2xl font-semibold">{money(totalAmount)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/events"
              className="rounded-lg border border-slate-600 px-8 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-400"
            >
              Back
            </Link>
            <button
              type="button"
              disabled={!selectedTickets}
              onClick={() =>
                setCheckoutMessage(
                  "Checkout is not available yet. Your ticket selection has been saved on this page."
                )
              }
              className="inline-flex items-center gap-3 rounded-lg bg-[#00e692] px-7 py-3 text-sm font-semibold text-[#03110c] transition hover:bg-[#00f5a0] disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-64 sm:justify-center"
            >
              Proceed to Checkout <ArrowRight size={19} />
            </button>
          </div>
          {checkoutMessage && (
            <p className="basis-full text-right text-xs text-amber-300">
              {checkoutMessage}
            </p>
          )}
        </div>
      </footer>
    </ExploreLayout>
  );
}