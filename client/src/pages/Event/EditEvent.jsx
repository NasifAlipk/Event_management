
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarPlus, ImagePlus, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ExploreLayout from "../../components/layout/Explore/Layout";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { eventsApi } from "../../services/events";

const fields = [
  "title",
  "event_type",
  "category",
  "start_date",
  "start_time",
  "end_date",
  "end_time",
  "venue_name",
  "address",
  "city",
  "state",
  "country",
  "pin_code",
  "max_participants",
  "regular_price",
  "regular_quantity",
  "vip_price",
  "vip_quantity",
  "premium_price",
  "premium_quantity",
];

const labels = {
  title: "Event title",
  event_type: "Event type",
  category: "Event category",
  start_date: "Start date",
  start_time: "Start time",
  end_date: "End date",
  end_time: "End time",
  venue_name: "Venue name",
  address: "Address",
  city: "City",
  state: "State",
  country: "Country",
  pin_code: "Pin code",
  max_participants: "Maximum participants",
  regular_price: "Regular price",
  regular_quantity: "Regular quantity",
  vip_price: "VIP price",
  vip_quantity: "VIP quantity",
  premium_price: "Premium price",
  premium_quantity: "Premium quantity",
};

export default function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [bannerPreview, setBannerPreview] = useState("");
  const [promotionPreview, setPromotionPreview] = useState("");

  useEffect(() => {
    eventsApi
      .organizerEvent(eventId)
      .then(({ data }) => {
        setForm(data.event);
        setBannerPreview(data.event.main_banner || "");
        setPromotionPreview(data.event.promotional_image || "");
      })
      .catch(() => setError("Unable to load this event."))
      .finally(() => setLoading(false));
  }, [eventId]);

  const change = (e) =>
    setForm((current) => ({
      ...current,
      [e.target.name]:
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    }));

  const validate = () => {
    const start = new Date(
      String(form.start_date) + "T" + String(form.start_time)
    );

    const end = new Date(
      String(form.end_date) + "T" + String(form.end_time)
    );

    const total = [
      "regular_quantity",
      "vip_quantity",
      "premium_quantity",
    ].reduce((sum, key) => sum + Number(form[key] || 0), 0);

    if ((form.title || "").trim().length < 3) {
      return "Event title must be at least 3 characters.";
    }

    if ((form.description || "").trim().length < 20) {
      return "Description must be at least 20 characters.";
    }

    if (Number.isNaN(start.getTime()) || start <= new Date()) {
      return "The event start must be in the future.";
    }

    if (end <= start) {
      return "The end must be after the start.";
    }

    if (
      Number(form.max_participants) < 1 ||
      total !== Number(form.max_participants)
    ) {
      return "Maximum participants must exactly match ticket quantities.";
    }

    if (
      [
        "regular_price",
        "regular_quantity",
        "vip_price",
        "vip_quantity",
        "premium_price",
        "premium_quantity",
      ].some((key) => Number(form[key]) <= 0)
    ) {
      return "Every ticket price and quantity must be greater than 0.";
    }

    return "";
  };

  const submit = (e) => {
    e.preventDefault();

    const message = validate();
    setError(message);

    if (!message) {
      setConfirm(true);
    }
  };

  const selectImage = (name, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFiles((current) => ({ ...current, [name]: file }));
    const preview = URL.createObjectURL(file);
    if (name === "main_banner") setBannerPreview(preview);
    else setPromotionPreview(preview);
  };

  const save = async () => {
    setSaving(true);

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (
        key !== "main_banner" &&
        key !== "promotional_image" &&
        value !== undefined &&
        value !== null
      ) {
        data.append(key, value);
      }
    });

    Object.entries(files).forEach(([key, value]) => {
      if (value) {
        data.append(key, value);
      }
    });

    try {
      await eventsApi.update(eventId, data);

      navigate("/profile", {
        replace: true,
        state: {
          message: "Event changes saved and submitted for approval.",
        },
      });
    } catch (e) {
      const body = e.response?.data;

      setError(
        body?.detail ||
          (body && typeof body === "object"
            ? Object.values(body).flat().join(" ")
            : "Unable to save changes.")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ExploreLayout>
        <main className="grid min-h-screen place-items-center pt-20 text-slate-400">
          Loading event...
        </main>
      </ExploreLayout>
    );
  }

  return (
    <ExploreLayout>
      <main className="min-h-screen bg-[#0d1418] px-4 pb-16 pt-24 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#00ff85]"
          >
            <ArrowLeft size={16} />
            Back to profile
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <CalendarPlus className="text-[#00ff85]" size={30} />
            <div>
              <p className="text-sm uppercase tracking-[.22em] text-[#00ff85]">Organizer workspace</p>
              <h1 className="mt-1 text-3xl font-light sm:text-4xl">Edit Your Event</h1>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <form
            onSubmit={submit}
            className="mt-8 grid gap-5 lg:grid-cols-2"
          >
            <section className="space-y-5 rounded-2xl border border-white/10 bg-[#171e25] p-5">
              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">Basic Information</h2>
              {fields.slice(0, 3).map((name) => (
              <label
                key={name}
                className="text-sm text-slate-300"
              >
                {labels[name]}

                <input
                  name={name}
                  type={
                    name.includes("date")
                      ? "date"
                      : name.includes("time")
                        ? "time"
                        : ["max_participants", "price", "quantity"].some(
                              (part) => name.includes(part)
                            )
                          ? "number"
                          : "text"
                  }
                  value={form[name] ?? ""}
                  onChange={change}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff85]/60"
                />
              </label>
              ))}

            <label className="text-sm text-slate-300">
              Description

              <textarea
                name="description"
                value={form.description || ""}
                onChange={change}
                rows="4"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff85]/60"
              />
            </label>

              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">Schedule</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.slice(3, 7).map((name) => <label key={name} className="text-sm text-slate-300">{labels[name]}<input name={name} type={name.includes("date") ? "date" : "time"} value={form[name] ?? ""} onChange={change} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff85]/60" /></label>)}
              </div>

              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">Event Branding</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[["main_banner", "Main event banner", bannerPreview], ["promotional_image", "Promotional image", promotionPreview]].map(([name, label, preview]) => <label key={name} className="flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#00ff85]/50 bg-[#111820] p-3 text-center text-sm text-slate-300"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectImage(name, event)} className="sr-only" />{preview ? <img src={preview} alt={label} className="h-24 w-full rounded-lg object-contain" /> : <ImagePlus className="mb-2 text-[#00ff85]" size={24} />}<span className="mt-2">{files[name]?.name || label}</span><span className="text-xs text-slate-500">Click to replace image</span></label>)}
              </div>
            </section>

            <section className="space-y-5 rounded-2xl border border-white/10 bg-[#171e25] p-5">
              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">Venue Details</h2>
              {fields.slice(7, 13).map((name) => <label key={name} className="text-sm text-slate-300">{labels[name]}<input name={name} type="text" value={form[name] ?? ""} onChange={change} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff85]/60" /></label>)}
              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">Ticket Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">{fields.slice(13).map((name) => <label key={name} className="text-sm text-slate-300">{labels[name]}<input name={name} type="number" min="1" value={form[name] ?? ""} onChange={change} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff85]/60" /></label>)}</div>
              <label className="text-sm text-slate-300">Special instructions<textarea name="special_instructions" value={form.special_instructions || ""} onChange={change} rows="4" className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111820] p-3 text-sm text-white" /></label>
            </section>

            <div className="flex justify-end gap-3 lg:col-span-2">
              <Link
                to="/profile"
                className="rounded-lg border border-white/15 px-5 py-2.5 text-sm"
              >
                Cancel
              </Link>

              <button
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00ff85] px-5 py-2.5 text-sm font-semibold text-black"
              >
                <Save size={16} />
                Save changes
              </button>
            </div>
          </form>
        </div>

        {confirm && (
          <ConfirmModal
            type="approve"
            title="Save Event Changes?"
            message="Saving changes will send this event back for admin approval."
            confirmLabel="Save changes"
            loading={saving}
            onCancel={() => setConfirm(false)}
            onConfirm={save}
          />
        )}
      </main>
    </ExploreLayout>
  );
}
