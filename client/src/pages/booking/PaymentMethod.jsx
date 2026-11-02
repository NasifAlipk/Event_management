import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CreditCard, LockKeyhole, MapPin, Tag, WalletCards } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ExploreLayout from "../../components/layout/Explore/Layout";
import { useAuth } from "../../hooks/useAuth";
import { couponsApi } from "../../services/coupons";
import { eventsApi } from "../../services/events";

const TICKET_TYPES = [
  ["regular", "Regular", "regular_price", "regular_quantity"],
  ["vip", "VIP", "vip_price", "vip_quantity"],
  ["premium", "Premium", "premium_price", "premium_quantity"],
];

const formatDate = (value) => {
  if (!value) return "Date to be announced";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
};
const formatTime = (value) => {
  if (!value) return "Time to be announced";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
};
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

function PaymentOption({ selected, icon: Icon, title, description, onClick }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition ${selected ? "border-[#00f5a0] bg-[#00f5a0]/10 shadow-[0_0_25px_rgba(0,245,160,0.08)]" : "border-white/15 bg-white/[0.02] hover:border-white/30"}`}><span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${selected ? "bg-[#00f5a0]/15 text-[#00f5a0]" : "bg-white/5 text-slate-300"}`}><Icon size={28} /></span><span className="min-w-0 flex-1"><span className="block text-lg font-semibold">{title}</span><span className="mt-1 block text-sm text-slate-400">{description}</span></span><span className={`h-5 w-5 rounded-full border-2 ${selected ? "border-[#00f5a0] bg-[#00f5a0] shadow-[inset_0_0_0_4px_#111820]" : "border-slate-400"}`} /></button>;
}

