// hooks/useGoals.ts
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useUserPlan } from "@/hooks/useUserPlan";

/* ============================================================
   Tipos
============================================================ */

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

  projection?: {
    monthly: number | null;
    remaining: number;
    monthsToGoal: number | null;
    projectedEndDate: string | null;
    missedContribution: boolean;
    curveFuture: { date: string; value: number }[];
  };
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

/* ============================================================
   Helpers
============================================================ */

function monthsDiff(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  const total = years * 12 + months;
  return total < 0 ? 0 : total;
}

function computeGoalStats(goal: RawGoalRow, installments: Installment[]): GoalWithStats {
  const now = new Date();

  const title = goal.title ?? "Meta";
  const rawType = goal.type ?? goal.tipo ?? "goal";
  const type = rawType as GoalType;

  const targetAmount = Number(goal.target_amount ?? 0);
  const currentAmount = Number(goal.current_amount ?? 0);

  const start = goal.start_date ?? new Date().toISOString();
  const end = goal.end_date ?? null;

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

function computeInvestmentProjection(goal: GoalWithStats) {
  if (goal.type !== "investment") return null;

  const monthly = goal.autoRuleMonthly ?? null;
  if (!monthly || monthly <= 0) return null;

  const now = new Date();
  const today = now.getDate();

  const remaining = goal.remainingAmount;
  if (remaining <= 0) {
    return {
      monthly,
      remaining: 0,
      monthsToGoal: 0,
      projectedEndDate: now.toISOString().split("T")[0],
      missedContribution: false,
      curveFuture: [],
    };
  }

  const dueDay = 10;
  const missedContribution = today > dueDay;

  let adjustedRemaining = remaining;
  if (missedContribution) adjustedRemaining += monthly;

  const monthsToGoal =
    monthly > 0 ? Math.ceil(adjustedRemaining / monthly) : null;

  let projectedEndDate: string | null = null;
  if (monthsToGoal !== null) {
    const cursor = new Date(now);
    cursor.setMonth(cursor.getMonth() + monthsToGoal);
    projectedEndDate = cursor.toISOString().split("T")[0];
  }

  const curveFuture = [];
  let accumulated = goal.currentAmount;
  let cursor = new Date(now);

  for (let i = 0; i < (monthsToGoal ?? 0); i++) {
    cursor = new Date(cursor);
    cursor.setMonth(cursor.getMonth() + 1);
    accumulated += monthly;

    curveFuture.push({
      date: cursor.toISOString().split("T")[0],
      value: accumulated,
    });
  }

  return {
    monthly,
    remaining,
    monthsToGoal,
    projectedEndDate,
    missedContribution,
    curveFuture,
  };
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

async function generateInstallments(goalId: string, input: any, userId: string) {
  const total = input.installmentsCount ?? 0;
  if (total <= 0) return;

  const firstDate = input.firstDueDate;
  if (!firstDate) return;

  const amount = Number(input.installmentAmount || 0);

  const rows = [];

  for (let i = 0; i < total; i++) {
    rows.push({
      user_id: userId,
      goal_id: goalId,
      due_date: addMonths(new Date(firstDate), i),
      amount,
      status: "upcoming",
      sequence: i + 1,
      paid_at: null,
    });
  }

  await supabase.from("goal_installments").insert(rows);
}

/* ============================================================
   Proteção anti-loop
============================================================ */

let isReloading = false;

/* ============================================================
   Hook principal
============================================================ */

export function useGoals() {
  const [loading, setLoading] = useState(true);
  const [rawGoals, setRawGoals] = useState<RawGoalRow[]>([]);
  const [rawInstallments, setRawInstallments] =
    useState<RawInstallmentRow[]>([]);

  const { isPro } = useUserPlan();

  /* ------------------------------------------------------------
     RELOAD — corrigido
  ------------------------------------------------------------ */
  const reload = useCallback(async () => {
    if (isReloading) return;
    isReloading = true;
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRawGoals([]);
        setRawInstallments([]);
        setLoading(false);
        isReloading = false;
        return;
      }

      const { data: goalsData = [] } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      const { data: installmentsData = [] } = await supabase
        .from("goal_installments")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      setRawGoals(goalsData || []);
      setRawInstallments(installmentsData || []);
    } catch (err) {
      console.log("ERROR/useGoals.reload:", err);
    } finally {
      setLoading(false);
      isReloading = false;
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /* ============================================================
     PAYMENT-RECONCILE — agora 100% seguro
============================================================ */

  const lastReconcileSnapshot = useRef<string>("");

  useEffect(() => {
    if (!rawGoals.length || !rawInstallments.length) return;

    const snapshot = JSON.stringify(
      rawInstallments.filter((i) => i.status === "paid")
    );

    if (snapshot === lastReconcileSnapshot.current) {
      return; // nada mudou
    }

    lastReconcileSnapshot.current = snapshot;

    async function reconcile() {
      try {
        console.log("DEBUG/PAYMENT-RECONCILE → iniciando");

        const paidByGoal: Record<string, number> = {};

        for (const inst of rawInstallments) {
          if (
            inst.status === "paid" &&
            inst.goal_id &&
            inst.amount != null
          ) {
            const key = inst.goal_id;
            const prev = paidByGoal[key] ?? 0;
            paidByGoal[key] = prev + Number(inst.amount || 0);
          }
        }

        for (const g of rawGoals) {
          const paid = paidByGoal[g.id] ?? 0;
          if (paid <= 0) continue;

          const current = Number(g.current_amount || 0);
          if (paid > current) {
            await supabase
              .from("goals")
              .update({ current_amount: paid })
              .eq("id", g.id);
          }
        }
      } catch (err) {
        console.log("ERROR/PAYMENT-RECONCILE → exceção:", err);
      }
    }

    reconcile();
  }, [rawGoals, rawInstallments]);

  /* ============================================================
     Installments por goal
============================================================ */

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
        amount: Number(row.amount || 0),
        status: (row.status as InstallmentStatus) ?? "upcoming",
        sequence: row.sequence,
        paidAt: row.paid_at,
        createdAt: row.created_at ?? new Date().toISOString(),
      });

      map[row.goal_id] = list;
    }

    return map;
  }, [rawInstallments]);

  /* ============================================================
     Build goals finais
============================================================ */

  const allGoals = useMemo(() => {
    return rawGoals.map((g) => {
      const base = computeGoalStats(g, installmentsByGoalId[g.id] || []);

      if (base.type === "investment") {
        const projection = computeInvestmentProjection(base);
        return { ...base, projection };
      }

      return base;
    });
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
    return goals.find((g) => g.status === "active") ?? null;
  }, [allGoals, goals]);

  /* ============================================================
     FREE LIMIT CHECK
============================================================ */

  const activeCount = goals.filter((g) => g.status === "active").length;
  const canCreateNewGoal = isPro || activeCount < 1;
  const cannotCreateReason =
    !canCreateNewGoal && !isPro ? "free_limit" : undefined;

  /* ============================================================
     Outflow mensal
============================================================ */

  function computeOutflow(list: GoalWithStats[], type: GoalType) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    let total = 0;

    for (const g of list) {
      if (g.type !== type) continue;

      for (const inst of g.installments) {
        const d = new Date(inst.dueDate);
        if (d.getFullYear() === y && d.getMonth() === m) {
          total += inst.amount;
        }
      }
    }

    return total;
  }

  const monthlyDebtOutflow = useMemo(
    () => computeOutflow(debts, "debt"),
    [debts]
  );

  const monthlyGoalsOutflow = useMemo(
    () => computeOutflow(goals, "goal"),
    [goals]
  );

  const monthlyInvestmentsOutflow = useMemo(
    () => computeOutflow(investments, "investment"),
    [investments]
  );

  const monthlyTotalExpenses =
    monthlyDebtOutflow + monthlyGoalsOutflow + monthlyInvestmentsOutflow;

  /* ============================================================
     Métodos helpers
============================================================ */

  const goalProgress = useCallback(
    (id: string) =>
      (allGoals.find((g) => g.id === id)?.progressPercent ?? 0) / 100,
    [allGoals]
  );

  const goalRemaining = useCallback(
    (id: string) => allGoals.find((g) => g.id === id)?.remainingAmount ?? 0,
    [allGoals]
  );

  const nextInstallment = useCallback(
    (id: string) => {
      const g = allGoals.find((x) => x.id === id);
      if (!g) return null;

      const upcoming = g.installments.find((i) => i.status !== "paid");
      return upcoming ? upcoming.amount : null;
    },
    [allGoals]
  );

  const installmentsByGoal = useCallback(
    (id: string) =>
      allGoals.find((g) => g.id === id)?.installments ?? [],
    [allGoals]
  );

  /* ============================================================
     CREATE
============================================================ */

  const createGoal = useCallback(
    async (input: any) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const type = input.type;

      if (!isPro) {
        const { count } = await supabase
          .from("goals")
          .select("*", { head: true, count: "exact" })
          .eq("user_id", user.id)
          .eq("type", type);

        if ((count ?? 0) >= 1) return "PAYWALL";
      }

      const payload = {
        user_id: user.id,
        title: input.title,
        type: input.type,
        target_amount: Number(input.targetAmount),
        current_amount: Number(input.currentAmount ?? 0),
        start_date: input.startDate ?? new Date().toISOString(),
        end_date: input.endDate ?? null,
        debt_style: input.debtStyle ?? null,
        auto_rule_monthly: input.autoRuleMonthly ?? null,
        notes: input.notes ?? null,
        status: "active",
      };

      const { data, error } = await supabase
        .from("goals")
        .insert(payload)
        .select("id")
        .single();

      if (error) return null;

      const goalId = data?.id;

      if (
        goalId &&
        input.type === "debt" &&
        input.installmentsCount > 0 &&
        input.installmentAmount &&
        input.firstDueDate
      ) {
        await generateInstallments(goalId, input, user.id);
      }

      await reload();
      await new Promise((r) => setTimeout(r, 80));

      return goalId;
    },
    [isPro, reload]
  );

  /* ============================================================
     UPDATE
============================================================ */

  const updateGoal = useCallback(
    async (goalId: string, patch: any) => {
      const updates: any = {};

      if (patch.title !== undefined) updates.title = patch.title;
      if (patch.targetAmount !== undefined)
        updates.target_amount = patch.targetAmount;
      if (patch.currentAmount !== undefined)
        updates.current_amount = patch.currentAmount;
      if (patch.startDate !== undefined)
        updates.start_date = patch.startDate;
      if (patch.endDate !== undefined) updates.end_date = patch.endDate;
      if (patch.status !== undefined) updates.status = patch.status;
      if (patch.autoRuleMonthly !== undefined)
        updates.auto_rule_monthly = patch.autoRuleMonthly;
      if (patch.debtStyle !== undefined)
        updates.debt_style = patch.debtStyle ?? null;
      if (patch.notes !== undefined) updates.notes = patch.notes;
      if (patch.isPrimary !== undefined)
        updates.is_primary = patch.isPrimary;

      await supabase.from("goals").update(updates).eq("id", goalId);
      await reload();
    },
    [reload]
  );

  /* ============================================================
     SET PRIMARY
============================================================ */

  const setPrimaryGoal = useCallback(
    async (goalId: string) => {
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
    },
    [reload]
  );

  /* ============================================================
     INSTALLMENTS OPS
============================================================ */

  const markInstallmentPaid = useCallback(
    async (installmentId: string) => {
      const { data: instRows } = await supabase
        .from("goal_installments")
        .select("*")
        .eq("id", installmentId)
        .limit(1);

      if (!instRows?.length) return;

      const installment = instRows[0];
      const goalId = installment.goal_id;
      const amount = Number(installment.amount || 0);

      const { data: goalRows } = await supabase
        .from("goals")
        .select("*")
        .eq("id", goalId)
        .limit(1);

      if (!goalRows?.length) return;

      const goal = goalRows[0];
      const current = Number(goal.current_amount || 0);
      const newCurrent = current + amount;

      await supabase
        .from("goal_installments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", installmentId);

      await supabase
        .from("goals")
        .update({ current_amount: newCurrent })
        .eq("id", goalId);

      await reload();
    },
    [reload]
  );

  const updateInstallment = useCallback(
    async (installmentId: string, patch: any) => {
      const updates: any = {};

      if (patch.dueDate !== undefined) updates.due_date = patch.dueDate;
      if (patch.amount !== undefined) updates.amount = patch.amount;
      if (patch.status !== undefined) updates.status = patch.status;

      await supabase
        .from("goal_installments")
        .update(updates)
        .eq("id", installmentId);

      await reload();
    },
    [reload]
  );

  /* ============================================================
     RETURN FINAL
============================================================ */

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

    goalProgress,
    goalRemaining,
    nextInstallment,
    installmentsByGoal,

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
