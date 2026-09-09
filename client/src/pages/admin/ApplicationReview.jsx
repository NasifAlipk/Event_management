import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, FileCheck2, UserRound, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../components/layout/admin/Layout";
import { organizerApi } from "../../services/organizer";

const statusLabels = { PENDING: "Pending Review", APPROVED: "Approved", REJECTED: "Rejected" };
const statusClasses = { PENDING: "bg-amber-400/15 text-amber-300", APPROVED: "bg-emerald-400/15 text-emerald-300", REJECTED: "bg-red-400/15 text-red-300" };

const apiOrigin = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");
const fileUrl = (path) => (path?.startsWith("http") ? path : `${apiOrigin}${path || ""}`);

function Detail({ label, value }) {
  return <div><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm text-slate-200">{value || "—"}</p></div>;
}

export default function ApplicationReview() {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    organizerApi.adminApplication(applicationId).then(({ data }) => setApplication(data.application)).catch(() => setError("Unable to load this application."));
  }, [applicationId]);

  const review = async (status) => {
    setSaving(true);
    setError("");
    try {
      const { data } = await organizerApi.reviewApplication(applicationId, status);
      setApplication(data.application);
    } catch (reviewError) {
      setError(reviewError.response?.data?.detail || "Unable to update application status.");
    } finally {
      setSaving(false);
    }
  };

  if (!application) return <Layout><main className="min-h-screen bg-[#0f0c29] p-10 text-slate-400">{error || "Loading application…"}</main></Layout>;
  const document = fileUrl(application.identity_document_image);

  return (
    <Layout>
      <main className="min-h-screen bg-[#0f0c29] px-5 py-8 text-white sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Link to="/admin/applications" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#00ff85]"><ArrowLeft size={16} /> Back to applications</Link>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">Application review</p><h1 className="mt-2 text-3xl font-light">Organizer Application #{String(application.id).padStart(4, "0")}</h1><p className="mt-2 text-slate-400">Review the details and identity document before taking action.</p></div><span className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusClasses[application.status]}`}>{statusLabels[application.status]}</span></div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><h2 className="flex items-center gap-2 font-semibold"><UserRound size={18} className="text-[#00ff85]" /> Applicant information</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><Detail label="Full name" value={application.full_name} /><Detail label="Phone number" value={application.phone_number} /><Detail label="Organizer type" value={application.organizer_type} /><Detail label="Business name" value={application.organization_name} /><Detail label="Email" value={application.applicant_email} /><Detail label="Address" value={`${application.address}, ${application.city}, ${application.state}, ${application.country}`} /></div><div className="mt-5"><Detail label="Short description" value={application.short_description} /></div></section>
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><h2 className="flex items-center gap-2 font-semibold"><FileCheck2 size={18} className="text-[#00ff85]" /> Identity verification</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><Detail label="Document type" value={application.identity_document_type} /><Detail label="Document name / number" value={application.identity_document_name} /></div>{document && <div className="mt-6">{application.identity_document_image?.match(/\.(jpg|jpeg|png|webp)$/i) ? <img src={document} alt="Identity document" className="max-h-56 rounded-xl border border-white/10 object-contain" /> : null}<a href={document} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#00ff85]/30 px-4 py-2 text-sm text-[#00ff85] hover:bg-[#00ff85]/10">View full document <ExternalLink size={15} /></a></div>}</section>
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><h2 className="font-semibold">Agreement</h2><p className="mt-5 flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 size={17} /> User accepted all required terms.</p></section>
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><h2 className="font-semibold">Admin action</h2><p className="mt-2 text-sm text-slate-400">Approving this application promotes the user to an Eventora Organizer.</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" disabled={saving || application.status === "REJECTED"} onClick={() => review("REJECTED")} className="inline-flex items-center gap-2 rounded-lg border border-red-400/60 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-400/10 disabled:opacity-40"><XCircle size={17} /> Reject</button><button type="button" disabled={saving || application.status === "APPROVED"} onClick={() => review("APPROVED")} className="inline-flex items-center gap-2 rounded-lg bg-[#00ff85] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#00d970] disabled:opacity-40"><CheckCircle2 size={17} /> Approve organizer</button></div>{error && <p className="mt-4 text-sm text-red-300">{error}</p>}</section>
          </div>
        </div>
      </main>
    </Layout>
  );
}
