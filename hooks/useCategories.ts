import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro carregando categories:", error);
        if (!cancelled) {
          setError(error);
          setCategories([]);
        }
        return;
      }

      if (!cancelled) {
        setCategories(data || []);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function createCategory(payload: {
    title: string;
    amount: number;
  }) {
    const { data, error } = await supabase
      .from("categories")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Erro criando categoria:", error);
      return null;
    }

    setCategories((prev) => [...prev, data]);
    return data;
  }

  async function updateCategory(id: string, payload: any) {
    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro atualizando:", error);
      return null;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? data : c))
    );

    return data;
  }

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
    loading,
    error,
  };
}
