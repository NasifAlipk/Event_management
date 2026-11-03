import { useEffect, useMemo, useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  CalendarDays, 
  Check, 
  CreditCard, 
  Copy, 
  LockKeyhole, 
  MapPin, 
  Tag, 
  WalletCards 
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ExploreLayout from "../../components/layout/Explore/Layout";
import { useAuth } from "../../hooks/useAuth";
import { checkoutApi } from "../../services/checkout";
import { eventsApi } from "../../services/events";

const money = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;
};

const dateText = (value) => {
  if (!value) {
    return "Date to be announced";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

const timeText = (value) => {
  if (!value) {
    return "Time to be announced";
  }

  const [hour, minute] = value.split(":").map(Number);

  if (Number.isNaN(hour)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hour, minute));
};

function PaymentOption({ selected, icon: Icon, title, description, onClick }) {
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${
        selected ? "border-[#00f5a0] bg-[#00f5a0]/10" : "border-white/15 bg-white/[0.02] hover:border-white/30"
      }`}
    >
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${
        selected ? "bg-[#00f5a0]/15 text-[#00f5a0]" : "bg-white/5 text-slate-300"
      }`}>
        <Icon size={28} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold">{title}</span>
        <span className="mt-1 block text-sm text-slate-400">{description}</span>
      </span>
      <span className={`h-5 w-5 rounded-full border-2 ${
        selected ? "border-[#00f5a0] bg-[#00f5a0] shadow-[inset_0_0_0_4px_#111820]" : "border-slate-400"
      }`} />
    </button>
  );
}

