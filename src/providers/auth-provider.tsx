"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect } from "react";

import { useAuth } from "@/features/auth";
import { SessionExpiredError } from "@/shared/lib/errors";

const PUBLIC_ROUTES = ["/login", "/register"];

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

  const pathname = usePathname();

  useEffect(() => {
    if (PUBLIC_ROUTES.includes(pathname)) return;

    if (auth.error instanceof SessionExpiredError) {
      router.replace("/login");
    }
  }, [auth.error, pathname, router]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
