// hooks/useGoals.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUserPlan } from "@/hooks/useUserPlan";

export type GoalType = "goal" | "debt" | "investment";
export type DebtStyle = "credit_card" | "loan" | "financing";
export type InstallmentStatus = "upcoming" | "paid" | "overdue";

export type Installment = {
  id: string;
  goalId: string;
  userId: string;
  dueDate: string;
  amount: number;
  status: InstallmentStatus;
  sequence: number | null;
  paidAt?: string | null;
  createdAt: string;
};

export type GoalWithStats = {
  id: string;
  userId: string;
  type: GoalType;
  debtStyle?: DebtStyle | null;

  title: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string | null;
  status: "active" | "paused" | "completed" | "cancelled";
  isPrimary: boolean;

  autoRuleMonthly?: number | null;
  notes?: string | null;

  progressPercent: number;
  remainingAmount: number;
  monthsRemaining: number | null;
  suggestedMonthly: number | null;

  installments: Installment[];

  aheadOrBehindMonths: number | null;
};

type RawGoalRow = {
  id: string;
  user_id: string;
  title: string | null;
  titulo?: string | null;
  type: string | null;
  tipo?: string | null;
  target_amount: number | null;
  current_amount: number | null;
  start_date: string | null;
  data_inicio?: string | null;
  end_date: string | null;
  data_fim?: string | null;
  status: string | null;
  is_primary: boolean | null;
  debt_style: string | null;
  auto_rule_monthly: number | null;
  notes: string | null;
  created_at: string | null;
};

type RawInstallmentRow = {
  id: string;
  user_id: string;
  goal_id: string;
  due_date: string | null;
  amount: number | null;
  status: string | null;
  sequence: number | null;
  paid_at: string | null;
  created_at: string | null;
};

export type UseGoalsReturn = {
  loading: boolean;

  primaryGoal: GoalWithStats | null;

  goals: GoalWithStats[];
  debts: GoalWithStats[];
  investments: GoalWithStats[];

  monthlyDebtOutflow: number;
  monthlyGoalsOutflow: number;
  monthlyInvestmentsOutflow: number;

  aggregates: {
    monthly: {
      debts: number;
      goals: number;
      investments: number;
      total: number;
    };
  };

  canCreateNewGoal: boolean;
  cannotCreateReason?: "free_limit";

  reload: () => Promise<void>;
  setPrimaryGoal: (goalId: string) => Promise<void>;

  createGoal: (input: {
    type: GoalType;
    debtStyle?: DebtStyle;
    title: string;
    targetAmount: number;
    currentAmount?: number;
    startDate?: string;
    endDate?: string | null;
    autoRuleMonthly?: number | null;
    notes?: string | null;
  }) => Promise<string | null>;

  updateGoal: (
    goalId: string,
    patch: Partial<{
      title: string;
      targetAmount: number;
      currentAmount: number;
      startDate: string;
      endDate: string | null;
      status: "active" | "paused" | "completed" | "cancelled";
      autoRuleMonthly: number | null;
      debtStyle: DebtStyle | null;
      notes: string | null;
      isPrimary: boolean;
    }>
  ) => Promise<void>;

  markInstallmentPaid: (installmentId: string) => Promise<void>;
  updateInstallment: (
    installmentId: string,
    patch: Partial<{
      dueDate: string;
      amount: number;
      status: InstallmentStatus;
    }>
  ) => Promise<void>;
};

/* ================================================================
   Helpers
================================================================ */

function monthsDiff(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  const total = years * 12 + months;
  return total < 0 ? 0 : total;
}

