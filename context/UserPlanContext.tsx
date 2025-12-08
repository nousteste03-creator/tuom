// context/UserPlanContext.tsx
import React, { createContext, useContext } from "react";
import { useUserPlan as useUserPlanHook } from "@/hooks/useUserPlan";

const UserPlanContext = createContext(null);

export function UserPlanProvider({ children }) {
  const value = useUserPlanHook(); // Hook roda apenas UMA vez

  return (
    <UserPlanContext.Provider value={value}>
      {children}
    </UserPlanContext.Provider>
  );
}

export function useUserPlan() {
  const ctx = useContext(UserPlanContext);
  if (!ctx) {
    throw new Error("useUserPlan deve ser usado dentro de <UserPlanProvider>");
  }
  return ctx;
}
