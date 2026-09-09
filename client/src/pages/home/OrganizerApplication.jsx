import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, FileText, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/home/Header";
import { organizerApi } from "../../services/organizer";

const initialForm = {
  full_name: "",
  phone_number: "",
  organizer_type: "",
  organization_name: "",
  short_description: "",
  address: "",
  city: "",
  state: "",
  country: "",
  identity_document_type: "",
  identity_document_name: "",
  identity_document_image: null,
  information_accurate: false,
  terms_accepted: false,
};

const fields = [
  ["full_name", "Full name", "text"],
  ["phone_number", "Phone number", "tel"],
  ["organization_name", "Organizer / business name", "text"],
  ["address", "Address", "text"],
  ["city", "City", "text"],
  ["state", "State", "text"],
  ["country", "Country", "text"],
  ["identity_document_name", "Identity document name", "text"],
];

function getError(error) {
  const data = error.response?.data;
  if (data?.detail) return data.detail;
  if (!data) return "We could not submit your application. Please try again.";
  const first = Object.values(data).flat()[0];
  return first || "Please check the form and try again.";
}

export default function OrganizerApplication() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const chooseDocument = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setForm((current) => ({ ...current, identity_document_image: file }));
    setPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") data.append(key, value);
    });
    try {
      await organizerApi.submitApplication(data);
      navigate("/dashboard", {
        replace: true,
        state: { message: "Your organizer application was submitted successfully." },
      });
    } catch (submissionError) {
      setError(getError(submissionError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#111820] px-4 pb-16 pt-24 text-white sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#00ff85]"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.25em] text-[#00ff85]">
                Grow with Eventora
              </p>
              <h1 className="mt-3 text-4xl font-light sm:text-5xl">
                Host <span className="font-semibold text-[#00ff85]">With Us</span>
              </h1>
              <p className="mt-3 max-w-xl text-slate-400">
                Tell us about yourself and your events. Our team will review your
                application and get back to you soon.
              </p>
            </div>
            <div className="hidden rounded-2xl border border-[#00ff85]/20 bg-[#00ff85]/10 p-5 text-[#00ff85] sm:block">
              <ArrowUpRight size={38} />
            </div>
          </div>

          <form
            onSubmit={submit}
            className="mt-10 rounded-2xl border border-white/10 bg-[#171e25] p-5 shadow-2xl sm:p-8"
          >
            <h2 className="text-xl font-semibold">Organizer application form</h2>
            <p className="mt-1 text-sm text-slate-400">All fields marked with * are required.</p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {fields.slice(0, 2).map(([name, label, type]) => (
                <label key={name} className="text-sm text-slate-300">
                  {label} <span className="text-[#00ff85]">*</span>
                  <input name={name} type={type} required value={form[name]} onChange={update} className="form-input" placeholder={`Enter your ${label.toLowerCase()}`} />
                </label>
              ))}
              <label className="text-sm text-slate-300">
                Organizer type <span className="text-[#00ff85]">*</span>
                <select name="organizer_type" required value={form.organizer_type} onChange={update} className="form-input">
                  <option value="">Select organizer type</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="COMPANY">Company</option>
                </select>
              </label>
              {fields.slice(2, 3).map(([name, label, type]) => (
                <label key={name} className="text-sm text-slate-300">
                  {label} <span className="text-[#00ff85]">*</span>
                  <input name={name} type={type} required value={form[name]} onChange={update} className="form-input" placeholder={`Enter your ${label.toLowerCase()}`} />
                </label>
              ))}
            </div>

            <label className="mt-5 block text-sm text-slate-300">
              Short description <span className="text-[#00ff85]">*</span>
              <textarea name="short_description" required maxLength={1000} value={form.short_description} onChange={update} rows={4} className="form-input resize-none" placeholder="Tell us about yourself or your organization..." />
            </label>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {fields.slice(3, 7).map(([name, label, type]) => (
                <label key={name} className="text-sm text-slate-300">
                  {label} <span className="text-[#00ff85]">*</span>
                  <input name={name} type={type} required value={form[name]} onChange={update} className="form-input" />
                </label>
              ))}
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm text-slate-300">
                Identity document type <span className="text-[#00ff85]">*</span>
                <select name="identity_document_type" required value={form.identity_document_type} onChange={update} className="form-input">
                  <option value="">Select document type</option>
                  <option value="National ID">National ID</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving license</option>
                  <option value="Business Registration">Business registration</option>
                </select>
              </label>
              {fields.slice(7).map(([name, label, type]) => (
                <label key={name} className="text-sm text-slate-300">
                  {label} <span className="text-[#00ff85]">*</span>
                  <input name={name} type={type} required value={form[name]} onChange={update} className="form-input" />
                </label>
              ))}
            </div>

            <label className="mt-5 block cursor-pointer rounded-xl border border-dashed border-white/20 p-6 text-center transition hover:border-[#00ff85]/60 hover:bg-[#00ff85]/5">
              <input type="file" required accept="image/jpeg,image/png,application/pdf" onChange={chooseDocument} className="sr-only" />
              {preview ? <img src={preview} alt="Document preview" className="mx-auto mb-3 h-24 rounded-lg object-cover" /> : <Upload className="mx-auto text-[#00ff85]" size={28} />}
              <span className="mt-2 block text-sm font-medium">{form.identity_document_image?.name || "Upload identity document"}</span>
              <span className="mt-1 block text-xs text-slate-500">JPG, PNG, or PDF · maximum 5 MB</span>
            </label>

            <div className="mt-7 border-t border-white/10 pt-6">
              <h3 className="font-semibold">Terms & conditions agreement <span className="text-[#00ff85]">*</span></h3>
              <label className="mt-4 flex items-start gap-3 text-sm text-slate-300">
                <input type="checkbox" name="information_accurate" checked={form.information_accurate} onChange={update} required className="mt-1 accent-[#00ff85]" />
                <span>I confirm that all the information provided is accurate.</span>
              </label>
              <label className="mt-3 flex items-start gap-3 text-sm text-slate-300">
                <input type="checkbox" name="terms_accepted" checked={form.terms_accepted} onChange={update} required className="mt-1 accent-[#00ff85]" />
                <span>I agree to the platform&apos;s terms and conditions.</span>
              </label>
            </div>
            {error && <p className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={submitting} className="mx-auto mt-8 flex items-center gap-2 rounded-lg bg-[#00ff85] px-7 py-3 font-semibold text-black transition hover:bg-[#00d970] disabled:cursor-wait disabled:opacity-60">
              <FileText size={17} /> {submitting ? "Submitting..." : "Submit application"} <Check size={17} />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
