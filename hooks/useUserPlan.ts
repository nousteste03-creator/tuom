// hooks/useUserPlan.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUserPlan() {
  const [plan, setPlan] = useState<"free" | "pro" | "dev_pro">("dev_pro");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPlan("free");
        setLoading(false);
        return;
      }

      // PRIORIDADE 1 — user_metadata
      const metaPlan = user.user_metadata?.plan;
      if (metaPlan === "pro") {
        setPlan("pro");
        setLoading(false);
        return;
      }
      if (metaPlan === "free") {
        setPlan("free");
        setLoading(false);
        return;
      }

      // PRIORIDADE 2 — tabela user_settings
      const { data } = await supabase
        .from("user_settings")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.plan) {
        setPlan(data.plan);
      } else {
        setPlan("dev_pro"); // fallback
      }

      setLoading(false);
    }

    load();
  }, []);

  return {
    plan,
    isPremium: plan === "pro" || plan === "dev_pro",
    loading,
  };
}
