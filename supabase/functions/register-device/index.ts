import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

type Body = {
  expoPushToken?: string;
  deviceId?: string;
  platform?: string;
  appVersion?: string;
  model?: string;
};

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response("Missing Authorization Bearer token", { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Body;

    const expoPushToken = (body.expoPushToken || "").trim();
    if (!expoPushToken) {
      return new Response("Missing expoPushToken", { status: 400 });
    }

    // Upsert por user_id (exige unique index em user_id)
    const payload = {
      user_id: user.id,
      expo_push_token: expoPushToken,
      device_id: body.deviceId ?? null,
      platform: body.platform ?? null,
      app_version: body.appVersion ?? null,
      model: body.model ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from("user_devices")
      .upsert(payload, { onConflict: "user_id" });

    if (upsertErr) {
      console.error("Upsert error:", upsertErr);
      return new Response(`Upsert error: ${upsertErr.message}`, { status: 500 });
    }

    return new Response("Device registered", { status: 200 });
  } catch (err) {
    console.error("Fatal:", err);
    return new Response("Fatal error", { status: 500 });
  }
});
