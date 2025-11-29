// hooks/useFinanceCategories.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type FinanceCategory = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  monthly: number; // gasto mensal planejado
  created_at: string;
};

export function useFinanceCategories() {
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("finance_categories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (err) {
      setError(err.message);
      setCategories([]);
    } else {
      setCategories(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(input: {
    name: string;
    description?: string;
    monthly?: number;
  }) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) return null;

    const { data, error } = await supabase
      .from("finance_categories")
      .insert([
        {
          user_id: userId,
          name: input.name,
          description: input.description ?? "",
          monthly: Number(input.monthly ?? 0),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro criando categoria:", error);
      return null;
    }

    setCategories((prev) => [...prev, data]);
    return data;
  }

  return {
    categories,
    loading,
    error,
    addCategory,
    reload: load,
  };
}
