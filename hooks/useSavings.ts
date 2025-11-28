// hooks/useSavings.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SavingEntry {
  id: string;
  amount: number;
  created_at: string;
}

export function useSavings() {
  const [entries, setEntries] = useState<SavingEntry[]>([]);
  const [loading, setLoading] = useState(true);

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
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEntries(data as SavingEntry[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addSaving(amount: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("savings_history")
      .insert({
        user_id: user?.id,
        amount,
      })
      .select()
      .single();

    if (!error && data) {
      setEntries((prev) => [data, ...prev]);
    }
  }

  const totalSaved = entries.reduce((sum, s) => sum + s.amount, 0);

  // Sugestão: baseada no total guardado
  const suggestion = totalSaved < 50 ? 10 : totalSaved < 200 ? 15 : 20;

  return {
    entries,
    loading,
    totalSaved,
    suggestion,
    addSaving,
    reload: load,
  };
}
