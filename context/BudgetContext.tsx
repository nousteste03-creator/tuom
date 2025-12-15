import { createContext, useContext } from "react";
import { useBudget as useBudgetInternal } from "@/hooks/useBudget";

const BudgetContext = createContext<any>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const budget = useBudgetInternal();
  return (
    <BudgetContext.Provider value={budget}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) {
    throw new Error("useBudget must be used within BudgetProvider");
  }
  return ctx;
}
