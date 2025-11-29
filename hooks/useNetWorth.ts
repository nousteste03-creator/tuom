// hooks/useNetWorth.ts
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export function useNetWorth() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ───────────────────────────────────────────────
     LOAD ITEMS (puxa tudo do usuário)
  ─────────────────────────────────────────────── */
  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("net_worth_items")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error) setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* ───────────────────────────────────────────────
     ADD
  ─────────────────────────────────────────────── */
  async function addItem({ title, type, value }: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("net_worth_items")
      .insert({
        user_id: user.id,
        title,
        type, // "asset" | "liability"
        value,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      setItems((prev) => [data, ...prev]);
      return data;
    }

    return null;
  }

  /* ───────────────────────────────────────────────
     UPDATE
  ─────────────────────────────────────────────── */
  async function updateItem(id: string, payload: any) {
    const { data, error } = await supabase
      .from("net_worth_items")
      .update({ ...payload, updated_at: new Date() })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (!error && data) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data } : i))
      );
      return true;
    }

    return false;
  }

  /* ───────────────────────────────────────────────
     DELETE
  ─────────────────────────────────────────────── */
  async function deleteItem(id: string) {
    const { error } = await supabase
      .from("net_worth_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return true;
    }

    return false;
  }

  /* ───────────────────────────────────────────────
     CÁLCULOS DERIVADOS (100% SEGUROS)
  ─────────────────────────────────────────────── */

  const totalAssets = useMemo(() => {
    return items
      .filter((i) => i.type === "asset")
      .reduce((t, i) => t + Number(i.value || 0), 0);
  }, [items]);

  const totalLiabilities = useMemo(() => {
    return items
      .filter((i) => i.type === "liability")
      .reduce((t, i) => t + Number(i.value || 0), 0);
  }, [items]);

  const netWorth = useMemo(() => {
    return Number(totalAssets || 0) - Number(totalLiabilities || 0);
  }, [totalAssets, totalLiabilities]);

  /* ───────────────────────────────────────────────
     RETURN
  ─────────────────────────────────────────────── */
  return {
    loading,
    items,

    // totals
    totalAssets,
    totalLiabilities,
    netWorth,

    // actions
    addItem,
    updateItem,
    deleteItem,
    reload: load,
  };
}
