// hooks/useCreditScore.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface CreditScoreEntry {
  id: string;
  score: number;
  created_at: string;
}

export function useCreditScore() {
  const [history, setHistory] = useState<CreditScoreEntry[]>([]);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("credit_score_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setHistory(data as CreditScoreEntry[]);
      setCurrentScore(data[0]?.score ?? null);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function runCheck() {
    setLoading(true);

    const simulated = Math.floor(300 + Math.random() * 500);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1️⃣ Registrar score
    const { data: scoreData } = await supabase
      .from("credit_score_history")
      .insert({
        user_id: user?.id,
        score: simulated,
      })
      .select()
      .single();

    // 2️⃣ Log técnico
    await supabase.from("credit_score_checks").insert({
      user_id: user?.id,
      provider: "boa_vista",
      status: "success",
    });

    if (scoreData) {
      setHistory((prev) => [scoreData, ...prev]);
      setCurrentScore(scoreData.score);
    }

    setLoading(false);
  }

  return {
    loading,
    history,
    currentScore,
    runCheck,
    reload: load,
  };
}
