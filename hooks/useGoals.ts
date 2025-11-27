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

type UseGoalsResult = {
  goals: Goal[];
  mainGoal: Goal | null;
  secondaryGoals: Goal[];
  loading: boolean;
  error: any;
  createGoal: (payload: {
    title: string;
    target_amount: number;
    current_amount?: number;
  }) => Promise<void>;
  updateGoal: (id: string, payload: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
};

export function useGoals(): UseGoalsResult {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Carrega metas
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) {
        if (!cancelled) {
          setGoals([]);
          setLoading(false);
        }
        return;
      }

      // SELECT sem is_main
      const { data, error } = await supabase
        .from("goals")
        .select("id, user_id, title, target_amount, current_amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro carregando metas:", error);
        if (!cancelled) {
          setError(error);
          setGoals([]);
        }
      } else if (!cancelled) {
        setGoals((data ?? []) as Goal[]);
      }

      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  // Meta principal: a PRIMEIRA meta
  const mainGoal = goals.length > 0 ? goals[0] : null;

  // Secundárias: o resto
  const secondaryGoals =
    goals.length > 1 ? goals.slice(1) : [];

  const createGoal: UseGoalsResult["createGoal"] = useCallback(
    async ({ title, target_amount, current_amount = 0 }) => {
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
        .select(
          "id, user_id, title, target_amount, current_amount, created_at"
        )
        .single();

      if (error) {
        console.error("Erro criando meta:", error);
        throw error;
      }

      setGoals((prev) => [...prev, data as Goal]);
    },
    []
  );

  const updateGoal: UseGoalsResult["updateGoal"] = useCallback(
    async (id, payload) => {
      const { data, error } = await supabase
        .from("goals")
        .update(payload)
        .eq("id", id)
        .select(
          "id, user_id, title, target_amount, current_amount, created_at"
        )
        .single();

      if (error) {
        console.error("Erro atualizando meta:", error);
        throw error;
      }

      setGoals((prev) => prev.map((g) => (g.id === id ? (data as Goal) : g)));
    },
    []
  );

  const deleteGoal: UseGoalsResult["deleteGoal"] = useCallback(
    async (id) => {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro excluindo meta:", error);
        throw error;
      }

      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    []
  );

  return {
    goals,
    mainGoal,
    secondaryGoals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}
