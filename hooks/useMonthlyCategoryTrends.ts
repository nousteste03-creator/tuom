import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ============================================================
   1) Normalização + Palavras-chave → match categoria IBGE
============================================================ */
const KEYWORDS: Record<string, string[]> = {
  alimentacao: [
    "aliment",
    "alimento",
    "comida",
    "rest",
    "mercado",
    "super",
    "lanche",
    "almo",
    "jantar",
  ],
  transporte: [
    "transp",
    "uber",
    "99",
    "carro",
    "combust",
    "gas",
    "onibus",
    "metro",
  ],
  moradia: [
    "casa",
    "alug",
    "condo",
    "morad",
    "apto",
    "imovel",
    "energia",
    "luz",
    "agua",
  ],
  saude: ["saud", "remedio", "medic", "farm", "consulta", "exame"],
  educacao: ["educ", "curso", "facul", "escola"],
  lazer: ["lazer", "netflix", "spotify", "prime", "disney", "cinema"],
  vestuario: ["roupa", "vest", "moda"],
  servicos: ["serv", "barbe", "manic", "assist", "coach"],
  higiene: ["higien", "pessoal", "sabonete", "shamp", "desodor"],
  comunicacao: ["celular", "internet", "wifi", "telefone", "app"],
  dividas: ["divid", "credito", "emprest", "parcel", "boleto"],
  imprevistos: ["imprev", "emerg"],
};

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchCategoryToSlug(name: string): string | null {
  const clean = normalize(name);

  for (const slug of Object.keys(KEYWORDS)) {
    const words = KEYWORDS[slug];
    if (words.some((w) => clean.includes(w))) return slug;
  }
  return null;
}

/* ============================================================
   MAIN HOOK
============================================================ */
export function useMonthlyCategoryTrends() {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<any[]>([]);
  const [hasPreviousMonth, setHasPreviousMonth] = useState(false);

  /* ============================================================
     LOAD PRINCIPAL
  ============================================================ */
  async function load() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      setTrends([]);
      setLoading(false);
      return;
    }

    const month = new Date().toISOString().slice(0, 7);

    /* ============================================================
       1) Consulta resumo mensal (se existir)
    ============================================================ */
    const { data: summary } = await supabase
      .from("finance_monthly_summary")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", month)
      .maybeSingle();

    const totalIncome = Number(summary?.total_income || 0);

    if (summary && summary.top_categories?.length > 0) {
      const base = summary.top_categories.map((c: any) => ({
        id: c.category_id,
        category_title: c.category_title,
        total_spent: Number(c.current || 0),
        total_spent_prev: Number(c.previous || 0),
      }));

      const selected = pickTwo(base);
      const enriched = await enrich(selected, totalIncome);

      setHasPreviousMonth(summary.total_spent_prev !== null);
      setTrends(enriched);
      setLoading(false);
      return;
    }

    /* ============================================================
       2) FALLLBACK (usuário novo)
    ============================================================ */
    const fallback = await generateFallback(user.id);

    /** Agora O FALLBACK É TAMBÉM ENRIQUECIDO COM IBGE */
    const enrichedFallback = await enrich(fallback, totalIncome);

    setHasPreviousMonth(false);
    setTrends(enrichedFallback);
    setLoading(false);
  }

  /* ============================================================
     SORTEIA SEMPRE 2 CATEGORIAS
  ============================================================ */
  function pickTwo(list: any[]) {
    if (!list || list.length === 0) return [];
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }

  /* ============================================================
     ENRIQUECE COM IBGE + INSIGHTS + %
  ============================================================ */
  async function enrich(rows: any[], totalIncome: number) {
    const final: any[] = [];

    for (const row of rows) {
      const slug = matchCategoryToSlug(row.category_title);

      let benchmark = null;
      if (slug) {
        const { data } = await supabase
          .from("brazil_spending_benchmarks")
          .select("*")
          .eq("category_slug", slug)
          .eq("income_group", "geral")
          .maybeSingle();

        if (data) benchmark = data;
      }

      const pctUser =
        totalIncome > 0 ? (row.total_spent / totalIncome) * 100 : null;

      const pctBR = benchmark?.percent_of_income ?? null;

      let growth: number | null = null;
      if (pctUser !== null && pctBR !== null) {
        growth = pctUser - pctBR;
      }

      let meta = "";
      if (!slug) {
        meta =
          "Como não encontramos padrão nacional semelhante, utilizamos apenas seus dados internos.";
      } else if (pctUser === null) {
        meta = "Ainda não foi possível calcular sua proporção mensal.";
      } else if (pctBR !== null) {
        if (pctUser > pctBR + 3)
          meta = `Você está gastando acima da média brasileira.`;
        else if (pctUser < pctBR - 3)
          meta = `Você está abaixo da média brasileira. Bom controle.`;
        else meta = `Seu gasto está alinhado ao padrão nacional.`;
      }

      final.push({
        ...row,
        pct_user: pctUser,
        national_percent: pctBR,
        growth_pct: growth,
        meta_analysis: meta,
      });
    }

    return final;
  }

  /* ============================================================
     FALLBACK — usuários sem resumo
  ============================================================ */
  async function generateFallback(userId: string) {
    const month = new Date().toISOString().slice(0, 7);

    const { data: categories } = await supabase
      .from("budget_categories")
      .select("id, title");

    const { data: expenses } = await supabase
      .from("budget_expenses")
      .select("category_id, amount, date");

    if (!categories) return [];

    const map: Record<string, number> = {};

    expenses?.forEach((e) => {
      if (e.date.slice(0, 7) === month) {
        map[e.category_id] = (map[e.category_id] || 0) + Number(e.amount);
      }
    });

    const items = categories
      .map((c) => ({
        id: c.id,
        category_title: c.title,
        total_spent: map[c.id] || 0,
      }))
      .filter((c) => c.total_spent > 0)
      .sort((a, b) => b.total_spent - a.total_spent);

    return pickTwo(items);
  }

  useEffect(() => {
    load();
  }, []);

  return { loading, trends, hasPreviousMonth, reload: load };
}