function computeGoalStats(
  goal: RawGoalRow,
  installments: Installment[]
): GoalWithStats {
  const now = new Date();

  const title = goal.title ?? goal.titulo ?? "Meta";
  const type = (goal.type ?? goal.tipo ?? "goal") as GoalType;

  const targetAmount = Number(goal.target_amount ?? 0);
  const currentAmount = Number(goal.current_amount ?? 0);

  const start = goal.start_date ?? goal.data_inicio ?? new Date().toISOString();
  const end = goal.end_date ?? goal.data_fim ?? null;

  const startDateObj = start ? new Date(start) : now;
  const endDateObj = end ? new Date(end) : null;

  const remainingAmount = Math.max(targetAmount - currentAmount, 0);

  let monthsRemaining: number | null = null;
  let suggestedMonthly: number | null = null;
  let aheadOrBehindMonths: number | null = null;

  if (endDateObj) {
    const totalMonths = monthsDiff(startDateObj, endDateObj);
    const elapsedMonths = monthsDiff(startDateObj, now);

    if (totalMonths > 0) {
      const idealProgressByNow = (elapsedMonths / totalMonths) * targetAmount;
      const diffAmount = currentAmount - idealProgressByNow;

      const baseMonthly =
        goal.auto_rule_monthly != null
          ? Number(goal.auto_rule_monthly)
          : totalMonths > 0
          ? targetAmount / totalMonths
          : 0;

      if (baseMonthly > 0) {
        aheadOrBehindMonths = diffAmount / baseMonthly;
      }

      const remaining = totalMonths - elapsedMonths;
      monthsRemaining = remaining > 0 ? remaining : 0;

      suggestedMonthly =
        remaining > 0 && remainingAmount > 0
          ? remainingAmount / remaining
          : null;
    }
  }

  const progressPercent =
    targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;

  return {
    id: goal.id,
    userId: goal.user_id,
    type,
    debtStyle: (goal.debt_style as DebtStyle | null) ?? null,
    title,
    targetAmount,
    currentAmount,
    startDate: start,
    endDate: end,
    status: (goal.status as any) ?? "active",
    isPrimary: Boolean(goal.is_primary),
    autoRuleMonthly:
      goal.auto_rule_monthly != null ? Number(goal.auto_rule_monthly) : null,
    notes: goal.notes,

    progressPercent,
    remainingAmount,
    monthsRemaining,
    suggestedMonthly,
    installments,
    aheadOrBehindMonths,
  };
}

function computeMonthlyOutflowForCurrentMonth(
  goals: GoalWithStats[],
  type: GoalType
): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let total = 0;

  for (const goal of goals) {
    if (goal.type !== type) continue;

    for (const inst of goal.installments) {
      const d = new Date(inst.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        total += inst.amount;
      }
    }
  }

  return total;
}

/* ================================================================
   HOOK PRINCIPAL
================================================================ */

