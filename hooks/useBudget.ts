// hooks/useBudget.ts
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useSubscriptions } from "./useSubscriptions";

export function useBudget() {
  const [categories, setCategories] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Puxar total de assinaturas
  const { monthlyTotal: subsTotal } = useSubscriptions();

  // -----------------------------------------------------------
  // MÊS ATUAL (YYYY-MM)
  // -----------------------------------------------------------
  const month = new Date().toISOString().slice(0, 7);

  const startDate = `${month}-01`;
  const nextMonth = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)),
    1
  )
    .toISOString()
    .slice(0, 10);

  // -----------------------------------------------------------
  // LOAD
  // -----------------------------------------------------------
  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCategories([]);
      setExpenses([]);
      setLoading(false);
      return;
    }

    const { data: cat } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .order("created_at", { ascending: true });

    const { data: exp } = await supabase
      .from("budget_expenses")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lt("date", nextMonth)
      .order("date", { ascending: true });

    setCategories(cat ?? []);
    setExpenses(exp ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [month]);

  // -----------------------------------------------------------
  // CRUD CATEGORY
  // -----------------------------------------------------------
  async function createCategory({ title, limit }: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("budget_categories")
      .insert({
        user_id: user.id,
        title,
        limit,
        month,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      setCategories((prev) => [...prev, data]);
      return data;
    }

    return null;
  }

  async function updateCategory(id: string, payload: any) {
    const { data, error } = await supabase
      .from("budget_categories")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (!error && data) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
    }

    return !error;
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase
      .from("budget_categories")
      .delete()
      .eq("id", id);

    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setExpenses((prev) => prev.filter((e) => e.category_id !== id));
    }

    return !error;
  }

  // -----------------------------------------------------------
  // CALC TOTAL EXPENSES
  // -----------------------------------------------------------
  const totalsByCategory = useMemo(() => {
    const map: Record<string, number> = {};

    for (const e of expenses) {
      map[e.category_id] = (map[e.category_id] ?? 0) + Number(e.amount);
    }

    return map;
  }, [expenses]);

  const totalExpensesRaw = useMemo(() => {
    return expenses.reduce((t, e) => t + Number(e.amount), 0);
  }, [expenses]);

  // -----------------------------------------------------------
  // INJETAR CATEGORIA ASSINATURAS
  // -----------------------------------------------------------
  const categoriesWithProgress = useMemo(() => {
    const processed = categories.map((c) => {
      const spent = totalsByCategory[c.id] ?? 0;
      const limit = Number(c.limit ?? 0);
      const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

      return { ...c, spent, pct };
    });

    // CATEGORIA FIXA
    const subscriptionsCategory = {
      id: "builtin-subscriptions",
      title: "Assinaturas",
      isFixed: true,
      limit: null,
      spent: subsTotal,
      pct: 0,
      month,
    };
     return [
  subscriptionsCategory,
  ...processed.filter((c) => c.id !== "builtin-subscriptions"),
];
  }, [categories, totalsByCategory, subsTotal]);

  // -----------------------------------------------------------
  // TOTAL FINAL DO ORÇAMENTO
  // -----------------------------------------------------------
  const totalExpenses = totalExpensesRaw + subsTotal;

  // -----------------------------------------------------------
  // EXPORT
  // -----------------------------------------------------------
  return {
    loading,
    month,

    categories: categoriesWithProgress,
    expenses,
    totalsByCategory,
    totalExpenses,

    createCategory,
    updateCategory,
    deleteCategory,

    addExpense: async () => {}, // orçamento não adiciona despesas às assinaturas
    reload: load,
  };
}
