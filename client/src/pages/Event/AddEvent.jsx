import { useState } from "react";
import { ArrowLeft, CalendarPlus, ImagePlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import ExploreLayout from "../../components/layout/Explore/Layout";
import { eventsApi } from "../../services/events";

const initial = {
  title: "",
  description: "",
  event_type: "",
  category: "",
  start_date: "",
  start_time: "",
  end_date: "",
  end_time: "",
  venue_name: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pin_code: "",
  visibility: "PUBLIC",
  max_participants: "",
  regular_price: "0",
  regular_quantity: "0",
  vip_price: "0",
  vip_quantity: "0",
  premium_price: "0",
  premium_quantity: "0",
  main_banner: null,
  promotional_image: null,
  age_restriction: false,
  special_instructions: "",
};

function Input({
  label,
  name,
  form,
  setForm,
  type = "text",
  required = true,
}) {
  return (
    <label className="text-sm text-slate-300">
      {label}
      {required && <span className="text-[#00ff85]"> *</span>}

      <input
        name={name}
        type={type}
        required={required}
        value={form[name]}
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            [name]: event.target.value,
          }))
        }
        className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff85]/60"
      />
    </label>
  );
}

function FileInput({
  label,
  name,
  form,
  setForm,
  required = false,
}) {
  return (
    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#00ff85]/50 bg-[#111820] p-4 text-center text-sm text-slate-300 hover:bg-[#00ff85]/5">
      <ImagePlus
        className="mb-2 text-[#00ff85]"
        size={24}
      />

      <span>{form[name]?.name || label}</span>

      <span className="mt-1 text-xs text-slate-500">
        JPG, PNG, or WebP · max 5 MB
      </span>

      <input
        type="file"
        required={required}
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) =>
          setForm((current) => ({
            ...current,
            [name]: event.target.files?.[0] || null,
          }))
        }
        className="sr-only"
      />
    </label>
  );
}

export default function AddEvent() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });

    try {
      await eventsApi.create(data);

      navigate("/events", {
        replace: true,
        state: {
          message:
            "Event submitted successfully and is pending admin approval.",
        },
      });
    } catch (submitError) {
      const response = submitError.response?.data;

      setError(
        response?.detail ||
          (response && typeof response === "object"
            ? Object.values(response).flat().join(" ")
            : "Unable to publish this event.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ExploreLayout>
      <main className="min-h-screen bg-[#0d1418] px-4 pb-16 pt-24 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">

          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#00ff85]"
          >
            <ArrowLeft size={16} />
            Back to Explore
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <CalendarPlus
              className="text-[#00ff85]"
              size={30}
            />

            <div>
              <p className="text-sm uppercase tracking-[.22em] text-[#00ff85]">
                Organizer workspace
              </p>

              <h1 className="mt-1 text-3xl font-light sm:text-4xl">
                Create Your Event
              </h1>
            </div>
          </div>

          <form
            onSubmit={submit}
            className="mt-8 grid gap-5 lg:grid-cols-2"
          >
            <section className="space-y-5 rounded-2xl border border-white/10 bg-[#171e25] p-5">
              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">
                Basic Information
              </h2>

              <Input
                label="Event title"
                name="title"
                form={form}
                setForm={setForm}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Event type"
                  name="event_type"
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="Event category"
                  name="category"
                  form={form}
                  setForm={setForm}
                />
              </div>

              <label className="block text-sm text-slate-300">
                Description
                <span className="text-[#00ff85]"> *</span>

                <textarea
                  name="description"
                  required
                  maxLength={3000}
                  value={form.description}
                  onChange={update}
                  rows={5}
                  className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff85]/60"
                />
              </label>

              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">
                Schedule
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Start date"
                  name="start_date"
                  type="date"
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="Start time"
                  name="start_time"
                  type="time"
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="End date"
                  name="end_date"
                  type="date"
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="End time"
                  name="end_time"
                  type="time"
                  form={form}
                  setForm={setForm}
                />
              </div>

              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">
                Event Branding
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <FileInput
                  label="Main event banner"
                  name="main_banner"
                  form={form}
                  setForm={setForm}
                  required
                />

                <FileInput
                  label="Promotional image"
                  name="promotional_image"
                  form={form}
                  setForm={setForm}
                />
              </div>
            </section>

            <section className="space-y-5 rounded-2xl border border-white/10 bg-[#171e25] p-5">
              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">
                Venue Details
              </h2>

              <Input
                label="Venue name"
                name="venue_name"
                form={form}
                setForm={setForm}
              />

              <Input
                label="Address"
                name="address"
                form={form}
                setForm={setForm}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="City"
                  name="city"
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="State"
                  name="state"
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="Country"
                  name="country"
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="Pin code"
                  name="pin_code"
                  form={form}
                  setForm={setForm}
                />
              </div>

              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">
                Event Settings
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-300">
                  Visibility

                  <select
                    name="visibility"
                    value={form.visibility}
                    onChange={update}
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </label>

                <Input
                  label="Maximum participants"
                  name="max_participants"
                  type="number"
                  form={form}
                  setForm={setForm}
                />
              </div>

              <h2 className="border-l-4 border-[#00ff85] pl-3 text-lg font-semibold">
                Ticket Details
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Regular price"
                  name="regular_price"
                  type="number"
                  required={false}
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="Regular quantity"
                  name="regular_quantity"
                  type="number"
                  required={false}
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="VIP price"
                  name="vip_price"
                  type="number"
                  required={false}
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="VIP quantity"
                  name="vip_quantity"
                  type="number"
                  required={false}
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="Premium price"
                  name="premium_price"
                  type="number"
                  required={false}
                  form={form}
                  setForm={setForm}
                />

                <Input
                  label="Premium quantity"
                  name="premium_quantity"
                  type="number"
                  required={false}
                  form={form}
                  setForm={setForm}
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  name="age_restriction"
                  checked={form.age_restriction}
                  onChange={update}
                  className="accent-[#00ff85]"
                />

                Age restriction applies
              </label>

              <label className="block text-sm text-slate-300">
                Special instructions

                <textarea
                  name="special_instructions"
                  value={form.special_instructions}
                  onChange={update}
                  rows={4}
                  className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-[#111820] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00ff85]/60"
                />
              </label>
            </section>

            {error && (
              <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300 lg:col-span-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 lg:col-span-2">
              <Link
                to="/events"
                className="rounded-lg border border-red-400/60 px-5 py-2.5 text-sm text-red-300 hover:bg-red-400/10"
              >
                Cancel
              </Link>

              <button
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00ff85] px-5 py-2.5 font-semibold text-black hover:bg-[#00d970] disabled:opacity-50"
              >
                {saving ? "Publishing..." : "Publish Event"}
                <CalendarPlus size={17} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </ExploreLayout>
  );
}