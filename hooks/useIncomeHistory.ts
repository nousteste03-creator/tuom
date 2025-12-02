// hooks/useIncomeHistory.ts
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type IncomeHistory = {
  id: string;
  user_id: string;
  month: string; // "2025-01"
  total: number;
  fixed: number;
  variable: number;
  created_at: string;
};

export function useIncomeHistory() {
  const [history, setHistory] = useState<IncomeHistory[]>([]);
  const [loading, setLoading] = useState(false);

  /* ============================================================
     Helper — mês atual no formato YYYY-MM
  ============================================================ */
  function getCurrentMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  /* ============================================================
     3.1 — SALVAR SNAPSHOT MENSAL
     total, fixa, variável
  ============================================================ */
  async function saveMonthlySnapshot({
    total,
    fixed,
    variable,
  }: {
    total: number;
    fixed: number;
    variable: number;
  }) {
    setLoading(true);

    const month = getCurrentMonth();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return null;

    // Verificar se já existe snapshot do mês
    const { data: existing } = await supabase
      .from("user_income_history")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .maybeSingle();

    let res;

    if (existing) {
      // atualizar
      const { data, error } = await supabase
        .from("user_income_history")
        .update({
          total,
          fixed,
          variable,
        })
        .eq("user_id", user.id)
        .eq("month", month)
        .select("*")
        .single();

      if (error) throw error;
      res = data;
    } else {
      // inserir
      const { data, error } = await supabase
        .from("user_income_history")
        .insert({
          user_id: user.id,
          month,
          total,
          fixed,
          variable,
        })
        .select("*")
        .single();

      if (error) throw error;
      res = data;
    }

    setLoading(false);
    return res;
  }

  /* ============================================================
     3.2 — BUSCAR TODO O HISTÓRICO
  ============================================================ */
  const getHistory = useCallback(async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setHistory([]);
      setLoading(false);
      return [];
    }

    const { data, error } = await supabase
      .from("user_income_history")
      .select("*")
      .eq("user_id", user.id)
      .order("month", { ascending: true });

    if (!error && data) setHistory(data as IncomeHistory[]);

    setLoading(false);
    return data || [];
  }, []);

  /* ============================================================
     3.3 — GET VARIATION
     Quanto subiu ou caiu de um mês para outro (%)
  ============================================================ */
  function getVariation(): number {
    if (history.length < 2) return 0;

    const last = history[history.length - 1];
    const before = history[history.length - 2];

    if (!before.total || before.total === 0) return 0;

    const diff = last.total - before.total;
    return (diff / before.total) * 100; // % variação
  }

  /* ============================================================
     3.4 — MÉDIA MENSAL DA RENDA
  ============================================================ */
  function getMonthlyAverage(): number {
    if (!history.length) return 0;
    const sum = history.reduce((acc, h) => acc + h.total, 0);
    return sum / history.length;
  }

  /* ============================================================
     RETURN
  ============================================================ */
  return {
    history,
    loading,

    saveMonthlySnapshot,
    getHistory,
    getVariation,
    getMonthlyAverage,
  };
}
