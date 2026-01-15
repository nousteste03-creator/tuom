import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
serve(async (req)=>{
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }
  let body;
  try {
    body = await req.json();
  } catch  {
    return new Response("Invalid JSON", {
      status: 400
    });
  }
  const user_id = body?.user_id;
  if (!user_id) {
    return new Response("Missing user_id", {
      status: 400
    });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  // 1. Desativar todos os códigos anteriores do usuário
  await supabase.from("whatsapp_links").update({
    is_active: false
  }).eq("user_id", user_id);
  // 2. Gerar novo código
  const code = `TUON-${Math.floor(100000 + Math.random() * 900000)}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  // 3. Inserir novo código
  const { error } = await supabase.from("whatsapp_links").insert({
    user_id,
    link_code: code,
    is_active: true,
    expires_at: expiresAt
  });
  if (error) {
    return new Response(error.message, {
      status: 500
    });
  }
  return new Response(JSON.stringify({
    link_code: code,
    expires_in_minutes: 10
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
});
