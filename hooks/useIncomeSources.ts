// hooks/useIncomeSources.ts
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";

/** Tipagem global */
export type IncomeSource = {
  id: string;
  user_id: string;
  tipo: "salario" | "servico" | "empresa" | "variavel" | "extra";
  valor: number | string;
  recorrencia: "mensal" | "semanal" | "quinzenal" | "unica";
  descricao?: string;
  data_inicio?: string;
  data_fim?: string | null;
  created_at?: string;
};

export function useIncomeSources() {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------
     Normalizar moeda (string → number)
  ------------------------------------------------------------ */
  function parseMoney(v: any): number {
    if (!v) return 0;
    if (typeof v === "number") return v;

    try {
      return Number(
        String(v)
          .replace(/[^\d,.-]/g, "")
          .replace(/\./g, "")
          .replace(",", ".")
      );
    } catch {
      return 0;
    }
  }

  /* ------------------------------------------------------------
     LOAD
  ------------------------------------------------------------ */
  const getIncomeSources = useCallback(async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setSources([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_income_sources")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setSources(data as IncomeSource[]);
    }

    setLoading(false);
  }, []);

  /* Carrega ao abrir a tela (fix: revalidate onFocus) */
  useFocusEffect(
    useCallback(() => {
      getIncomeSources();
    }, [])
  );

  useEffect(() => {
    getIncomeSources();
  }, []);

  /* ------------------------------------------------------------
     CREATE
  ------------------------------------------------------------ */
  async function createIncomeSource(payload: Partial<IncomeSource>) {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return null;

    const { data, error } = await supabase
      .from("user_income_sources")
      .insert({
        ...payload,
        user_id: user.id,
        valor: parseMoney(payload.valor),
      })
      .select("*")
      .single();

    if (error) throw error;

    setSources((prev) => [...prev, data as IncomeSource]);

    return data;
  }

  /* ------------------------------------------------------------
     UPDATE
  ------------------------------------------------------------ */
  async function updateIncomeSource(id: string, payload: Partial<IncomeSource>) {
    const { data, error } = await supabase
      .from("user_income_sources")
      .update({
        ...payload,
        valor: parseMoney(payload.valor),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    setSources((prev) =>
      prev.map((src) => (src.id === id ? (data as IncomeSource) : src))
    );

    return data;
  }

  /* ------------------------------------------------------------
     DELETE
  ------------------------------------------------------------ */
  async function deleteIncomeSource(id: string) {
    const { error } = await supabase
      .from("user_income_sources")
      .delete()
      .eq("id", id);

    if (error) throw error;

    setSources((prev) => prev.filter((s) => s.id !== id));
  }

  /* ------------------------------------------------------------
     ATIVO NO MÊS
  ------------------------------------------------------------ */
  function isActiveInCurrentMonth(src: IncomeSource) {
    const today = new Date().toISOString().slice(0, 10);

    const started = !src.data_inicio || src.data_inicio <= today;
    const notEnded = !src.data_fim || src.data_fim >= today;

    return started && notEnded;
  }

  /* ------------------------------------------------------------
     CALCULAR RENDA FIXA
     (salário + empresa)
  ------------------------------------------------------------ */
  function calculateFixedIncome(): number {
    return sources
      .filter((s) => isActiveInCurrentMonth(s))
      .filter((s) => s.tipo === "salario" || s.tipo === "empresa")
      .reduce((acc, s) => {
        const v = parseMoney(s.valor);
        return acc + (s.recorrencia === "mensal" ? v : v);
      }, 0);
  }

  /* ------------------------------------------------------------
     CALCULAR RENDA VARIÁVEL
     (serviço + variavel + extra)
  ------------------------------------------------------------ */
  function calculateVariableIncome(): number {
    return sources
      .filter(isActiveInCurrentMonth)
      .filter((s) =>
        ["servico", "variavel", "extra"].includes(s.tipo.toLowerCase())
      )
      .reduce((acc, src) => {
        const valor = parseMoney(src.valor);
        const rec = (src.recorrencia || "").toLowerCase().trim();

        switch (rec) {
          case "mensal":
            return acc + valor;
          case "semanal":
            return acc + valor * 4.345;
          case "quinzenal":
            return acc + valor * 2;
          default:
            return acc + valor;
        }
      }, 0);
  }

  /* ------------------------------------------------------------
     CALCULAR RENDA TOTAL MENSAL
  ------------------------------------------------------------ */
  function calculateMonthlyIncome(): number {
    const active = sources.filter(isActiveInCurrentMonth);

    return active.reduce((total, s) => {
      const valor = parseMoney(s.valor);
      const rec = s.recorrencia.toLowerCase();

      switch (rec) {
        case "mensal":
          return total + valor;
        case "semanal":
          return total + valor * 4.345;
        case "quinzenal":
          return total + valor * 2;
        case "unica":
          return total + valor;
        default:
          return total;
      }
    }, 0);
  }

  /* ------------------------------------------------------------
     EXPORT
  ------------------------------------------------------------ */
  return {
    sources,
    loading,

    getIncomeSources,
    createIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,

    calculateFixedIncome,
    calculateVariableIncome,
    calculateMonthlyIncome,
  };
}
