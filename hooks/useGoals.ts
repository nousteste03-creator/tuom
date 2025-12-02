// hooks/useGoals.ts
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ============================================================
// TIPOS OFICIAIS NORMALIZADOS
// ============================================================
export type GoalType = "meta" | "obrigacao" | "investimento";

// OBS: Aceitamos valores antigos do banco e convertemos em runtime.
type LegacyGoalType = GoalType | "divida" | "fundo";

export type Goal = {
  id: string;
  user_id: string;
  titulo: string;
  descricao?: string | null;
  tipo: GoalType; // sempre padronizado após normalize
  target_amount: number;
  current_amount: number;
  prioridade?: number | null;
  data_inicio?: string;
  data_fim?: string | null;
  categoria?: string | null;
  projecao_mensal?: number | null;
  projecao_final?: string | null;
  status: "active" | "completed" | "paused";
  created_at: string;
  updated_at: string;
};

export type GoalEntry = {
  id: string;
  goal_id: string;
  valor: number;
  data: string;
  tipo: string;
  descricao?: string | null;
};

export type GoalInstallment = {
  id: string;
  goal_id: string;
  numero_parcela: number;
  valor_parcela: number;
  vencimento: string;
  status: "pending" | "paid";
};

// ============================================================
// NORMALIZADOR OFICIAL DE TIPOS
// ============================================================
function normalizeGoalType(tipo: LegacyGoalType | null | undefined): GoalType {
  const v = (tipo ?? "").toLowerCase();

  if (v === "meta") return "meta";

  if (v === "divida") return "obrigacao";     // legado antigo
  if (v === "obrigacao") return "obrigacao";

  if (v === "fundo") return "investimento";   // legado antigo
  if (v === "investimento") return "investimento";

  return "meta";
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================
export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [entries, setEntries] = useState<GoalEntry[]>([]);
  const [installments, setInstallments] = useState<GoalInstallment[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingInstallments, setLoadingInstallments] = useState(false);

  // ============================================================
  // LOAD GLOBAL
  // ============================================================
  const loadGoals = useCallback(async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    const mapped: Goal[] = (data ?? []).map((g: any) => ({
      ...g,
      tipo: normalizeGoalType(g.tipo),
    }));

    setGoals(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGoals();
  }, []);

  // ============================================================
  // RELOAD DE UMA META ESPECÍFICA
  // ============================================================
  async function reloadGoal(id: string) {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      const normalized = {
        ...data,
        tipo: normalizeGoalType(data.tipo),
      };

      setGoals((prev) =>
        prev.map((g) => (g.id === id ? (normalized as Goal) : g))
      );
    }
  }

  // ============================================================
  // CREATE META SIMPLES
  // ============================================================
  async function createGoal(payload: Partial<Goal>) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) return;

    const newPayload = {
      ...payload,
      tipo: normalizeGoalType(payload.tipo ?? "meta"),
    };

    const { data, error } = await supabase
      .from("goals")
      .insert({
        ...newPayload,
        user_id: user.id,
        status: "active",
        data_inicio: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;

    const normalized = {
      ...data,
      tipo: normalizeGoalType(data.tipo),
    };

    setGoals((prev) => [...prev, normalized as Goal]);
  }

  // ============================================================
  // CREATE META COM PARCELAS (OBRIGAÇÃO)
  // ============================================================
  async function createGoalWithInstallments({
    titulo,
    descricao,
    tipo,
    target_amount,
    parcelas,
    valor_parcela,
    primeiro_venc,
  }: any) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;
    if (!user) return;

    const { data: goal } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        titulo,
        descricao,
        tipo: normalizeGoalType(tipo),
        target_amount,
        current_amount: 0,
        status: "active",
        data_inicio: new Date().toISOString(),
      })
      .select("*")
      .single();

    // CRIA AS PARCELAS
    const rows = [];
    for (let i = 1; i <= parcelas; i++) {
      rows.push({
        user_id: user.id,
        goal_id: goal.id,
        numero_parcela: i,
        valor_parcela,
        vencimento: addMonths(primeiro_venc, i - 1),
        status: "pending",
      });
    }

    await supabase.from("goal_installments").insert(rows);

    setGoals((prev) => [
      ...prev,
      { ...goal, tipo: normalizeGoalType(goal.tipo) } as Goal,
    ]);
  }

  function addMonths(dateStr: string, m: number) {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + m);
    return d.toISOString().slice(0, 10);
  }

  // ============================================================
  // UPDATE META
  // ============================================================
  async function updateGoal(id: string, payload: Partial<Goal>) {
    const { data } = await supabase
      .from("goals")
      .update({
        ...payload,
        tipo: payload.tipo ? normalizeGoalType(payload.tipo) : undefined,
      })
      .eq("id", id)
      .select("*")
      .single();

    const normalized = {
      ...data,
      tipo: normalizeGoalType(data.tipo),
    };

    setGoals((prev) =>
      prev.map((g) => (g.id === id ? (normalized as Goal) : g))
    );
  }

  // ============================================================
  // DELETE META COMPLETA
  // ============================================================
  async function deleteGoal(id: string) {
    await supabase.from("goals").delete().eq("id", id);
    await supabase.from("goal_entries").delete().eq("goal_id", id);
    await supabase.from("goal_installments").delete().eq("goal_id", id);

    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  // ============================================================
  // ENTRIES (APORTES)
  // ============================================================
  async function getGoalEntries(goalId: string) {
    setLoadingEntries(true);

    const { data } = await supabase
      .from("goal_entries")
      .select("*")
      .eq("goal_id", goalId)
      .order("data", { ascending: true });

    setEntries(data ?? []);
    setLoadingEntries(false);
  }

  async function createGoalEntry(goalId: string, payload: any) {
    await supabase.from("goal_entries").insert({
      goal_id: goalId,
      ...payload,
    });

    const { data: updatedEntries } = await supabase
      .from("goal_entries")
      .select("valor")
      .eq("goal_id", goalId);

    const total = (updatedEntries ?? []).reduce(
      (acc, e) => acc + e.valor,
      0
    );

    await updateGoal(goalId, { current_amount: total });

    setEntries((updatedEntries as any[]) ?? []);
    await reloadGoal(goalId);
  }

  // ============================================================
  // PARCELAS
  // ============================================================
  async function getInstallments(goalId: string) {
    setLoadingInstallments(true);

    const { data } = await supabase
      .from("goal_installments")
      .select("*")
      .eq("goal_id", goalId)
      .order("numero_parcela");

    setInstallments(data ?? []);
    setLoadingInstallments(false);
  }

  async function updateInstallments(goalId: string, total: number, valor: number, primeiro: string) {
    await supabase.from("goal_installments").delete().eq("goal_id", goalId);

    const {
  data: { session },
} = await supabase.auth.getSession();
const user = session?.user;
if (!user) return;

const rows = [];
for (let i = 1; i <= total; i++) {
  rows.push({
    user_id: user.id,
    goal_id: goalId,
    numero_parcela: i,
    valor_parcela: valor,
    vencimento: addMonths(primeiro, i - 1),
    status: "pending",
  });
}

    await supabase.from("goal_installments").insert(rows);

    await getInstallments(goalId);
  }

  async function payInstallment(installId: string) {
    const { data } = await supabase
      .from("goal_installments")
      .update({ status: "paid" })
      .eq("id", installId)
      .select("*")
      .single();

    setInstallments((prev) =>
      prev.map((i) => (i.id === installId ? data : i))
    );

    await createGoalEntry(data.goal_id, {
      valor: data.valor_parcela,
      tipo: "pagamento_parcela",
      descricao: `Pagamento parcela #${data.numero_parcela}`,
      data: new Date().toISOString().slice(0, 10),
    });
  }

  // ============================================================
  // INSIGHTS PRO
  // ============================================================
  function calculateInsights(goal: Goal) {
    const percent =
      goal.target_amount > 0
        ? (goal.current_amount / goal.target_amount) * 100
        : 0;

    const idealMonthly = goal.target_amount / 12;

    const restante = goal.target_amount - goal.current_amount;

    const estimatedMonths =
      idealMonthly > 0
        ? Math.ceil(restante / idealMonthly)
        : null;

    return { percent, idealMonthly, estimatedMonths };
  }

  const insights = goals.map((g) => ({
    goalId: g.id,
    ...calculateInsights(g),
  }));

  // ============================================================
  // RETORNO FINAL
  // ============================================================
  return {
    goals,
    loading,
    entries,
    installments,

    loadingEntries,
    loadingInstallments,

    insights,

    mainGoal: goals[0] ?? null,
    secondaryGoals: goals.slice(1),

    loadGoals,
    reload: loadGoals,
    reloadGoal,

    createGoal,
    createGoalWithInstallments,
    updateGoal,
    deleteGoal,

    getGoalEntries,
    createGoalEntry,

    getInstallments,
    updateInstallments,
    payInstallment,
  };
}
