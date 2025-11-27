// services/pila.ts
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

export type PilaMessageRole = "user" | "assistant";

export type PilaMessage = {
  id: string;
  user_id: string;
  role: PilaMessageRole;
  content: string;
  meta?: any;
  created_at: string;
};

// util simples p/ id local
function generateLocalId() {
  return `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

/* ============================================
   CARREGAR MENSAGENS
============================================ */
export async function getPilaMessages(userId: string): Promise<PilaMessage[]> {
  const { data, error } = await supabase
    .from("pila_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).reverse();
}

/* ============================================
   SALVAR MENSAGEM
============================================ */
export async function savePilaMessage(params: {
  userId: string;
  role: PilaMessageRole;
  content: string;
  meta?: any;
}) {
  const { userId, role, content, meta } = params;

  const { data, error } = await supabase
    .from("pila_messages")
    .insert({
      user_id: userId,
      role,
      content,
      meta: meta ?? {},
    })
    .select()
    .single();

  if (error) throw error;
  return data as PilaMessage;
}

/* ============================================
   MOCK DE IA LOCAL (SEM API REAL)
============================================ */
function mockPilaResponse(text: string) {
  return `(resposta mockada)\n\nVocê disse: "${text}".\nQuando você conectar sua API real, isso será substituído.`;
}

/* ============================================
   RESPOSTA PARA TEXTO (placeholder)
============================================ */
export async function requestPilaResponse(params: {
  session: Session;
  messages: { role: PilaMessageRole; content: string }[];
}): Promise<string> {
  const last = params.messages[params.messages.length - 1]?.content ?? "";

  // MOCK local até conectar API real
  return mockPilaResponse(last);
}

/* ============================================
   RESPOSTA PARA TRANSCRIÇÃO DE ÁUDIO
   (placeholder, igual ao de texto)
============================================ */
export async function requestPilaResponseFromVoice(params: {
  session: Session;
  text: string;
}): Promise<string> {
  // MOCK local
  return mockPilaResponse(params.text);
}

/* ============================================
   MENSAGEM LOCAL (otimista)
============================================ */
export function createLocalMessage(params: {
  role: PilaMessageRole;
  content: string;
  userId: string;
}): PilaMessage {
  return {
    id: generateLocalId(),
    user_id: params.userId,
    role: params.role,
    content: params.content,
    meta: { local: true },
    created_at: new Date().toISOString(),
  };
}
