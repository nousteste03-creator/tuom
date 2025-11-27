// app/constants/serviceIcons.ts
export const SERVICE_ICONS: Record<string, any> = {
  // Esses três são só o começo. Só mapeie aqui o que você já tiver o PNG criado.
  netflix: require("@/assets/icons/subscriptions/netflix.png"),
  spotify: require("@/assets/icons/subscriptions/spotify.png"),
  primevideo: require("@/assets/icons/subscriptions/primevideo.png"),
  // Quando você adicionar novos PNGs, é só continuar:
  // disneyplus: require("@/assets/icons/subscriptions/disneyplus.png"),
  // youtube: require("@/assets/icons/subscriptions/youtube.png"),
  // ...
};

/**
 * Normaliza o nome do serviço para tentar bater com a chave do ícone.
 * Ex.: "Netflix", "NETFLIX", "Netflix Brasil" -> "netflix"
 */
export function getServiceIconKey(serviceName: string): string {
  if (!serviceName) return "";

  return serviceName
    .toLowerCase()
    .normalize("NFD") // remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ""); // remove espaços e símbolos
}
