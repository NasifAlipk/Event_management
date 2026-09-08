import { CalendarDays, MapPin, Pencil } from "lucide-react";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../services/auth";
import Header from "../../components/home/Header";

export default function GlobalProfile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    profile_picture: user?.profile_picture || "",
  });
  const [preview, setPreview] = useState(user?.profile_picture || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return setError("Profile image must be smaller than 2 MB.");
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setForm({ ...form, profile_picture: reader.result });
    };
    reader.readAsDataURL(file);
  };
  const save = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await authApi.profile(form);
      updateUser(data.user);
      setMessage("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to update profile.");
    }
  };
  const name =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Eventora member";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0f172b] px-5 pb-12 pt-24 text-white sm:px-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
          <div className="h-36 bg-gradient-to-r from-indigo-900 via-purple-900 to-[#173d38]" />
          <div className="px-6 pb-8 sm:px-10">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-[#0f172b] bg-[#00ff85] text-3xl font-bold text-black">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (user?.username || "E").charAt(0).toUpperCase()
                )}
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
                >
                  <Pencil size={15} /> Edit profile
                </button>
              )}
            </div>
            <h1 className="mt-5 text-3xl font-semibold">{name}</h1>
            <p className="mt-1 text-gray-400">@{user?.username || "member"}</p>
            {editing && (
              <form
                onSubmit={save}
                className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2"
              >
                <input
                  name="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                  className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-white"
                  placeholder="Username"
                />
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-white"
                  placeholder="First name"
                />
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-white"
                  placeholder="Last name"
                />
                <label className="cursor-pointer rounded-lg border border-white/20 px-3 py-2 text-sm">
                  Choose profile picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={selectImage}
                    className="hidden"
                  />
                </label>
                <div className="flex gap-3 sm:col-span-2">
                  <button className="rounded-lg bg-[#00ff85] px-4 py-2 font-semibold text-black">
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setPreview(user?.profile_picture || "");
                    }}
                    className="rounded-lg border border-white/20 px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {message && (
              <p className="mt-3 text-sm text-[#00ff85]">{message}</p>
            )}
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-gray-400">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} /> Eventora member
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} /> Ready to explore
              </span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-black/20 p-5">
                <p className="text-2xl font-semibold text-[#00ff85]">0</p>
                <p className="text-sm text-gray-400">Events joined</p>
              </div>
              <div className="rounded-xl bg-black/20 p-5">
                <p className="text-2xl font-semibold text-[#00ff85]">0</p>
                <p className="text-sm text-gray-400">Events organized</p>
              </div>
              <div className="rounded-xl bg-black/20 p-5">
                <p className="text-2xl font-semibold text-[#00ff85]">0</p>
                <p className="text-sm text-gray-400">Connections</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
