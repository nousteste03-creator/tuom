// hooks/useCategories.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro carregando categories:", error);
      setError(error);
      setCategories([]);
      setLoading(false);
      return;
    }

    // Garantir valores numéricos
    const normalized = (data || []).map((c) => ({
      ...c,
      amount: Number(c.amount || 0),
    }));

    setCategories(normalized);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------------------------------------------------------
     CREATE
  -----------------------------------------------------------*/
  async function createCategory(payload: {
    title: string;
    amount: number;
    type: "income" | "expense";
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        title: payload.title,
        amount: Number(payload.amount),
        type: payload.type,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro criando categoria:", error);
      return null;
    }

    setCategories((prev) => [...prev, data]);
    return data;
  }

  /* ---------------------------------------------------------
     UPDATE
  -----------------------------------------------------------*/
  async function updateCategory(id: string, payload: any) {
    const { data, error } = await supabase
      .from("categories")
      .update({
        title: payload.title,
        amount: Number(payload.amount),
        type: payload.type,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro atualizando categoria:", error);
      return null;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? data : c))
    );

    return data;
  }

  /* ---------------------------------------------------------
     DELETE
  -----------------------------------------------------------*/
  async function deleteCategory(id: string) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro deletando categoria:", error);
      return false;
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
  }

  return {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    reload: load,
    loading,
    error,
  };
}
