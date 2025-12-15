import { createContext, useContext, ReactNode } from "react";
import { useGoals as useGoalsHook } from "@/hooks/useGoals";

/**
 * Inferimos o tipo automaticamente a partir do hook
 * Isso garante que o Context SEMPRE fique alinhado
 */
type GoalsContextValue = ReturnType<typeof useGoalsHook>;

const GoalsContext = createContext<GoalsContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function GoalsProvider({ children }: Props) {
  const goals = useGoalsHook();

  return (
    <GoalsContext.Provider value={goals}>
      {children}
    </GoalsContext.Provider>
  );
}

/**
 * Hook público — mantém o mesmo nome
 */
export function useGoals() {
  const ctx = useContext(GoalsContext);

  if (!ctx) {
    throw new Error("useGoals must be used within a GoalsProvider");
  }

  return ctx;
}
