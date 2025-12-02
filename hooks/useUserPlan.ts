// hooks/useUserPlan.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserPlan = "free" | "pro";

export function useUserPlan() {
  const [plan, setPlan] = useState<UserPlan>("free");
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPlan("free");
      setIsPro(false);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_settings")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) console.log("useUserPlan error:", error);

    const finalPlan: UserPlan = (data?.plan as UserPlan) ?? "free";

    setPlan(finalPlan);
    setIsPro(finalPlan === "pro");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return {
    loading,
    plan,
    isPro,
    reload: load,
  };
}
