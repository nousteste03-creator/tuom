import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Subscription } from "@/types/subscriptions";

// Handler global – define como a notificação aparece no app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === "granted") {
    return true;
  }

  const { status: newStatus } = await Notifications.requestPermissionsAsync();

  return newStatus === "granted";
}

// Teste simples: dispara uma notificação em 5 segundos
export async function scheduleTestNotification() {
  const granted = await requestNotificationPermission();
  if (!granted) {
    console.log("Permissão de notificação negada.");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Teste de alerta",
      body: "Notificações locais estão funcionando.",
    },
    trigger: {
      seconds: 5,
    },
  });

  console.log("Notificação de teste agendada para daqui 5 segundos.");
}

// Agendar alertas para uma assinatura específica
// - 3 dias antes
// - no dia do vencimento
export async function scheduleSubscriptionAlerts(subscription: Subscription) {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  if (!subscription.next_billing) return;

  const billingDate = new Date(subscription.next_billing);
  if (Number.isNaN(billingDate.getTime())) return;

  // Notificação no dia
  const triggerOnDay =
    Platform.OS === "ios" || Platform.OS === "android"
      ? billingDate
      : { seconds: 5 }; // fallback web/dev

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Vencimento: ${subscription.service}`,
      body: `Sua assinatura de ${subscription.service} vence hoje.`,
    },
    trigger: triggerOnDay,
  });

  // 3 dias antes
  const threeDaysBefore = new Date(
    billingDate.getTime() - 3 * 24 * 60 * 60 * 1000
  );

  // se já passou, não agenda
  if (threeDaysBefore.getTime() > Date.now()) {
    const trigger3Days =
      Platform.OS === "ios" || Platform.OS === "android"
        ? threeDaysBefore
        : { seconds: 5 };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Faltam 3 dias: ${subscription.service}`,
        body: `Sua assinatura de ${subscription.service} vence em 3 dias.`,
      },
      trigger: trigger3Days,
    });
  }
}
