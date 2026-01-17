import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import Parser from "https://esm.sh/rss-parser";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const parser = new Parser();

serve(async () => {
  const { data: sources } = await supabase
    .from("insight_sources")
    .select("*")
    .eq("is_active", true);

  if (!sources) {
    return new Response("No sources", { status: 200 });
  }

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.rss_url);

      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        await supabase.from("insight_items").insert({
          source_id: source.id,
          title: item.title,
          summary: item.contentSnippet ?? "",
          link: item.link,
          image_url:
            item.enclosure?.url ??
            item.media?.thumbnail?.url ??
            null,
          published_at: item.pubDate
            ? new Date(item.pubDate)
            : new Date(),
          category: source.category_default,
        }).onConflict("link").ignore();
      }
    } catch (e) {
      console.error("RSS ERROR:", source.name, e);
    }
  }

  return new Response("OK");
});
