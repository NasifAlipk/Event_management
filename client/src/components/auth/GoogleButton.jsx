import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import GoogleIcon from "../ui/GoogleIcon";
import handleGoogleLogin from "../layout/user/auth/handleGoogleLogin";

export default function GoogleButton({ onError, onSuccess }) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    try {
      const profile = await handleGoogleLogin(loginWithGoogle);
      onSuccess?.(profile);
    } catch (error) {
      onError?.(
        error.response?.data?.detail ||
          (error.code === "auth/popup-closed-by-user"
            ? "Google sign-in was cancelled."
            : error.message) ||
          "Google sign-in failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-700 bg-gray-800 px-4 py-3 font-medium text-white transition hover:bg-gray-700 disabled:opacity-60"
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-white">
        <GoogleIcon size={18} />
      </span>
      {loading ? "Connecting to Google..." : "Continue with Google"}
    </button>
  );
}
