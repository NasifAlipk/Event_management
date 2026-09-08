import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";

export default function GoogleButton({ onError, onSuccess }) {
  const { loginWithGoogle } = useAuth(); const [loading, setLoading] = useState(false);
  const signIn = async () => { setLoading(true); try { const result = await signInWithPopup(firebaseAuth, googleProvider); await loginWithGoogle(result.user); onSuccess?.(); } catch (error) { onError?.(error.response?.data?.detail || error.message || "Google sign-in failed."); } finally { setLoading(false); } };
  return <button type="button" onClick={signIn} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-700 bg-gray-800 px-4 py-3 font-medium text-white transition hover:bg-gray-700 disabled:opacity-60"><span className="grid h-6 w-6 place-items-center rounded-full bg-white font-bold text-blue-600">G</span>{loading ? "Connecting to Google…" : "Continue with Google"}</button>;
}
