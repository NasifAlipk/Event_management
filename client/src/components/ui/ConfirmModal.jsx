import { CheckCircle2, X, XCircle } from "lucide-react";

export default function ConfirmModal({
  type,
  title,
  message,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
  loading,
  confirmLabel,
}) {
  const rejecting = type === "reject";
  const validReason = !rejecting || reason.trim().length >= 5;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#17152f] p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${rejecting ? "bg-red-400/15 text-red-300" : "bg-[#00ff85]/15 text-[#00ff85]"}`}>
            {rejecting ? <XCircle size={22} /> : <CheckCircle2 size={22} />}
          </div>
          <button type="button" onClick={onCancel} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>
        <h2 className="mt-5 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
        {rejecting && <div className="mt-5"><label htmlFor="rejection-reason" className="text-sm font-medium text-slate-200">Reason for rejection</label><textarea id="rejection-reason" value={reason} onChange={(event) => onReasonChange(event.target.value)} autoFocus rows={4} maxLength={500} placeholder="Enter the reason for rejection..." className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#0f0c29] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-400/60" /><div className="mt-1 flex justify-between text-xs text-slate-500"><span>{reason.trim().length < 5 ? "Enter at least 5 characters." : "Reason ready to submit."}</span><span>{reason.length}/500</span></div></div>}
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onCancel} disabled={loading} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 disabled:opacity-50">Cancel</button><button type="button" onClick={onConfirm} disabled={loading || !validReason} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${rejecting ? "bg-red-500 text-white hover:bg-red-600" : "bg-[#00ff85] text-black hover:bg-[#00d970]"}`}>{loading ? "Saving..." : confirmLabel || (rejecting ? "Reject application" : "Approve application")}</button></div>
      </div>
    </div>
  );
}
