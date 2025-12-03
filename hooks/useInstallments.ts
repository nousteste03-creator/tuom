// hooks/useInstallments.ts
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type Installment = {
  id: string;
  goal_id: string;
  user_id: string;
  numero: number;
  valor: number;
  data_vencimento: string; // "2025-03-10"
  status: "pendente" | "pago";
  created_at: string;
};

export function useInstallments() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(false);

  /* ============================================================
     1) LISTAR PARCELAS DE UMA META
  ============================================================ */
  const getInstallments = useCallback(async (goalId: string) => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setInstallments([]);
      setLoading(false);
      return [];
    }

    const { data, error } = await supabase
      .from("goal_installments")
      .select("*")
      .eq("goal_id", goalId)
      .eq("user_id", user.id)
      .order("numero", { ascending: true });

    if (!error && data) setInstallments(data as Installment[]);

    setLoading(false);
    return data || [];
  }, []);

  /* ============================================================
     2) MARCAR PARCELA COMO PAGA
  ============================================================ */
  async function markAsPaid(installmentId: string) {
    const { data, error } = await supabase
      .from("goal_installments")
      .update({ status: "pago" })
      .eq("id", installmentId)
      .select("*")
      .single();

    if (error) throw error;

    setInstallments((prev) =>
      prev.map((i) => (i.id === installmentId ? (data as Installment) : i))
    );

    return data;
  }

  /* ============================================================
     3) CALCULAR TOTAL PAGO
        Soma todas as parcelas com status = "pago"
  ============================================================ */
  function calculatePaid(goalId: string): number {
    return installments
      .filter((i) => i.goal_id === goalId && i.status === "pago")
      .reduce((acc, i) => acc + (Number(i.valor) || 0), 0);
  }

  /* ============================================================
     4) CALCULAR VALOR RESTANTE
        Soma parcelas pendentes
  ============================================================ */
  function calculateRemaining(goalId: string): number {
    return installments
      .filter((i) => i.goal_id === goalId && i.status === "pendente")
      .reduce((acc, i) => acc + (Number(i.valor) || 0), 0);
  }

  /* ============================================================
     5) CALCULAR COMPROMISSO MENSAL
        Soma de todas parcelas que vencem no mês atual
  ============================================================ */
  function calculateMonthlyCommitment(goalId: string): number {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 1–12

    return installments
      .filter((i) => {
        if (i.goal_id !== goalId) return false;

        const [y, m] = i.data_vencimento.split("-").map(Number);
        return y === year && m === month;
      })
      .reduce((acc, i) => acc + (Number(i.valor) || 0), 0);
  }

  return {
    installments,
    loading,

    getInstallments,
    markAsPaid,
    calculateRemaining,
    calculatePaid,
    calculateMonthlyCommitment,
  };
}
