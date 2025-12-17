import { supabase } from "@/lib/supabase";
import { TERMS_VERSION, PRIVACY_VERSION } from "@/lib/legalVersions";

export async function syncLegalAcceptance(userId: string) {
  // registra a versão atual sempre (idempotente pela unique key)
  // se o usuário já aceitou via register UI, garantimos no backend quando houver sessão.
  const rows = [
    { user_id: userId, doc_type: "terms", version: TERMS_VERSION, metadata: { source: "bootstrap" } },
    { user_id: userId, doc_type: "privacy", version: PRIVACY_VERSION, metadata: { source: "bootstrap" } },
  ];

  // Upsert "manual": como a policy permite INSERT e o índice é unique,
  // inserir duplicado pode dar erro. Então tentamos inserir e ignoramos conflito via select prévio.
  // Estratégia segura e simples: insert um por um com check antes.
  for (const r of rows) {
    const { data: existing, error: selErr } = await supabase
      .from("user_legal_acceptances")
      .select("id")
      .eq("user_id", userId)
      .eq("doc_type", r.doc_type)
      .eq("version", r.version)
      .maybeSingle();

    if (selErr) continue;
    if (existing?.id) continue;

    await supabase.from("user_legal_acceptances").insert(r);
  }
}