export default function PaymentMethod() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [notice, setNotice] = useState("");
  const stateQuantities = location.state?.quantities;
  const quantities = useMemo(() => stateQuantities || { regular: 0, vip: 0, premium: 0 }, [stateQuantities]);

  useEffect(() => {
    const loadEvent = async () => {
      try { const { data } = await eventsApi.publishedEvent(eventId); setEvent(data.event); }
      catch { try { if (!user) throw new Error("Not signed in"); const { data } = await eventsApi.organizerEvent(eventId); setEvent(data.event); } catch { setError("This event is no longer available."); } }
    };
    loadEvent();
  }, [eventId, user]);

  const ticketPrice = useMemo(() => !event ? 0 : TICKET_TYPES.reduce((sum, [, , priceField]) => sum + Number(event[priceField] || 0) * Number(quantities[priceField.replace("_price", "")] || 0), 0), [event, quantities]);
  const ticketCount = Object.values(quantities).reduce((sum, value) => sum + Number(value || 0), 0);
  const convenienceFee = ticketCount * 20;
  const walletDiscount = Math.min(ticketPrice, Math.max(0, Number(user?.wallet_discount || 0)));
  const couponDiscount = useMemo(() => {
    if (!coupon) return 0;
    const value = Number(coupon.discount_value || 0);
    const discount = coupon.discount_type === "PERCENTAGE" ? ticketPrice * value / 100 : value;
    const capped = coupon.max_discount ? Math.min(discount, Number(coupon.max_discount)) : discount;
    return Math.min(ticketPrice, capped);
  }, [coupon, ticketPrice]);
  const gst = Math.max(0, ticketPrice + convenienceFee - walletDiscount - couponDiscount) * 0.18;
  const total = Math.max(0, ticketPrice + convenienceFee + gst - walletDiscount - couponDiscount);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponError("Enter a coupon code first."); return; }
    setApplyingCoupon(true); setCouponError("");
    try {
      const { data } = await couponsApi.available(code);
      setCoupon(data.coupon); setNotice(`${code} applied successfully.`);
    } catch (requestError) {
      setCoupon(null);
      setCouponError(requestError.response?.data?.detail || "This coupon is invalid or unavailable.");
    } finally { setApplyingCoupon(false); }
  };

  if (!event) return <ExploreLayout><main className="min-h-screen bg-[#0b1116] px-5 pb-12 pt-28 text-slate-400">{error || "Loading payment options..."}</main></ExploreLayout>;
  const venue = [event.venue_name, event.city].filter(Boolean).join(", ") || "Venue to be announced";

  return <ExploreLayout><main className="min-h-screen bg-[#081014] px-4 pb-16 pt-24 text-white sm:px-8"><div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.55fr_.85fr]">
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#00f5a0]/30 bg-[#0c1b1c] p-5 sm:p-8"><div className="flex items-start gap-4"><WalletCards className="shrink-0 text-[#00f5a0]" size={38} /><div><h1 className="text-3xl font-semibold">Payment Method</h1><p className="mt-2 text-slate-300">Choose your preferred payment method to complete your booking.</p></div></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><PaymentOption selected={paymentMethod === "WALLET"} icon={WalletCards} title="Wallet" description="Pay using your Eventora wallet" onClick={() => setPaymentMethod("WALLET")} /><PaymentOption selected={paymentMethod === "STRIPE"} icon={CreditCard} title="Stripe" description="Pay securely with Stripe" onClick={() => setPaymentMethod("STRIPE")} /></div><div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#00f5a0]/40 bg-[#00f5a0]/10 p-5"><WalletCards className="text-[#00f5a0]" size={32} /><div><p className="text-sm text-slate-300">Available Balance</p><p className="text-2xl font-semibold text-[#00f5a0]">{money(user?.wallet_balance || 0)}</p></div></div></section>
      <section className="rounded-2xl border border-[#00f5a0]/30 bg-[#0c1b1c] p-5 sm:p-8"><div className="flex items-start gap-4"><Tag className="shrink-0 text-[#00f5a0]" size={36} /><div><h2 className="text-2xl font-semibold">Available Offers & Coupons</h2><p className="mt-2 text-slate-300">Apply a coupon to reduce your payable amount.</p></div></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><label className="flex flex-1 items-center gap-3 rounded-xl border border-white/20 bg-[#081014] px-4"><Tag size={18} className="text-[#00f5a0]" /><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Enter coupon code" className="w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-500" /></label><button type="button" onClick={applyCoupon} disabled={applyingCoupon} className="rounded-xl bg-[#00e692] px-8 py-3 font-semibold text-[#03110c] disabled:opacity-50">{applyingCoupon ? "Applying..." : "Apply"}</button></div>{couponError && <p className="mt-3 text-sm text-red-300">{couponError}</p>}{notice && <p className="mt-3 flex items-center gap-2 text-sm text-[#00f5a0]"><Check size={16} />{notice}</p>}</section>
    </div>
    <aside className="h-fit rounded-2xl border border-[#00f5a0]/30 bg-[#0c1b1c] p-5 sm:p-8"><div className="flex items-center gap-4"><CalendarDays className="text-[#00f5a0]" size={36} /><h2 className="text-2xl font-semibold">Order Summary</h2></div><div className="mt-7 flex gap-4 border-b border-white/15 pb-6"><div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#081014]">{event.main_banner && <img src={event.main_banner} alt={event.title} className="h-full w-full object-contain" />}</div><div className="min-w-0"><h3 className="truncate text-lg font-semibold">{event.title}</h3><p className="mt-3 text-sm text-slate-300">{formatDate(event.start_date)} · {formatTime(event.start_time)}</p><p className="mt-2 flex items-start gap-2 text-sm text-slate-400"><MapPin size={15} className="mt-0.5 shrink-0" />{venue}</p></div></div><div className="space-y-4 border-b border-white/15 py-6 text-sm"><p className="flex justify-between gap-4"><span>Ticket Price ({ticketCount}x)</span><span>{money(ticketPrice)}</span></p><p className="flex justify-between gap-4"><span>Convenience Fee</span><span>{money(convenienceFee)}</span></p><p className="flex justify-between gap-4"><span>GST (18%)</span><span>{money(gst)}</span></p><p className="flex justify-between gap-4 text-[#00f5a0]"><span>Wallet Discount</span><span>- {money(walletDiscount)}</span></p><p className="flex justify-between gap-4 text-[#00f5a0]"><span>Coupon Discount</span><span>- {money(couponDiscount)}</span></p></div><div className="flex items-end justify-between gap-4 py-6"><span className="text-xl font-semibold">Total Amount</span><span className="text-2xl font-semibold text-[#00f5a0]">{money(total)}</span></div><button type="button" onClick={() => setNotice("Payment processing will be connected soon.")} className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#00e692] px-5 py-4 font-semibold text-[#03110c] hover:bg-[#00f5a0]"><LockKeyhole size={20} />Proceed to Pay <ArrowRight size={19} /></button><button type="button" onClick={() => navigate(`/booking/checkout/${event.id}`, { state: { quantities } })} className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 px-5 py-4 text-slate-200 hover:border-[#00f5a0]"><ArrowLeft size={18} />Back to Event</button></aside>
  </div></main></ExploreLayout>;
}
