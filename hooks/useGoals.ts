// hooks/useGoals.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  created_at: string;
};

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  async function load() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("goals")
      .select(
        "id, user_id, title, target_amount, current_amount, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro carregando metas:", error);
      setError(error);
      setGoals([]);
      setLoading(false);
      return;
    }

    setGoals(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const createGoal = async ({
    title,
    target_amount,
    current_amount = 0,
  }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title,
        target_amount,
        current_amount,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Erro criando meta:", error);
      throw error;
    }

    setGoals((prev) => [...prev, data as Goal]);
  };

  const updateGoal = async (id: string, payload: Partial<Goal>) => {
    const { data, error } = await supabase
      .from("goals")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Erro atualizando meta:", error);
      throw error;
    }

    setGoals((prev) => prev.map((g) => (g.id === id ? (data as Goal) : g)));
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro excluindo meta:", error);
      throw error;
    }

    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return {
    goals,
    mainGoal: goals.length > 0 ? goals[0] : null,
    secondaryGoals: goals.length > 1 ? goals.slice(1) : [],
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    reload: load,
  };
}
