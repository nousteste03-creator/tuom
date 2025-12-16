import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

export async function registerDeviceForPush(userId: string) {
  // 1. Permissão
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return { ok: false, reason: "permission_denied" };
  }

  // 2. Token
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = tokenData.data;

  // 3. Salvar no Supabase
  const { error } = await supabase
    .from("user_devices")
    .upsert(
      {
        user_id: userId,
        expo_push_token: expoPushToken,
        platform: Platform.OS,
        last_active_at: new Date().toISOString(),
      },
      {
        onConflict: "expo_push_token",
      }
    );

  if (error) {
    console.error("Push token save error:", error);
    return { ok: false, reason: "db_error" };
  }

  return { ok: true };
}