export default function PaymentMethod() {
  const { eventId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const quantities = useMemo(() => state?.quantities || { regular: 0, vip: 0, premium: 0 }, [state?.quantities]);
  
  const [event, setEvent] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [pricing, setPricing] = useState({ 
    ticket_price: 0, 
    convenience_fee: 0, 
    gst: 0, 
    wallet_discount: 0, 
    coupon_discount: 0, 
    total: 0, 
    ticket_count: 0 
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [notice, setNotice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  const quote = async (code = "") => {
    const { data } = await checkoutApi.quote(eventId, { ...quantities, coupon: code });
    setPricing(data.pricing);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await eventsApi.publishedEvent(eventId).catch(async () => {
          if (!user) throw new Error("Not signed in");
          return eventsApi.organizerEvent(eventId);
        });
        
        if (!active) return;
        setEvent(response.data.event);
        
        const [couponResponse, quoteResponse] = await Promise.all([
          checkoutApi.coupons(eventId),
          checkoutApi.quote(eventId, quantities),
        ]);
        
        if (active) {
          setCoupons(couponResponse.data.coupons || []);
          setPricing(quoteResponse.data.pricing);
        }
      } catch {
        if (active) setNotice("Unable to load checkout details.");
      } finally {
        if (active) setLoading(false);
      }
    };
    
    load();
    return () => { active = false; };
  }, [eventId, user, quantities]);

  const applyCoupon = async (code = couponCode) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) { 
      setCouponError("Enter a coupon code first."); 
      return; 
    }
    
    setCouponError(""); 
    setNotice("");
    
    try {
      await quote(normalized);
      setCouponCode(normalized);
      setNotice(`${normalized} applied successfully.`);
    } catch (requestError) {
      setCouponError(requestError.response?.data?.detail || "This coupon is invalid or unavailable.");
      await quote();
    }
  };

  if (loading || !event) {
    return (
      <ExploreLayout>
        <main className="min-h-screen bg-[#081014] px-5 pb-12 pt-28 text-slate-400">
          {notice || "Loading payment options..."}
        </main>
      </ExploreLayout>
    );
  }

  const venue = [event.venue_name, event.city].filter(Boolean).join(", ") || "Venue to be announced";

  return (
    <ExploreLayout>
      <main className="min-h-screen bg-[#081014] px-4 pb-16 pt-24 text-white sm:px-8">
        <div className="mx-auto grid max-w-7xl items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,.85fr)]">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* Payment Options Section */}
            <section className="rounded-2xl border border-[#00f5a0]/30 bg-[#0c1b1c] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <WalletCards className="shrink-0 text-[#00f5a0]" size={38} />
                <div>
                  <h1 className="text-3xl font-semibold">Payment Method</h1>
                  <p className="mt-2 text-slate-300">Choose your preferred payment method to complete your booking.</p>
                </div>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <PaymentOption 
                  selected={paymentMethod === "WALLET"} 
                  icon={WalletCards} 
                  title="Wallet" 
                  description="Available for a future payment integration" 
                  onClick={() => setPaymentMethod("WALLET")} 
                />
                <PaymentOption 
                  selected={paymentMethod === "STRIPE"} 
                  icon={CreditCard} 
                  title="Stripe" 
                  description="Available for a future payment integration" 
                  onClick={() => setPaymentMethod("STRIPE")} 
                />
              </div>
            </section>

            {/* Coupons Section */}
            <section className="rounded-2xl border border-[#00f5a0]/30 bg-[#0c1b1c] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Tag className="shrink-0 text-[#00f5a0]" size={36} />
                <div>
                  <h2 className="text-2xl font-semibold">Available Offers & Coupons</h2>
                  <p className="mt-2 text-slate-300">Only active coupons from this event’s organizer are shown.</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {coupons.length ? (
                  coupons.map((coupon) => (
                    <div key={coupon.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-white/15 bg-[#081014] p-4">
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#00f5a0]/15 text-[#00f5a0]">
                        <Tag size={23} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{coupon.name}</p>
                        <p className="text-sm text-slate-400">{coupon.description || "Discount available for this event."}</p>
                        <p className="mt-1 text-xs text-[#00f5a0]">
                          {coupon.discount_type === "PERCENTAGE" ? `${coupon.discount_value}% off` : `${money(coupon.discount_value)} off`}
                        </p>
                      </div>
                      <code className="rounded border border-dashed border-slate-500 px-3 py-2 text-sm">
                        {coupon.code}
                      </code>
                      <button 
                        type="button" 
                        onClick={() => { 
                          setCouponCode(coupon.code); 
                          void navigator.clipboard?.writeText(coupon.code); 
                          setCopied(coupon.code); 
                        }} 
                        className="inline-flex items-center gap-2 rounded-lg border border-[#00f5a0]/60 px-3 py-2 text-sm text-[#00f5a0]"
                      >
                        <Copy size={15} />{copied === coupon.code ? "Copied" : "Copy"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => applyCoupon(coupon.code)} 
                        className="rounded-lg bg-[#00e692] px-4 py-2 text-sm font-semibold text-[#03110c]"
                      >
                        Apply
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-slate-400">
                    No active coupons are available for this organizer.
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="flex flex-1 items-center gap-3 rounded-xl border border-white/20 bg-[#081014] px-4">
                  <Tag size={18} className="text-[#00f5a0]" />
                  <input 
                    value={couponCode} 
                    onChange={(event) => setCouponCode(event.target.value)} 
                    placeholder="Enter coupon code" 
                    className="w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-500" 
                  />
                </label>
                <button 
                  type="button" 
                  onClick={() => applyCoupon()} 
                  className="rounded-xl bg-[#00e692] px-8 py-3 font-semibold text-[#03110c]"
                >
                  Apply
                </button>
              </div>

              {couponError && <p className="mt-3 text-sm text-red-300">{couponError}</p>}
              {notice && (
                <p className="mt-3 flex items-center gap-2 text-sm text-[#00f5a0]">
                  <Check size={16} />{notice}
                </p>
              )}
            </section>
          </div>

          {/* Right Column / Order Summary Sidebar */}
          <aside className="h-fit rounded-2xl border border-[#00f5a0]/30 bg-[#0c1b1c] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <CalendarDays className="text-[#00f5a0]" size={36} />
              <h2 className="text-2xl font-semibold">Order Summary</h2>
            </div>

            <div className="mt-7 flex gap-4 border-b border-white/15 pb-6">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#081014]">
                {event.main_banner && (
                  <img src={event.main_banner} alt={event.title} className="h-full w-full object-contain" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold">{event.title}</h3>
                <p className="mt-3 text-sm text-slate-300">
                  {dateText(event.start_date)} · {timeText(event.start_time)}
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm text-slate-400">
                  <MapPin size={15} className="mt-0.5 shrink-0" />{venue}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-b border-white/15 py-6 text-sm">
              <p className="flex justify-between gap-4">
                <span>Ticket Price ({pricing.ticket_count}x)</span>
                <span>{money(pricing.ticket_price)}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span>Convenience Fee</span>
                <span>{money(pricing.convenience_fee)}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span>GST (18%)</span>
                <span>{money(pricing.gst)}</span>
              </p>
              <p className="flex justify-between gap-4 text-[#00f5a0]">
                <span>Wallet Discount</span>
                <span>- {money(pricing.wallet_discount)}</span>
              </p>
              <p className="flex justify-between gap-4 text-[#00f5a0]">
                <span>Coupon Discount</span>
                <span>- {money(pricing.coupon_discount)}</span>
              </p>
            </div>

            <div className="flex items-end justify-between gap-4 py-6">
              <span className="text-xl font-semibold">Total Amount</span>
              <span className="text-2xl font-semibold text-[#00f5a0]">{money(pricing.total)}</span>
            </div>

            <button 
              type="button" 
              onClick={() => setNotice("Payment processing will be connected soon.")} 
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#00e692] px-5 py-4 font-semibold text-[#03110c] hover:bg-[#00f5a0]"
            >
              <LockKeyhole size={20} />Proceed to Pay <ArrowRight size={19} />
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate(`/booking/checkout/${event.id}`, { state: { quantities } })} 
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 px-5 py-4 text-slate-200 hover:border-[#00f5a0]"
            >
              <ArrowLeft size={18} />Back to Event
            </button>
          </aside>

        </div>
      </main>
    </ExploreLayout>
  );
}