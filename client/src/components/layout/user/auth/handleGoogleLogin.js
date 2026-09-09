import { signInWithPopup } from "firebase/auth";
import { firebaseAuth, googleProvider } from "../../../../services/firebase";

/**
 * Authenticates with Google, then exchanges the Firebase ID token for the
 * secure Eventora session managed by Django.
 */
export default async function handleGoogleLogin(loginWithGoogle) {
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  const idToken = await result.user.getIdToken();
  await loginWithGoogle(result.user);

  return {
    id: result.user.uid,
    email: result.user.email,
    name: result.user.displayName,
    photoURL: result.user.photoURL,
    idToken,
  };
}
