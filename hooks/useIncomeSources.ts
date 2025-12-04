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
  nextDate: string;       // próximo pagamento
  active: boolean;
  createdAt: string;
};

export type NextIncomeEvent = {
  name: string;
  amount: number;
  date: string;
  daysUntil: number;
};

export type UseIncomeSources = {
  loading: boolean;

  incomeSources: IncomeSource[];
  totalMonthlyIncome: number; 
  nextIncomeEvent: NextIncomeEvent | null;
  monthlyProjection: (monthsAhead: number) => number;

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
  }) => Promise<string | null>;
  updateIncomeSource: (
    id: string,
    patch: Partial<{
      name: string;
      amount: number;
      frequency: IncomeFrequency;
      nextDate: string;
      active: boolean;
    }>
  ) => Promise<void>;
  deleteIncomeSource: (id: string) => Promise<void>;
};

/* ============================================================
   Helpers
============================================================ */

function normalizeFrequency(freq: string | null): IncomeFrequency {
  if (freq === "weekly") return "weekly";
  if (freq === "biweekly") return "biweekly";
  if (freq === "once") return "once";
  if (freq === "quarterly") return "quarterly";
  return "monthly";
}

// converte a receita em valor mensal projetado
function toMonthlyAmount(src: IncomeSource): number {
  switch (src.frequency) {
    case "monthly":
      return src.amount;
    case "weekly":
      return src.amount * 4.33;
    case "biweekly":
      return src.amount * 2.16;
    case "quarterly":
      return src.amount / 3;
    case "once":
    default:
      return 0;
  }
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = d.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/* ============================================================
   Hook principal — NOVA ARQUITETURA OFICIAL
============================================================ */

export function useIncomeSources(): UseIncomeSources {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /* ============================================================
     FORMAT
  ============================================================ */

  const incomeSources: IncomeSource[] = useMemo(() => {
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name ?? "Receita",
      amount: Number(r.amount ?? 0),
      frequency: normalizeFrequency(r.frequency),
      nextDate: r.next_date ?? new Date().toISOString(),
      active: r.active ?? true,
      createdAt: r.created_at ?? new Date().toISOString(),
    }));
  }, [rows]);

  /* ============================================================
     MÉTRICAS
  ============================================================ */

  // Valor mensal projetado
  const totalMonthlyIncome = useMemo(() => {
    return incomeSources.reduce((sum, src) => sum + toMonthlyAmount(src), 0);
  }, [incomeSources]);

  // Projeção para meses futuros
  const monthlyProjection = useCallback(
    (monthsAhead: number) => totalMonthlyIncome * monthsAhead,
    [totalMonthlyIncome]
  );

  // Próximo recebimento (único)
  const nextIncomeEvent: NextIncomeEvent | null = useMemo(() => {
    const upcoming = incomeSources
      .filter((s) => s.active)
      .map((s) => ({
        name: s.name,
        amount: s.amount,
        date: s.nextDate,
        daysUntil: daysUntil(s.nextDate),
      }))
      .filter((e) => e.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return upcoming.length > 0 ? upcoming[0] : null;
  }, [incomeSources]);

  /* ============================================================
     CRUD
  ============================================================ */

  const createIncomeSource = useCallback(
    async (input) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("income_sources")
        .insert({
          user_id: user.id,
          name: input.name,
          amount: input.amount,
          frequency: input.frequency,
          next_date: input.nextDate,
          active: true,
        })
        .select("id")
        .single();

      await reload();
      return data?.id ?? null;
    },
    [reload]
  );

  const updateIncomeSource = useCallback(
    async (id, patch) => {
      const updates: any = {};

      if (patch.name !== undefined) updates.name = patch.name;
      if (patch.amount !== undefined) updates.amount = patch.amount;
      if (patch.frequency !== undefined) updates.frequency = patch.frequency;
      if (patch.nextDate !== undefined) updates.next_date = patch.nextDate;
      if (patch.active !== undefined) updates.active = patch.active;

      await supabase.from("income_sources").update(updates).eq("id", id);
      await reload();
    },
    [reload]
  );

  const deleteIncomeSource = useCallback(
    async (id) => {
      await supabase.from("income_sources").delete().eq("id", id);
      await reload();
    },
    [reload]
  );

  /* ============================================================
     RETURN — PADRÃO OFICIAL
  ============================================================ */

  return {
    loading,

    incomeSources,
    totalMonthlyIncome,
    nextIncomeEvent,
    monthlyProjection,

    aggregates: {
      monthly: {
        income: totalMonthlyIncome,
      },
    },

    reload,
    createIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
  };
}
