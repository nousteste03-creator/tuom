// hooks/useFinanceHistory.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type FinanceHistoryItem = {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  subscriptions: number;
  balance: number;
  created_at: string;
};

export function useFinanceHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [history, setHistory] = useState<FinanceHistoryItem[]>([]);
  const [months, setMonths] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      setHistory([]);
      setMonths([]);
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("finance_history")
      .select("*")
      .eq("user_id", user.id)
      .order("month", { ascending: false });

    if (err) {
      console.error("Erro carregando histórico:", err);
      setError(err);
      setHistory([]);
      setMonths([]);
      setLoading(false);
      return;
    }

    const list = data || [];
    setHistory(list);
    setMonths([...new Set(list.map((h) => h.month))]);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return {
    loading,
    error,
    history,
    months,
    reload: load, // necessário para pull-to-refresh
  };
}
