// hooks/useBudget.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useBudget() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cats } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("user_id", user.id);

    const { data: exps } = await supabase
      .from("budget_expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", currentMonthStart.toISOString());

    setCategories(cats || []);
    setExpenses(exps || []);
    setLoading(false);
  }

  async function addCategory(title: string, limit: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("budget_categories").insert({
      user_id: user.id,
      title,
      limit_amount: limit,
    });

    load();
  }

  async function updateCategory(id: string, limit: number) {
    await supabase
      .from("budget_categories")
      .update({ limit_amount: limit })
      .eq("id", id);

    load();
  }

  async function deleteCategory(id: string) {
    await supabase.from("budget_categories").delete().eq("id", id);
    load();
  }

  async function addExpense(category_id: string, amount: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("budget_expenses").insert({
      user_id: user.id,
      category_id,
      amount,
    });

    load();
  }

  // cálculo principal
  function getCategoryStatus(category: any) {
    const spent = expenses
      .filter((e) => e.category_id === category.id)
      .reduce((a, b) => a + Number(b.amount), 0);

    const limit = Number(category.limit_amount);
    const pct = limit > 0 ? spent / limit : 0;

    return {
      spent,
      limit,
      pct: Math.min(pct, 1),
      remaining: Math.max(limit - spent, 0),
      status: pct < 0.5 ? "ok" : pct < 1 ? "warning" : "over",
    };
  }

  return {
    loading,
    categories,
    expenses,
    addCategory,
    updateCategory,
    deleteCategory,
    addExpense,
    getCategoryStatus,
    reload: load,
  };
}
