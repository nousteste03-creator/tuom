import { serve } from "std/http";
import { createClient } from "supabase";

serve(async (req) => {
  try {
    // 🔐 Segurança simples (cron secret)
    const cronSecret = Deno.env.get("INSIGHTS_CRON_SECRET");
    const headerSecret = req.headers.get("x-cron-secret");

    if (!cronSecret || headerSecret !== cronSecret) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // 🔌 Supabase client (service role)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 🧠 Buscar 1 insight de alto impacto
    const { data: insight, error: insightError } =
      await supabase
        .from("insight_items")
        .select("*")
        .eq("impact_level", "high")
        .eq("notified", false)
        .gte("priority_score", 75)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (insightError) throw insightError;

    if (!insight) {
      return new Response(
        JSON.stringify({ ok: true, message: "No alerts to send" }),
        { status: 200 }
      );
    }

    // 📱 Buscar tokens
    const { data: tokens, error: tokenError } =
      await supabase
        .from("user_push_tokens")
        .select("push_token");

    if (tokenError) throw tokenError;

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, message: "No users to notify" }),
        { status: 200 }
      );
    }

    // 🚀 Enviar push via Expo
    const messages = tokens.map((t) => ({
      to: t.push_token,
      title: "Alerta de impacto",
      body: insight.title,
      data: {
        insight_id: insight.id,
        category: insight.category,
      },
    }));

    const pushResponse = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages),
      }
    );

    if (!pushResponse.ok) {
      throw new Error("Failed to send push notification");
    }

    // ✅ Marcar como notificado
    await supabase
      .from("insight_items")
      .update({ notified: true })
      .eq("id", insight.id);

    return new Response(
      JSON.stringify({
        ok: true,
        notified: tokens.length,
        insight_id: insight.id,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("insights-alerts error:", err);

    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500 }
    );
  }
});
