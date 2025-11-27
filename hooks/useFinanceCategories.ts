import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type FinanceCategory = {
  id: string;
  name: string;
  description: string | null;
  monthly: number;
};

export function useFinanceCategories() {
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("finance_categories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) setError(error.message);

    setCategories(data || []);
    setLoading(false);
  }

  async function addCategory(input: {
    name: string;
    description?: string;
    monthly?: number;
  }) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { data, error } = await supabase
      .from("finance_categories")
      .insert([
        {
          user_id: userId,
          name: input.name,
          description: input.description ?? "",
          monthly: input.monthly ?? 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

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