export function useGoals(): UseGoalsReturn {
  const [loading, setLoading] = useState(true);
  const [rawGoals, setRawGoals] = useState<RawGoalRow[]>([]);
  const [rawInstallments, setRawInstallments] = useState<RawInstallmentRow[]>([]);

  const { isPro } = useUserPlan();

  const reload = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setRawGoals([]);
      setRawInstallments([]);
      setLoading(false);
      return;
    }

    const userId = user.id;

    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    const { data: installmentsData } = await supabase
      .from("goal_installments")
      .select("*")
      .eq("user_id", userId)
      .order("due_date", { ascending: true });

    setRawGoals(goalsData || []);
    setRawInstallments(installmentsData || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const installmentsByGoalId = useMemo(() => {
    const map: Record<string, Installment[]> = {};
    for (const row of rawInstallments) {
      if (!row.goal_id) continue;
      const list = map[row.goal_id] || [];
      list.push({
        id: row.id,
        goalId: row.goal_id,
        userId: row.user_id,
        dueDate: row.due_date ?? new Date().toISOString(),
        amount: Number(row.amount ?? 0),
        status: (row.status as InstallmentStatus) ?? "upcoming",
        sequence: row.sequence,
        paidAt: row.paid_at,
        createdAt: row.created_at ?? new Date().toISOString(),
      });
      map[row.goal_id] = list;
    }
    return map;
  }, [rawInstallments]);

  const allGoals = useMemo(() => {
    return rawGoals.map((g) =>
      computeGoalStats(g, installmentsByGoalId[g.id] || [])
    );
  }, [rawGoals, installmentsByGoalId]);

  const goals = useMemo(() => allGoals.filter((g) => g.type === "goal"), [allGoals]);
  const debts = useMemo(() => allGoals.filter((g) => g.type === "debt"), [allGoals]);
  const investments = useMemo(
    () => allGoals.filter((g) => g.type === "investment"),
    [allGoals]
  );

  const primaryGoal = useMemo(() => {
    const explicit = allGoals.find((g) => g.isPrimary);
    if (explicit) return explicit;
    const fallback = goals.find((g) => g.status === "active");
    return fallback ?? null;
  }, [allGoals, goals]);

  const activePersonalGoalsCount = useMemo(
    () => goals.filter((g) => g.status === "active").length,
    [goals]
  );

  const canCreateNewGoal = useMemo(() => {
    if (isPro) return true;
    return activePersonalGoalsCount < 1;
  }, [isPro, activePersonalGoalsCount]);

  const cannotCreateReason: "free_limit" | undefined = useMemo(() => {
    if (!canCreateNewGoal && !isPro) return "free_limit";
    return undefined;
  }, [canCreateNewGoal, isPro]);

  // Agregados
  const monthlyDebtOutflow = useMemo(
    () => computeMonthlyOutflowForCurrentMonth(debts, "debt"),
    [debts]
  );
  const monthlyGoalsOutflow = useMemo(
    () => computeMonthlyOutflowForCurrentMonth(goals, "goal"),
    [goals]
  );
  const monthlyInvestmentsOutflow = useMemo(
    () => computeMonthlyOutflowForCurrentMonth(investments, "investment"),
    [investments]
  );

  // Soma geral — painel Finance usa isso
  const monthlyTotalExpenses = useMemo(() => {
    return (
      monthlyDebtOutflow +
      monthlyGoalsOutflow +
      monthlyInvestmentsOutflow
    );
  }, [
    monthlyDebtOutflow,
    monthlyGoalsOutflow,
    monthlyInvestmentsOutflow,
  ]);

  /* ================================================================
     AÇÕES
  ================================================================ */

  const setPrimaryGoal = useCallback(async (goalId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("goals")
      .update({ is_primary: false })
      .eq("user_id", user.id);

    await supabase
      .from("goals")
      .update({ is_primary: true })
      .eq("id", goalId);

    await reload();
  }, [reload]);

  const createGoal = useCallback(async (input) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    if (input.type === "goal" && !isPro && !canCreateNewGoal) {
      console.warn("FREE limit");
      return null;
    }

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: input.title,
        type: input.type,
        target_amount: input.targetAmount,
        current_amount: input.currentAmount ?? 0,
        start_date: input.startDate ?? new Date().toISOString(),
        end_date: input.endDate ?? null,
        debt_style: input.debtStyle ?? null,
        auto_rule_monthly: input.autoRuleMonthly ?? null,
        notes: input.notes ?? null,
        status: "active",
      })
      .select("id")
      .single();

    if (error) return null;

    await reload();
    return data?.id ?? null;
  }, [isPro, canCreateNewGoal, reload]);

  const updateGoal = useCallback(async (goalId, patch) => {
    const updates: any = {};

    if (patch.title !== undefined) updates.title = patch.title;
    if (patch.targetAmount !== undefined)
      updates.target_amount = patch.targetAmount;
    if (patch.currentAmount !== undefined)
      updates.current_amount = patch.currentAmount;
    if (patch.startDate !== undefined) updates.start_date = patch.startDate;
    if (patch.endDate !== undefined) updates.end_date = patch.endDate;
    if (patch.status !== undefined) updates.status = patch.status;
    if (patch.autoRuleMonthly !== undefined)
      updates.auto_rule_monthly = patch.autoRuleMonthly;
    if (patch.debtStyle !== undefined)
      updates.debt_style = patch.debtStyle ?? null;
    if (patch.notes !== undefined) updates.notes = patch.notes;
    if (patch.isPrimary !== undefined)
      updates.is_primary = patch.isPrimary;

    if (Object.keys(updates).length === 0) return;

    await supabase.from("goals").update(updates).eq("id", goalId);
    await reload();
  }, [reload]);

  const markInstallmentPaid = useCallback(async (installmentId: string) => {
    await supabase
      .from("goal_installments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", installmentId);

    await reload();
  }, [reload]);

  const updateInstallment = useCallback(async (installmentId, patch) => {
    const updates: any = {};

    if (patch.dueDate !== undefined) updates.due_date = patch.dueDate;
    if (patch.amount !== undefined) updates.amount = patch.amount;
    if (patch.status !== undefined) updates.status = patch.status;

    if (Object.keys(updates).length === 0) return;

    await supabase
      .from("goal_installments")
      .update(updates)
      .eq("id", installmentId);

    await reload();
  }, [reload]);

  return {
    loading,
    primaryGoal,
    goals,
    debts,
    investments,

    monthlyDebtOutflow,
    monthlyGoalsOutflow,
    monthlyInvestmentsOutflow,

    aggregates: {
      monthly: {
        debts: monthlyDebtOutflow,
        goals: monthlyGoalsOutflow,
        investments: monthlyInvestmentsOutflow,
        total: monthlyTotalExpenses,
      },
    },

    canCreateNewGoal,
    cannotCreateReason,

    reload,
    setPrimaryGoal,
    createGoal,
    updateGoal,
    markInstallmentPaid,
    updateInstallment,
  };
}
