"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@/features/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionExpiredError } from "@/shared/lib/errors";

type AuthContextType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.error instanceof SessionExpiredError) {
      router.replace("/login");
    }
  }, [auth.error, router]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
