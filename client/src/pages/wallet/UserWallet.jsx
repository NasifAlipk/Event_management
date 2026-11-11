import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, CalendarDays, Filter, WalletCards } from "lucide-react";

import ProfileEditor from "../../components/home/ProfileEditor";
import Sidebar from "../../components/layout/profile/UserProfile";
import { walletApi } from "../../services/wallet";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function UserWallet() {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [period, setPeriod] = useState("ALL");
  const [currentTime] = useState(() => Date.now());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    walletApi.get().then(({ data }) => setWallet(data)).finally(() => setLoading(false));
  }, []);

  const transactions = useMemo(() => wallet.transactions.filter((item) => {
    const typeMatches = filter === "ALL" || item.transaction_type === filter;
    const days = period === "30" ? 30 : period === "90" ? 90 : null;
    const dateMatches = !days || new Date(item.created_at) >= new Date(currentTime - days * 86400000);
    return typeMatches && dateMatches;
  }), [wallet.transactions, filter, period, currentTime]);

  return (
    <ProfileEditor Sidebar={Sidebar} stats={[]}>
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-2xl border border-[#00ff85]/40 bg-gradient-to-br from-[#0b2c28] to-[#071313] p-7 sm:p-10">
          <p className="text-sm font-medium tracking-wide text-slate-300">CURRENT BALANCE</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{money(wallet.balance)}</h1>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={() => setNotice("Wallet recharge is not available yet.")} className="inline-flex items-center gap-2 rounded-xl bg-[#00e692] px-5 py-3 font-semibold text-[#03110c]"><WalletCards size={18} />Add Money</button>
            <button type="button" onClick={() => setNotice("Wallet payments will be available soon.")} className="inline-flex items-center gap-2 rounded-xl border border-[#00ff85] px-5 py-3 font-semibold text-[#00ff85]"><WalletCards size={18} />Pay with Wallet</button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101c1d]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><ArrowDownLeft className="text-[#00ff85]" />Transaction History</h2>
            <div className="flex gap-2"><label className="flex items-center gap-2 rounded-lg border border-[#00ff85]/40 px-3 py-2 text-sm"><CalendarDays size={15} /><select value={period} onChange={(event) => setPeriod(event.target.value)} className="bg-transparent outline-none"><option value="ALL">All Time</option><option value="30">Last 30 Days</option><option value="90">Last 90 Days</option></select></label><label className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm"><Filter size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="bg-transparent outline-none"><option value="ALL">All</option><option value="CREDIT">Credits</option><option value="DEBIT">Debits</option></select></label></div>
          </div>
          {loading ? <p className="p-10 text-center text-slate-400">Loading wallet...</p> : transactions.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-slate-500"><tr>{["Date", "Event Details", "Reason", "Amount", "Balance"].map((heading) => <th key={heading} className="px-5 py-4">{heading}</th>)}</tr></thead><tbody>{transactions.map((item) => <tr key={item.id} className="border-b border-white/5"><td className="px-5 py-4 text-slate-300">{new Date(item.created_at).toLocaleString()}</td><td className="px-5 py-4"><div className="font-medium">{item.event_name || "Eventora Wallet"}</div><div className="text-xs text-slate-500">{item.description}</div></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${item.transaction_type === "CREDIT" ? "bg-[#00ff85]/15 text-[#00ff85]" : "bg-red-400/15 text-red-300"}`}>{item.reason.replaceAll("_", " ")}</span></td><td className={`px-5 py-4 font-semibold ${item.transaction_type === "CREDIT" ? "text-[#00ff85]" : "text-red-300"}`}>{item.transaction_type === "CREDIT" ? "+" : "-"}{money(item.amount)}</td><td className="px-5 py-4 font-medium">{money(item.balance_after)}</td></tr>)}</tbody></table></div> : <p className="p-10 text-center text-slate-400">No wallet transactions yet.</p>}
        </section>
        {notice && <p className="text-sm text-slate-400">{notice}</p>}
      </div>
    </ProfileEditor>
  );
}
