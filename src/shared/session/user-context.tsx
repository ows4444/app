"use client";

import { createContext, useContext } from "react";

import { type User } from "@/entities/user";

const UserContext = createContext<User | null>(null);

export function UserProvider({ user, children }: Readonly<{ user: User; children: React.ReactNode }>) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
