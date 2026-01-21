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
  const projectId =
    (Constants.expoConfig as any)?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId ??
    null;

  console.log("[push][eas] projectId:", projectId);
  return projectId;
}

/**
 * -----------------------------------------------------
 * Registro de dispositivo para Push Notifications
 * -----------------------------------------------------
 */
export async function registerDeviceForPush(): Promise<{
  ok: boolean;
  reason?: string;
}> {
  console.log("🚀 [push] registerDeviceForPush CALLED");

  try {
    // 1️⃣ Device físico
    console.log("[push][1] isDevice:", Constants.isDevice);

    if (!Constants.isDevice) {
      console.warn("[push][1] abort: not physical device");
      return { ok: false, reason: "Not a physical device" };
    }

    // 2️⃣ Sessão
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("[push][2] session error:", error.message);
      return { ok: false, reason: "Session error" };
    }

    const session = data.session;
    console.log("[push][2] has session:", !!session);
    console.log(
      "[push][2] has access token:",
      !!session?.access_token
    );

    if (!session?.access_token) {
      console.warn("[push][2] abort: no authenticated session");
      return { ok: false, reason: "No authenticated session" };
    }

    // 3️⃣ Permissões
    const perms = await Notifications.getPermissionsAsync();
    let status = perms.status;

    console.log("[push][3] permission status (initial):", status);

    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
      console.log(
        "[push][3] permission status (after request):",
        status
      );
    }

    if (status !== "granted") {
      console.warn("[push][3] abort: permission not granted");
      return { ok: false, reason: "Push permission not granted" };
    }

    // 4️⃣ Android channel
    if (Platform.OS === "android") {
      console.log("[push][4] setting android channel");
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // 5️⃣ Project ID (EAS)
    const projectId = getEasProjectId();

    if (!projectId) {
      console.error("[push][5] abort: missing EAS projectId");
      return {
        ok: false,
        reason:
          "Missing EAS projectId (extra.eas.projectId not found)",
      };
    }

    // 6️⃣ Expo Push Token
    const tokenResponse =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    const expoPushToken = tokenResponse.data;
    console.log("[push][6] expoPushToken:", expoPushToken);

    if (!expoPushToken) {
      console.error("[push][6] abort: token generation failed");
      return { ok: false, reason: "Failed to generate token" };
    }

    // 7️⃣ Envio para backend
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    console.log("[push][7] supabaseUrl:", supabaseUrl);

    if (!supabaseUrl) {
      console.error("[push][7] abort: missing supabase url");
      return { ok: false, reason: "Missing Supabase URL" };
    }

    const endpoint = `${supabaseUrl}/functions/v1/register-device`;
    console.log("[push][7] POST →", endpoint);

    const payload = {
      expoPushToken,
      platform: Platform.OS,
      deviceId: Constants.deviceName ?? null,
      appVersion: Constants.expoConfig?.version ?? null,
    };

    console.log("[push][7] payload:", payload);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("[push][7] backend status:", res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[push][7] backend error:", text);
      return {
        ok: false,
        reason: `Backend error: ${res.status} ${text}`,
      };
    }

    console.log("✅ [push] device registered successfully");
    return { ok: true };
  } catch (e: any) {
    console.error("🔥 [push] fatal error:", e);
    return {
      ok: false,
      reason: e?.message ?? "Unknown error",
    };
  }
}
