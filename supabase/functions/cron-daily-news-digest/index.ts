import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GNEWS_API_KEY = Deno.env.get("GNEWS_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Categorias fixas (decisão sagrada)
const CATEGORIES = ["technology", "business", "finance", "ai", "startup"];

serve(async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // 1) Idempotência diária (usa a coluna real: date)
    const { data: existing, error: existingErr } = await supabase
      .from("daily_news_digest")
      .select("id")
      .eq("date", today)
      .limit(1);

    if (existingErr) {
      console.error("Existing check error:", existingErr);
      return new Response(`Existing check error: ${existingErr.message}`, {
        status: 500,
      });
    }

    if (existing && existing.length > 0) {
      return new Response("Digest already exists", { status: 200 });
    }

    let inserted = 0;

    // 2) Buscar e inserir (1 linha por notícia)
    for (const category of CATEGORIES) {
      const url =
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(category)}` +
        `&lang=pt&country=br&max=5&apikey=${GNEWS_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) {
        console.error("GNews fetch failed:", category, response.status);
        continue;
      }

      const json = await response.json();
      const articles = json.articles ?? [];

      for (const a of articles) {
        const payload = {
          date: today,
          source: a.source?.name ?? "GNews",
          title: a.title ?? "",
          summary_free: a.description ?? "",
          summary_pro: null,
        };

        const { error: insErr } = await supabase
          .from("daily_news_digest")
          .insert(payload);

        if (insErr) {
          console.error("Insert error:", insErr);
          continue;
        }

        inserted++;
      }
    }

    console.log("Inserted rows:", inserted);

    return new Response(`Daily news digest created. Inserted: ${inserted}`, {
      status: 201,
    });
  } catch (err) {
    console.error("Fatal error:", err);
    return new Response("Fatal error", { status: 500 });
  }
});
