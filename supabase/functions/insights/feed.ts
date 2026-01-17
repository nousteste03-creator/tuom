import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

serve(async () => {
  const { data } = await supabase
    .from("insight_items")
    .select(`
      id,
      title,
      summary,
      link,
      image_url,
      published_at,
      category,
      insight_sources ( name )
    `)
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (data ?? []).map((i: any) => ({
    id: i.id,
    title: i.title,
    description: i.summary,
    source: i.insight_sources?.name ?? "TUÖM",
    imageUrl: i.image_url,
    url: i.link,
    publishedAt: i.published_at,
    category: i.category,
  }));

  return new Response(JSON.stringify({ items }), {
    headers: { "Content-Type": "application/json" },
  });
});
