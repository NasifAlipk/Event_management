import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import ExploreLayout from "../../components/layout/Explore/Layout";
import { checkoutApi } from "../../services/checkout";
import DigitalTicket from "./DigitalTicket";
import { ticketsApi } from "../../services/tickets";
import { walletApi } from "../../services/wallet";

export default function PaymentResult() {
  const location = useLocation();
  const [params] = useSearchParams();
  const [status, setStatus] = useState(
    location.pathname.endsWith("cancelled") ? "CANCELLED" : "PENDING"
  );
  const [ticket, setTicket] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [showTicket, setShowTicket] = useState(false);
  const sessionId = params.get("session_id");
  const orderId = params.get("order_id");
  const isWalletPayment = params.get("wallet") === "1";

  useEffect(() => {
    if ((!sessionId && !orderId) || status === "CANCELLED") return undefined;
    let active = true;
    let timer;

    const poll = async () => {
      try {
        const { data } = isWalletPayment
          ? await walletApi.orderStatus(orderId)
          : await checkoutApi.stripeSessionStatus(sessionId);
        if (!active) return;
        
        setStatus((current) => (current === data.status ? current : data.status));
        
        if (data.status === "PAID" && data.order_id && !ticket) {
          const ticketResponse = await ticketsApi.mine(data.order_id);
          if (!active) return;
          
          const issued = ticketResponse.data.tickets || [];
          setTicket(issued[0] || null);
          setTicketCount(issued.length || 1);
          setShowTicket(Boolean(issued.length));
        }
        
        if (data.status === "PENDING") {
          timer = window.setTimeout(poll, 2000);
        }
      } catch {
        if (active) setStatus("FAILED");
      }
    };

    poll();
    
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [sessionId, orderId, isWalletPayment, status, ticket]);

  const successful = status === "PAID";
  const cancelled = status === "CANCELLED" || status === "FAILED";
  
  const Icon = successful ? CheckCircle2 : cancelled ? XCircle : Clock3;
  const title = successful
    ? "Payment successful"
    : cancelled
    ? "Payment not completed"
    : "Confirming your payment";
    
  const message = successful
    ? "Your payment was verified. Your ticket booking is complete."
    : cancelled
    ? "The payment was cancelled or could not be completed. No ticket was booked."
    : "Stripe has returned successfully. We are waiting for the secure webhook confirmation.";

  const iconColor = successful
    ? "text-[#00f5a0]"
    : cancelled
    ? "text-red-300"
    : "text-amber-300";

  return (
    <ExploreLayout>
      <main className="grid min-h-screen place-items-center bg-[#081014] px-5 pt-20 text-white">
        <section className="w-full max-w-lg rounded-2xl border border-[#00f5a0]/30 bg-[#0c1b1c] p-8 text-center shadow-2xl">
          <Icon className={`mx-auto ${iconColor}`} size={54} />
          
          <h1 className="mt-5 text-3xl font-semibold">{title}</h1>
          
          <p className="mt-3 leading-7 text-slate-300">{message}</p>

          {successful && ticket && !showTicket && (
            <button
              type="button"
              onClick={() => setShowTicket(true)}
              className="mt-6 w-full rounded-xl border border-[#00f5a0]/50 bg-[#00f5a0]/10 px-5 py-3 font-semibold text-[#00f5a0] transition-colors hover:bg-[#00f5a0]/20"
            >
              View Digital Ticket
            </button>
          )}

          <Link
            to="/events"
            className="mt-7 inline-flex w-full justify-center rounded-xl bg-[#00e692] px-6 py-3 font-semibold text-[#03110c] transition-opacity hover:opacity-90"
          >
            Back to Events
          </Link>
        </section>
      </main>

      {successful && ticket && showTicket && (
        <DigitalTicket
          ticket={ticket}
          totalTickets={ticketCount}
          onClose={() => setShowTicket(false)}
        />
      )}
    </ExploreLayout>
  );
}
