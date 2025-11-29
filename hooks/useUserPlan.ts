// hooks/useUserPlan.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUserPlan() {
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPlan("free");
      setIsPremium(false);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_settings")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.log("useUserPlan error: ", error);
    }

    const finalPlan = (data?.plan as "free" | "pro") ?? "free";

    setPlan(finalPlan);
    setIsPremium(finalPlan === "pro");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return {
    loading,
    plan,
    isPremium,
    reload: load,
  };
}
