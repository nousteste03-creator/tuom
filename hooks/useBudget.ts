// hooks/useBudget.ts
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useSubscriptions } from "./useSubscriptions";

export function useBudget() {
  const [categories, setCategories] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Total vindo das assinaturas
  const { monthlyTotal: subsTotal } = useSubscriptions();

  // -----------------------------------------------------------
  // MÊS ATUAL
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
  // CREATE CATEGORY — limit_amount padrão
  // -----------------------------------------------------------
  async function createCategory({ title, limit_amount }: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("budget_categories")
      .insert({
        user_id: user.id,
        title,
        limit_amount,
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

  // -----------------------------------------------------------
  // UPDATE CATEGORY
  // -----------------------------------------------------------
  async function updateCategory(id: string, payload: any) {
    const { limit_amount, title } = payload;

    const { data, error } = await supabase
      .from("budget_categories")
      .update({
        ...(title && { title }),
        ...(limit_amount !== undefined && { limit_amount }),
      })
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

  // -----------------------------------------------------------
  // DELETE CATEGORY
  // -----------------------------------------------------------
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
  // CREATE EXPENSE
  // -----------------------------------------------------------
  async function addExpense({ category_id, description, amount, date }: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("budget_expenses")
      .insert({
        user_id: user.id,
        category_id,
        description,
        amount,
        date,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      setExpenses((prev) => [...prev, data]);
      return data;
    }

    return null;
  }

  // -----------------------------------------------------------
  // CALCULOS
  // -----------------------------------------------------------
  const totalsByCategory = useMemo(() => {
    const map: Record<string, number> = {};

    for (const e of expenses) {
      map[e.category_id] = (map[e.category_id] ?? 0) + Number(e.amount);
    }

    return map;
  }, [expenses]);

  const totalExpensesRaw = useMemo(
    () => expenses.reduce((t, e) => t + Number(e.amount), 0),
    [expenses]
  );

  // -----------------------------------------------------------
  // INJETAR CATEGORIA FIXA DE ASSINATURAS
  // -----------------------------------------------------------
  const categoriesWithProgress = useMemo(() => {
    const processed = categories.map((c) => {
      const spent = totalsByCategory[c.id] ?? 0;
      const limit = Number(c.limit_amount ?? 0);
      const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

      return { ...c, spent, limit_amount: limit, pct };
    });

    const subscriptionCategory = {
      id: "builtin-subscriptions",
      title: "Assinaturas",
      isFixed: true,
      limit_amount: 0,
      spent: subsTotal,
      pct: 0,
      month,
    };

    const sanitized = processed.filter(
      (c) => String(c.id) !== "builtin-subscriptions"
    );

    return [subscriptionCategory, ...sanitized];
  }, [categories, totalsByCategory, subsTotal]);

  // -----------------------------------------------------------
  // TOTAL FINAL
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
    addExpense,
    reload: load,
  };
}
