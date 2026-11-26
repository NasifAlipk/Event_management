import { CalendarDays, MapPin, Ticket, X } from "lucide-react";

const money = (value) => `\u20b9${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function TicketPurchaseSummary({ booking, onClose }) {
  const ticket = booking.ticket || {};
  const tickets = booking.tickets?.length ? booking.tickets : [ticket];
  const closeFromBackdrop = (event) => { if (event.target === event.currentTarget) onClose(); };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onMouseDown={closeFromBackdrop}>
      <section className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#00f5a0]/30 bg-[#0b151a] p-5 text-white shadow-2xl sm:p-7">
        <button type="button" onClick={onClose} aria-label="Close summary" className="absolute right-4 top-4 rounded-full border border-white/15 p-2 text-slate-300 hover:text-white"><X size={18} /></button>
        <div className="flex items-center gap-3"><Ticket className="text-[#00f5a0]" /><div><p className="text-xs uppercase tracking-[.2em] text-[#00f5a0]">Booking summary</p><h2 className="mt-1 text-2xl font-semibold">Ticket Purchase Summary</h2></div></div>
        <div className="mt-6 grid gap-5 sm:grid-cols-[150px_1fr]"><div className="h-36 overflow-hidden rounded-xl bg-black/30">{ticket.event_image && <img src={ticket.event_image} alt={ticket.event_name} className="h-full w-full object-cover" />}</div><div><h3 className="text-xl font-semibold">{ticket.event_name}</h3><p className="mt-3 flex items-center gap-2 text-sm text-slate-300"><CalendarDays size={15} className="text-[#00f5a0]" />{ticket.event_date} · {ticket.event_time || "Time TBA"}</p><p className="mt-2 flex items-start gap-2 text-sm text-slate-300"><MapPin size={15} className="mt-0.5 shrink-0 text-[#00f5a0]" /><span>{ticket.venue || "Venue TBA"}{ticket.address && <span className="block text-slate-500">{ticket.address}</span>}</span></p></div></div>
        <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2"><Info label="Booking ID" value={booking.booking_id || booking.id} /><Info label="Booking date" value={booking.booking_date ? new Date(booking.booking_date).toLocaleString() : "—"} /><Info label="Customer" value={ticket.customer_name} /><Info label="Tickets" value={`${booking.ticket_count || tickets.length} · ${booking.ticket_types || "—"}`} /><Info label="Seat numbers" value={booking.seat_numbers || "Not assigned"} /><Info label="Payment method" value={booking.payment_method} /><Info label="Payment status" value={booking.payment_status} /></div>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4"><h3 className="mb-3 text-sm font-semibold text-[#00f5a0]">Ticket details</h3>{tickets.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 py-2 text-sm last:border-0"><span>{item.ticket_type} · {money(item.price)}</span><span className="font-mono text-xs text-slate-500">{item.id}</span></div>)}</div>
        <div className="mt-6 grid gap-2 border-t border-white/10 pt-4 text-sm"><Amount label="Ticket amount" value={booking.ticket_amount} /><Amount label="Convenience fee" value={booking.convenience_fee} /><Amount label="GST" value={booking.gst} /><Amount label="Coupon discount" value={booking.coupon_discount} discount /><Amount label="Wallet discount" value={booking.wallet_discount} discount /><div className="mt-2 flex justify-between border-t border-white/10 pt-3 text-lg font-semibold"><span>Total paid</span><span className="text-[#00f5a0]">{money(booking.total_amount)}</span></div></div>
      </section>
    </div>
  );
}

function Info({ label, value }) { return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-words text-sm text-slate-200">{value || "—"}</p></div>; }
function Amount({ label, value, discount }) { return <div className="flex justify-between text-slate-300"><span>{label}</span><span className={discount ? "text-[#00f5a0]" : ""}>{discount ? "- " : ""}{money(value)}</span></div>; }
