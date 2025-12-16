import { supabase } from "@/lib/supabase";

export async function ensureUserSettings(userId: string) {
  await supabase
    .from("user_settings")
    .upsert(
      { user_id: userId },
      { onConflict: "user_id" }
    );
}
