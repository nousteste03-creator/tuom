// hooks/useFinanceHistory.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useFinanceHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [months, setMonths] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        if (!cancelled) {
          setMonths([]);
          setHistory([]);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("finance_history")
        .select("*")
        .eq("user_id", user.id)
        .order("month", { ascending: false });

      if (error) {
        console.error("Erro carregando histórico:", error);
        if (!cancelled) {
          setError(error);
          setMonths([]);
          setHistory([]);
        }
      } else if (!cancelled) {
        setHistory(data ?? []);
        setMonths(
          [...new Set((data ?? []).map((h) => h.month))] // meses únicos
        );
      }

      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading,
    error,
    months,
    history,
  };
}
