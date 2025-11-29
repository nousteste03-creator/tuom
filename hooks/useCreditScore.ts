// hooks/useCreditScore.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCreditScore() {
  const [history, setHistory] = useState<any[]>([]);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /* ───────────────────────────────────────────────
     LOAD HISTORY (oficial)
  ─────────────────────────────────────────────── */
  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setHistory([]);
      setCurrentScore(null);
      return;
    }

    const { data, error } = await supabase
      .from("credit_score_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Credit score load error:", error);
      setHistory([]);
      setCurrentScore(null);
      return;
    }

    const list = data ?? [];
    setHistory(list);

    // Score atual = item mais recente
    if (list.length > 0) {
      setCurrentScore(list[0].score ?? null);
    } else {
      setCurrentScore(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ───────────────────────────────────────────────
     RODAR UMA CONSULTA (modo FAKE até API real entrar)
  ─────────────────────────────────────────────── */
  async function runCheck() {
    setLoading(true);

    // Placeholder que imita Boa Vista/Quod
    const fakeScore = Math.floor(300 + Math.random() * 500);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return null;
    }

    const { data, error } = await supabase
      .from("credit_score_history")
      .insert({
        user_id: user.id,
        score: fakeScore,
        provider: "boa_vista",
        created_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      setHistory((prev) => [data, ...prev]);
      setCurrentScore(data.score);
    }

    setLoading(false);
    return data;
  }

  return {
    loading,
    history,
    currentScore,
    runCheck,
    reload: load,
  };
}
