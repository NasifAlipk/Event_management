import { useEffect, useMemo, useState } from "react";

import { authApi } from "../services/auth";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        await authApi.initialise();

        const { data } = await authApi.me();

        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,

      login: async (credentials) => {
        const { data } = await authApi.login(credentials);

        setUser(data.user);
      },

      loginWithGoogle: async (googleUser) => {
        const token = await googleUser.getIdToken();
        const { data } = await authApi.googleLogin(token);
        setUser(data.user);
      },

      register: async (details) => {
        const { data } = await authApi.register(details);
        return data;
      },

      verifyEmail: async (details) => {
        const { data } = await authApi.verifyEmail(details);
        setUser(data.user);
        return data;
      },

      logout: async () => {
        await authApi.logout();

        setUser(null);
      },

      updateUser: (updatedUser) => setUser(updatedUser),
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
