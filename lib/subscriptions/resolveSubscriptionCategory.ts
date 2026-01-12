import { SERVICES_LIBRARY } from "@/constants/services";

/**
 * Resolve a categoria de uma assinatura com base no nome do serviço.
 * Retorna null quando não encontra correspondência.
 */
export function resolveSubscriptionCategory(
  serviceName: string
): string | null {
  if (!serviceName) return null;

  const normalized = serviceName.toLowerCase().trim();

  const match = SERVICES_LIBRARY.find((service) => {
    return (
      service.id.toLowerCase() === normalized ||
      service.name.toLowerCase() === normalized
    );
  });

  return match?.category ?? null;
}
