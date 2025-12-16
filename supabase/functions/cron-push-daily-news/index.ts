import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as Notifications from "https://esm.sh/expo-server-sdk@3";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const expo = new Notifications.Expo();

serve(async () => {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const hhmm = now.toISOString().slice(11, 16); // UTC

  // 1️⃣ Buscar usuários elegíveis
  const { data: users } = await supabase
    .from("user_settings")
    .select(`
      user_id,
      notification_time,
      notifications_enabled,
      silent_mode,
      user_devices ( expo_push_token )
    `)
    .eq("notifications_enabled", true)
    .eq("silent_mode", false);

  if (!users || users.length === 0) {
    return new Response("No users eligible", { status: 200 });
  }

  // 2️⃣ Buscar notícias do dia
  const { data: news } = await supabase
    .from("daily_news_digest")
    .select("title, summary_free")
    .eq("date", today)
    .limit(3);

  if (!news || news.length === 0) {
    return new Response("No news today", { status: 200 });
  }

  const top = news[0];

  const messages: Notifications.ExpoPushMessage[] = [];

  // 3️⃣ Montar pushes
  for (const u of users) {
    const time = u.notification_time ?? "09:00";
    if (time !== hhmm) continue;

    const token = u.user_devices?.[0]?.expo_push_token;
    if (!token || !Notifications.Expo.isExpoPushToken(token)) continue;

    messages.push({
      to: token,
      title: "As notícias que importam hoje",
      body: top.title,
      sound: "default",
      data: {
        type: "daily_news",
        date: today,
      },
    });
  }

  if (messages.length === 0) {
    return new Response("No messages to send", { status: 200 });
  }

  // 4️⃣ Enviar
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }

  return new Response(`Sent ${messages.length} notifications`, {
    status: 200,
  });
});
