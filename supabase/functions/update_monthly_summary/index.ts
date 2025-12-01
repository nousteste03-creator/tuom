// supabase/functions/update_monthly_summary/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { record, old_record, type } = await req.json();

    // Se não for insert/update/delete, ignorar
    if (!["INSERT", "UPDATE", "DELETE"].includes(type)) {
      return new Response("ignored");
    }

    const expense = type === "DELETE" ? old_record : record;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const userId = expense.user_id;
    const categoryId = expense.category_id;
    const date = expense.date; // formato YYYY-MM-DD
    const month = date.slice(0, 7); // YYYY-MM

    // 1) Buscar todas as despesas do mês + categoria
    const { data: monthlyExpenses, error: monthlyErr } = await supabase
      .from("budget_expenses")
      .select("amount, date")
      .eq("user_id", userId)
      .eq("category_id", categoryId)
      .like("date", `${month}%`);

    if (monthlyErr) throw monthlyErr;

    // Total gastado no mês
    const amountSpent = monthlyExpenses.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );

    // 2) Gerar sparkline (10–12 pontos)
    const NUM_POINTS = 12;
    const daysInMonth = 31;

    const rawPoints = new Array(daysInMonth).fill(0);

    monthlyExpenses.forEach((e) => {
      const day = Number(e.date.split("-")[2]) - 1; // 0-index
      rawPoints[day] += Number(e.amount || 0);
    });

    // Comprimir para 12 pontos
    const bucketSize = Math.floor(daysInMonth / NUM_POINTS);
    const compact = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      const start = i * bucketSize;
      const end = start + bucketSize;
      const slice = rawPoints.slice(start, end);
      const value = slice.reduce((a, b) => a + b, 0);
      compact.push(value);
    }

    // 3) Upsert final
    const { error: upsertErr } = await supabase
      .from("finance_monthly_summary")
      .upsert({
        user_id: userId,
        month,
        category_id: categoryId,
        amount_spent: amountSpent,
        daily_points: compact,
      });

    if (upsertErr) throw upsertErr;

    return new Response("ok", { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
