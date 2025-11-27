import { supabase } from "@/lib/supabase";
import type { Subscription } from "@/types/subscriptions";

/* ============================================================
   GET USER SUBSCRIPTIONS — versão estável e segura
   ============================================================ */
export async function getUserSubscriptions() {
  // garante que o usuário esteja logado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("NO USER FOUND (getUserSubscriptions)");
    return []; // evita quebrar o app
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("LOAD SUBSCRIPTIONS ERROR:", error);
    throw error;
  }

  return data as Subscription[];
}

/* ============================================================
   ADD SUBSCRIPTION
   ============================================================ */
export async function addSubscription(payload: {
  service: string;
  price: number;
  frequency: string;
  next_billing: string;
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("Usuário não autenticado.");

  const { data, error } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id: user.id,
        ...payload,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data as Subscription;
}

/* ============================================================
   DELETE SUBSCRIPTION
   ============================================================ */
export async function deleteSubscription(id: string) {
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
