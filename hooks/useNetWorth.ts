// hooks/useNetWorth.ts
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface NetWorthItem {
  id: string;
  type: "asset" | "debt";
  title: string;
  amount: number;
}

export function useNetWorth() {
  const [items, setItems] = useState<NetWorthItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data as NetWorthItem[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addItem(item: Omit<NetWorthItem, "id">) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("net_worth_items")
      .insert({
        user_id: user?.id,
        ...item,
      })
      .select()
      .single();

    if (!error && data) {
      setItems((prev) => [data, ...prev]);
    }
  }

  async function updateItem(id: string, updated: Partial<NetWorthItem>) {
    const { data, error } = await supabase
      .from("net_worth_items")
      .update(updated)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data } : i))
      );
    }
  }

  async function removeItem(id: string) {
    const { error } = await supabase
      .from("net_worth_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  }

  const totalAssets = items
    .filter((i) => i.type === "asset")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalDebts = items
    .filter((i) => i.type === "debt")
    .reduce((sum, i) => sum + i.amount, 0);

  const netWorth = totalAssets - totalDebts;

  return {
    items,
    loading,
    totalAssets,
    totalDebts,
    netWorth,
    addItem,
    updateItem,
    removeItem,
    reload: load,
  };
}
