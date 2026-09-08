import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/admin/Layout";
import { authApi } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    profile_picture: user?.profile_picture || "",
  });
  const [preview, setPreview] = useState(user?.profile_picture || "");
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const edit = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
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
  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const { data } = await authApi.adminProfile(form);
      updateUser(data.user);
      setMessage("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to update profile.");
    }
  };
  const changePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (passwords.next !== passwords.confirm)
      return setError("New passwords do not match.");
    try {
      const { data } = await authApi.adminChangePassword(
        passwords.current,
        passwords.next,
      );
      setMessage(data.detail);
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to change password.");
    }
  };
  return (
    <Layout>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[.25em] text-[#00ff85]">
              Administrator profile
            </p>
            <h1 className="mt-4 text-3xl font-semibold">
              {user?.first_name || user?.username}
            </h1>
            <p className="mt-2 text-gray-400">{user?.email}</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg bg-[#00ff85] px-4 py-2 font-semibold text-black"
            >
              Edit profile
            </button>
          )}
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-[#00ff85] text-2xl font-bold text-black">
            {preview ? (
              <img
                src={preview}
                alt="Admin profile"
                className="h-full w-full object-cover"
              />
            ) : (
              (user?.username || "A").charAt(0).toUpperCase()
            )}
          </div>
          {editing && (
            <label className="cursor-pointer rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10">
              Choose image
              <input
                type="file"
                accept="image/*"
                onChange={selectImage}
                className="hidden"
              />
            </label>
          )}
        </div>
        {editing && (
          <form
            onSubmit={saveProfile}
            className="mt-8 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2"
          >
            <input
              name="username"
              value={form.username}
              onChange={edit}
              required
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              placeholder="Username"
            />
            <input
              name="first_name"
              value={form.first_name}
              onChange={edit}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              placeholder="First name"
            />
            <input
              name="last_name"
              value={form.last_name}
              onChange={edit}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              placeholder="Last name"
            />
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
        <form
          onSubmit={changePassword}
          className="mt-10 border-t border-white/10 pt-8"
        >
          <h2 className="text-xl font-semibold">Change password</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              type="password"
              required
              minLength={8}
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              placeholder="Current password"
            />
            <input
              type="password"
              required
              minLength={8}
              value={passwords.next}
              onChange={(e) =>
                setPasswords({ ...passwords, next: e.target.value })
              }
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              placeholder="New password"
            />
            <input
              type="password"
              required
              minLength={8}
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              placeholder="Confirm new password"
            />
          </div>
          <button className="mt-4 rounded-lg bg-[#00ff85] px-4 py-2 font-semibold text-black">
            Update password
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-[#00ff85]">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </section>
    </Layout>
  );
}
