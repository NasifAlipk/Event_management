import { useState } from "react";
import { CalendarDays, Download, MapPin, Ticket as TicketIcon, X } from "lucide-react";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function DigitalTicket({ ticket, totalTickets = 1, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const downloadTicket = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      const width = 900;
      const height = 1150;
      const qr = await loadImage(ticket.qr_code);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.fillStyle = "#071313";
      context.fillRect(0, 0, width, height);
      context.strokeStyle = "#00f5a0";
      context.lineWidth = 3;
      context.strokeRect(28, 28, width - 56, height - 56);
      context.fillStyle = "#f8fafc";
      context.font = "700 42px Arial";
      context.fillText("EventOra", 70, 100);
      context.font = "700 34px Arial";
      context.fillText(ticket.event_name, 70, 185);
      context.font = "24px Arial";
      context.fillStyle = "#cbd5e1";
      context.fillText(`${ticket.event_date}  •  ${ticket.event_time || "Time TBA"}`, 70, 245);
      context.fillText(ticket.location || "Location TBA", 70, 290);
      context.fillStyle = "#00f5a0";
      context.font = "700 28px Arial";
      context.fillText(`${ticket.ticket_type} ticket  •  ${totalTickets} ticket${totalTickets === 1 ? "" : "s"}`, 70, 380);
      context.fillStyle = "#f8fafc";
      context.font = "22px monospace";
      context.fillText(`Ticket ID: ${ticket.id}`, 70, 440);
      context.font = "24px Arial";
      context.fillText(`Customer: ${ticket.customer_name}`, 70, 485);
      context.fillText(`Price: ${money(ticket.price)}`, 70, 530);
      context.drawImage(qr, 320, 650, 260, 260);
      context.fillStyle = "#94a3b8";
      context.font = "18px Arial";
      context.fillText("Present this QR code at the venue entrance", 220, 970);
      const link = document.createElement("a");
      link.download = `eventora-ticket-${ticket.id}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setDownloadError("We could not prepare the ticket image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#00f5a0]/40 bg-[#071313] p-6 text-white shadow-2xl shadow-[#00f5a0]/10 sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full border border-white/20 p-2 text-slate-300 hover:text-white" aria-label="Close ticket"><X size={20} /></button>
        <div className="flex items-center gap-3 text-[#00f5a0]"><TicketIcon size={25} /><span className="font-semibold tracking-[.2em]">DIGITAL TICKET</span></div>
        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_150px]">
          <div>
            {ticket.event_image && <img src={ticket.event_image} alt={ticket.event_name} className="mb-5 h-44 w-full rounded-xl object-cover" />}
            <h2 className="text-3xl font-semibold">{ticket.event_name}</h2>
            <p className="mt-4 flex items-center gap-2 text-slate-300"><CalendarDays size={17} />{ticket.event_date} · {ticket.event_time || "Time TBA"}</p>
            <p className="mt-2 flex items-center gap-2 text-slate-300"><MapPin size={17} />{ticket.location || "Location TBA"}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><p><span className="block text-slate-500">Customer</span>{ticket.customer_name}</p><p><span className="block text-slate-500">Ticket type</span>{ticket.ticket_type}</p><p><span className="block text-slate-500">Ticket ID</span><span className="break-all font-mono text-xs">{ticket.id}</span></p><p><span className="block text-slate-500">Quantity</span>{totalTickets}</p></div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-3"><img src={ticket.qr_code} alt="Ticket verification QR code" className="w-full" /><p className="mt-2 text-center text-xs text-slate-700">Scan to verify</p></div>
        </div>
        <button type="button" onClick={downloadTicket} disabled={downloading} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00e692] px-5 py-3 font-semibold text-[#03110c] disabled:opacity-60"><Download size={18} />{downloading ? "Preparing ticket…" : "Download Ticket"}</button>
        {downloadError && <p className="mt-2 text-center text-sm text-red-300">{downloadError}</p>}
      </section>
    </div>
  );
}

function loadImage(source, crossOrigin = false) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (crossOrigin) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}
