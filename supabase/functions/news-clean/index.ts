import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");

  if (!target) {
    return new Response(
      JSON.stringify({ ok: false, error: "missing url" }),
      { status: 400 }
    );
  }

  // API externa leve, sem skypack, sem modules pesados
  const mercuryURL =
    "https://mercury-parser-api.vercel.app/api?url=" +
    encodeURIComponent(target);

  try {
    const r = await fetch(mercuryURL);
    const data = await r.json();

    if (!data || !data.content) {
      return new Response(
        JSON.stringify({ ok: false, error: "no content extracted" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        title: data.title,
        excerpt: data.excerpt,
        html: data.content,
        text: data.content.replace(/<[^>]+>/g, ""),
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e.message }),
      { status: 500 }
    );
  }
});
