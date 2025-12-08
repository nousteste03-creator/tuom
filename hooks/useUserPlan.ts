// hooks/useUserPlan.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserPlan = "free" | "pro";

export function useUserPlan() {
  console.log("useUserPlan MONTADO");

  const [plan, setPlan] = useState<UserPlan>("free");
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    console.log("useUserPlan → load() chamado");
    setLoading(true);

    // 1. Obter usuário atual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("AUTH USER ID:", user?.id);

    if (!user) {
      console.log("Nenhum usuário logado — não setar FREE ainda");
      setLoading(false);
      return;
    }

    // 2. Consultar tabela user_settings
    const { data, error } = await supabase
      .from("user_settings")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    console.log("USER PLAN QUERY:", data, error);

    let finalPlan: UserPlan = "free";

    if (data?.plan) {
      finalPlan = data.plan as UserPlan;
    }

    console.log("FINAL PLAN DEFINIDO:", finalPlan);

    setPlan(finalPlan);
    setIsPro(finalPlan === "pro");
    setLoading(false);
  }

  useEffect(() => {
    console.log("useUserPlan → useEffect inicial");
    load();

    // Escutar mudanças de sessão
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      console.log("onAuthStateChange EVENT:", event);
      load();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    plan,
    isPro,
    reload: load,
  };
}
