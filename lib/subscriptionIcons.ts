export function getSubscriptionIcon(service?: string) {
  if (!service) {
    return require("@/assets/icons/subscriptions/default.png");
  }

  const normalized = service
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

  try {
    return require(`@/assets/icons/subscriptions/${normalized}.png`);
  } catch {
    return require("@/assets/icons/subscriptions/default.png");
  }
}
