// hooks/useIncomeSources.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export type IncomeFrequency =
  | "monthly"
  | "weekly"
  | "biweekly"
  | "once"
  | "quarterly";

export type IncomeSource = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  nextDate: string; // ISO
  category: string;
  active: boolean;
  createdAt: string;
};

export type UpcomingIncome = {
  sourceId: string;
  name: string;
  amount: number;
  date: string; // ISO
  daysUntil: number;
};

export type UseIncomeReturn = {
  loading: boolean;
  sources: IncomeSource[];
  monthlyIncome: number;
  projectedIncomeMonths: (monthsAhead: number) => number;

  upcomingIncomes: UpcomingIncome[];

  // === agregado novo ===
  aggregates: {
    monthly: {
      income: number;
    };
  };

  reload: () => Promise<void>;

  createIncomeSource: (input: {
    name: string;
    amount: number;
    frequency: IncomeFrequency;
    nextDate: string;
    category: string;
  }) => Promise<string | null>;

  updateIncomeSource: (
    id: string,
    patch: Partial<{
      name: string;
      amount: number;
      frequency: IncomeFrequency;
      nextDate: string;
      category: string;
      active: boolean;
    }>
  ) => Promise<void>;

  deleteIncomeSource: (id: string) => Promise<void>;
};

/* ======================================================================
   Helpers
====================================================================== */

function normalizeFrequency(freq: string | null): IncomeFrequency {
  if (freq === "weekly") return "weekly";
  if (freq === "biweekly") return "biweekly";
  if (freq === "once") return "once";
  if (freq === "quarterly") return "quarterly";
  return "monthly";
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// converte uma fonte em valor médio mensal (heurística)
function incomeToMonthlyAmount(source: IncomeSource): number {
  switch (source.frequency) {
    case "monthly":
      return source.amount;
    case "weekly":
      return source.amount * 4.33;
    case "biweekly":
      return source.amount * 2.16;
    case "quarterly":
      return source.amount / 3;
    case "once":
    default:
      return 0;
  }
}

function generateUpcomingForSource(
  source: IncomeSource,
  daysAhead: number
): UpcomingIncome[] {
  const result: UpcomingIncome[] = [];
  if (!source.active) return result;

  const now = new Date();
  let next = new Date(source.nextDate);

  while (next < now) {
    switch (source.frequency) {
      case "monthly":
        next = addMonths(next, 1);
        break;
      case "weekly":
        next = addDays(next, 7);
        break;
      case "biweekly":
        next = addDays(next, 14);
        break;
      case "quarterly":
        next = addMonths(next, 3);
        break;
      case "once":
      default:
        return result;
    }
  }

  const limit = addDays(now, daysAhead);
  while (next <= limit) {
    const diffMs = next.getTime() - now.getTime();
    const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

    result.push({
      sourceId: source.id,
      name: source.name,
      amount: source.amount,
      date: next.toISOString(),
      daysUntil,
    });

    if (source.frequency === "once") break;

    switch (source.frequency) {
      case "monthly":
        next = addMonths(next, 1);
        break;
      case "weekly":
        next = addDays(next, 7);
        break;
      case "biweekly":
        next = addDays(next, 14);
        break;
      case "quarterly":
        next = addMonths(next, 3);
        break;
      default:
        break;
    }
  }

  return result;
}

/* ======================================================================
   Hook principal
====================================================================== */

export function useIncomeSources(): UseIncomeReturn {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Erro auth income_sources:", authError);
      setRows([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro carregando income_sources:", error);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const sources: IncomeSource[] = useMemo(() => {
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name ?? "Receita",
      amount: Number(r.amount ?? 0),
      frequency: normalizeFrequency(r.frequency),
      nextDate: r.next_date ?? new Date().toISOString(),
      category: r.category ?? "other",
      active: r.active ?? true,
      createdAt: r.created_at ?? new Date().toISOString(),
    }));
  }, [rows]);

  const monthlyIncome = useMemo(() => {
    return sources.reduce((sum, src) => sum + incomeToMonthlyAmount(src), 0);
  }, [sources]);

  const projectedIncomeMonths = useCallback(
    (monthsAhead: number): number => {
      if (monthsAhead <= 0) return 0;
      return monthlyIncome * monthsAhead;
    },
    [monthlyIncome]
  );

  const upcomingIncomes = useMemo<UpcomingIncome[]>(() => {
    const daysAhead = 30;
    const all: UpcomingIncome[] = [];

    for (const src of sources) {
      const events = generateUpcomingForSource(src, daysAhead);
      all.push(...events);
    }

    return all.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [sources]);

  /* ======================================================================
     CRUD
  ====================================================================== */

  const createIncomeSource = useCallback(async (input) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("income_sources")
      .insert({
        user_id: user.id,
        name: input.name,
        amount: input.amount,
        frequency: input.frequency,
        next_date: input.nextDate,
        category: input.category,
        active: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erro criando income_source:", error);
      return null;
    }

    await reload();
    return data?.id ?? null;
  }, [reload]);

  const updateIncomeSource = useCallback(async (id, patch) => {
    const updates: any = {};

    if (patch.name !== undefined) updates.name = patch.name;
    if (patch.amount !== undefined) updates.amount = patch.amount;
    if (patch.frequency !== undefined) updates.frequency = patch.frequency;
    if (patch.nextDate !== undefined) updates.next_date = patch.nextDate;
    if (patch.category !== undefined) updates.category = patch.category;
    if (patch.active !== undefined) updates.active = patch.active;

    if (Object.keys(updates).length === 0) return;

    await supabase.from("income_sources").update(updates).eq("id", id);
    await reload();
  }, [reload]);

  const deleteIncomeSource = useCallback(async (id) => {
    await supabase.from("income_sources").delete().eq("id", id);
    await reload();
  }, [reload]);

  /* ======================================================================
     OBJETO AGREGADO — (PASSO 4.4)
  ====================================================================== */

  const aggregates = useMemo(() => {
    return {
      monthly: {
        income: monthlyIncome,
      },
    };
  }, [monthlyIncome]);

  return {
    loading,
    sources,
    monthlyIncome,
    projectedIncomeMonths,
    upcomingIncomes,

    aggregates,  // <<<<<< ADICIONADO AQUI

    reload,
    createIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
  };
}
