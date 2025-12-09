import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export type UserPlan = "free" | "pro";

type Ctx = {
  plan: UserPlan;
  isPro: boolean;
  refreshPlan: () => Promise<void>;
};

const UserPlanContext = createContext<Ctx>({
  plan: "free",
  isPro: false,
  refreshPlan: async () => {},
});

export function UserPlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<UserPlan>("free");

  /* ============================================================
     FUNÇÃO REAL DE CARREGAMENTO — SEGURA E ESTÁVEL
  ============================================================ */
  const loadPlan = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    const { data } = await supabase
      .from("user_settings")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    const finalPlan = (data?.plan as UserPlan) ?? "free";
    setPlan(finalPlan);
  };

  /* ============================================================
     USEEFFECT — APENAS UMA VEZ (sem loops)
  ============================================================ */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await loadPlan();
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) loadPlan();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /* ============================================================
     VALUE MEMOIZADO — PREVINE RERENDERS DO PROVIDER
  ============================================================ */
  const value = useMemo(
    () => ({
      plan,
      isPro: plan === "pro",
      refreshPlan: loadPlan,
    }),
    [plan]
  );

  return (
    <UserPlanContext.Provider value={value}>
      {children}
    </UserPlanContext.Provider>
  );
}

/* ============================================================
   HOOK
============================================================ */
export function useUserPlan() {
  return useContext(UserPlanContext);
}
