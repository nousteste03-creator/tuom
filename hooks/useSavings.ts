// hooks/useSavings.ts
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export function useSavings() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ───────────────────────────────────────────────
     LOAD (histórico de economia manual)
  ─────────────────────────────────────────────── */
  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("savings_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }); // CORRETO: não existe "date"

    if (error) {
      console.log("Savings load error:", error);
      setEntries([]);
    } else {
      setEntries(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* ───────────────────────────────────────────────
     ADD SAVING (criar novo registro manual)
  ─────────────────────────────────────────────── */
  async function addSaving(amount: number, description?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("savings_history")
      .insert({
        user_id: user.id,
        amount,
        description: description ?? null, // mesmo que não exista ainda no SQL
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      setEntries((prev) => [data, ...prev]);
      return data;
    }

    return null;
  }

  /* ───────────────────────────────────────────────
     TOTAL ACUMULADO
  ─────────────────────────────────────────────── */
  const totalSaved = useMemo(() => {
    return entries.reduce((t, e) => t + Number(e.amount || 0), 0);
  }, [entries]);

  /* ───────────────────────────────────────────────
     SUGESTÃO DE ECONOMIA (placeholder elegante)
  ─────────────────────────────────────────────── */
  const suggestion = useMemo(() => {
    if (totalSaved < 100) return 15;
    if (totalSaved < 500) return 30;
    if (totalSaved < 2000) return 50;
    return 100;
  }, [totalSaved]);

  return {
    loading,
    entries,
    totalSaved,
    suggestion,
    addSaving,
    reload: load,
  };
}
