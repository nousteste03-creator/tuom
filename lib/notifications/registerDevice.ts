import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

/**
 * -----------------------------------------------------
 * Helper — obtém projectId do EAS
 * -----------------------------------------------------
 */
function getEasProjectId(): string | null {
  const easFromConfig =
    (Constants.expoConfig as any)?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId ??
    null;

  return easFromConfig;
}

/**
 * -----------------------------------------------------
 * Registro de dispositivo para Push Notifications
 *
 * Fluxo:
 * 1. Verifica device físico
 * 2. Verifica sessão autenticada
 * 3. Solicita permissão de push
 * 4. Gera ExpoPushToken
 * 5. Envia para Edge Function register-device
 *
 * ⚠️ Logs TEMPORÁRIOS para debug
 * -----------------------------------------------------
 */
export async function registerDeviceForPush(): Promise<{
  ok: boolean;
  reason?: string;
}> {
  try {
    console.log("[push] starting registerDeviceForPush");

    // 1️⃣ Device físico
    const isDevice = Constants.isDevice;
    console.log("[push] isDevice:", isDevice);

    if (!isDevice) {
      console.warn("[push] aborted: not a physical device");
      return { ok: false, reason: "Not a physical device" };
    }

    // 2️⃣ Sessão
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("[push] session error:", sessionError.message);
      return { ok: false, reason: "Session error" };
    }

    const accessToken = sessionData.session?.access_token;
    console.log("[push] accessToken exists:", !!accessToken);

    if (!accessToken) {
      console.warn("[push] aborted: no authenticated session");
      return { ok: false, reason: "No session (user not authenticated)" };
    }

    // 3️⃣ Permissões
    const perms = await Notifications.getPermissionsAsync();
    let status = perms.status;
    console.log("[push] permission status (initial):", status);

    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
      console.log("[push] permission status (after request):", status);
    }

    if (status !== "granted") {
      console.warn("[push] aborted: permission not granted");
      return { ok: false, reason: "Push permission not granted" };
    }

    // 4️⃣ Project ID (EAS)
    const projectId = getEasProjectId();
    console.log("[push] eas projectId:", projectId);

    if (!projectId) {
      console.error("[push] aborted: missing EAS projectId");
      return {
        ok: false,
        reason:
          "Missing EAS projectId (add extra.eas.projectId in app config)",
      };
    }

    // 5️⃣ Expo Push Token
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    const expoPushToken = token.data;

    console.log("[push] expoPushToken:", expoPushToken);

    if (!expoPushToken) {
      console.error("[push] aborted: token generation failed");
      return { ok: false, reason: "Failed to generate ExpoPushToken" };
    }

    // 6️⃣ Envio para Edge Function
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    console.log("[push] supabase url:", supabaseUrl);

    if (!supabaseUrl) {
      console.error("[push] aborted: missing EXPO_PUBLIC_SUPABASE_URL");
      return { ok: false, reason: "Missing EXPO_PUBLIC_SUPABASE_URL" };
    }

    const url = `${supabaseUrl}/functions/v1/register-device`;
    console.log("[push] register-device url:", url);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expoPushToken,
        platform: Platform.OS,
        deviceId: Constants.deviceId ?? null,
        appVersion: Constants.expoConfig?.version ?? null,
        model: (Constants as any)?.deviceName ?? null,
      }),
    });

    console.log("[push] backend response status:", res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[push] backend error:", text);
      return { ok: false, reason: `Backend error: ${res.status} ${text}` };
    }

    console.log("[push] device registered successfully");
    return { ok: true };
  } catch (e: any) {
    console.error("[push] fatal error:", e);
    return { ok: false, reason: e?.message ?? "Unknown error" };
  }
}
