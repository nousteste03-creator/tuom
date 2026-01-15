// File: supabase/functions/whatsapp-webhook/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Função interna para parsear gastos do WhatsApp
function parseExpense(text: string) {
  const regex = /(\d{1,3}(?:[\.,]\d{1,2})?)\s*(?:no|na)?\s*(.+?)\s*(ontem|hoje)?$/i;
  const match = text.match(regex);
  if (!match) return null;

  let [_, amountStr, description, dateStr] = match;
  const amount = parseFloat(amountStr.replace(",", "."));
  if (isNaN(amount)) return null;

  const today = new Date();
  let expense_date = today.toISOString().split("T")[0];
  if (dateStr) {
    if (/ontem/i.test(dateStr)) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      expense_date = d.toISOString().split("T")[0];
    } else if (/hoje/i.test(dateStr)) {
      expense_date = today.toISOString().split("T")[0];
    }
  }

  return { amount, description: description.trim(), expense_date };
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("ok", { status: 200 });

    const payload = await req.json();
    const phone = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
    const text = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body?.trim();
    if (!phone || !text) return new Response("ok", { status: 200 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ──────────── FASE 1: Verificar pareamento ────────────
    const { data: link } = await supabase
      .from("whatsapp_links")
      .select("user_id")
      .eq("phone_number", phone)
      .eq("is_active", false)
      .maybeSingle();

    if (!link) return new Response("ok", { status: 200 });

    // ──────────── COMANDOS ESPECIAIS ────────────
    const lower = text.toLowerCase();

    // 1️⃣ desfazer último gasto
    if (/desfazer último/i.test(lower)) {
      const { data: lastExpense } = await supabase
        .from("expenses")
        .select("id")
        .eq("user_id", link.user_id)
        .eq("source", "whatsapp")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastExpense) {
        await supabase.from("expenses").delete().eq("id", lastExpense.id);
        await supabase.from("bot_events").insert({
          user_id: link.user_id,
          phone_number: phone,
          event_type: "expense_undo",
        });
      }
      return new Response("Último gasto removido ✅", { status: 200 });
    }

    // 2️⃣ alterar categoria
    if (/alterar categoria/i.test(lower)) {
      const match = text.match(/alterar categoria (?:do último gasto )?(?:para )?(.+)/i);
      if (match?.[1]) {
        const newCatName = match[1].trim();

        // pegar último gasto
        const { data: lastExpense } = await supabase
          .from("expenses")
          .select("id, description")
          .eq("user_id", link.user_id)
          .eq("source", "whatsapp")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastExpense) {
          // buscar ou criar categoria
          let categoryId: string | null = null;
          const { data: existingCategory } = await supabase
            .from("categories")
            .select("id")
            .eq("user_id", link.user_id)
            .eq("name", newCatName)
            .maybeSingle();

          if (existingCategory) categoryId = existingCategory.id;
          else {
            const { data: newCategory } = await supabase
              .from("categories")
              .insert({ user_id: link.user_id, name: newCatName })
              .select("id")
              .single();
            categoryId = newCategory?.id ?? null;
          }

          // atualizar gasto
          await supabase.from("expenses").update({ category_id: categoryId }).eq("id", lastExpense.id);

          await supabase.from("bot_events").insert({
            user_id: link.user_id,
            phone_number: phone,
            event_type: "expense_category_change",
          });

          return new Response(`Categoria do gasto "${lastExpense.description}" alterada para ${newCatName} ✅`, { status: 200 });
        }
      }
      return new Response("Não foi possível alterar a categoria ❌", { status: 200 });
    }

    // ──────────── FASE 2/3: parse de gasto ────────────
    let parsed = null;
    try { parsed = parseExpense(text); } catch { parsed = null; }
    if (!parsed) return new Response("ok", { status: 200 });

    // resolver categoria
    let categoryId: string | null = null;
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", link.user_id)
      .eq("name", parsed.description)
      .maybeSingle();

    if (existingCategory) categoryId = existingCategory.id;
    else {
      const { data: newCategory } = await supabase
        .from("categories")
        .insert({ user_id: link.user_id, name: parsed.description })
        .select("id")
        .single();
      categoryId = newCategory?.id ?? null;
    }

    // criar gasto
    await supabase.from("expenses").insert({
      user_id: link.user_id,
      category_id: categoryId,
      amount: parsed.amount,
      description: parsed.description,
      expense_date: parsed.expense_date,
      source: "whatsapp",
    });

    // log interno
    await supabase.from("bot_events").insert({
      user_id: link.user_id,
      phone_number: phone,
      event_type: "expense_created",
    });

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("ok", { status: 200 });
  }
});
