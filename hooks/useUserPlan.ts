// hooks/useUserPlan.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUserPlan() {
  const [plan, setPlan] = useState<"free" | "pro">("free");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("user_settings")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data?.plan) {
        setPlan(data.plan);
      }
    }

    load();
  }, []);

  return { plan };
}
