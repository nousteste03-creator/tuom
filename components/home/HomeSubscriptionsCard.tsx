import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import Icon from "@/components/ui/Icon";
import { useSubscriptions } from "@/hooks/useSubscriptions";

/* -------------------------------------------------------
   HELPERS
-------------------------------------------------------- */
function normalizeServiceName(name?: string) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/* -------------------------------------------------------
   ICON MAP — ASSINATURAS (URL COMPLETO)
   usando links do Simple Icons CDN
-------------------------------------------------------- */
const subscriptionIcons: Record<string, string> = {
  // STREAMING
  netflix: "https://cdn.simpleicons.org/netflix",
  prime_video: "https://cdn.simpleicons.org/amazonprime",
  disney_plus: "https://cdn.simpleicons.org/disney",
  hbo_max: "https://cdn.simpleicons.org/hbo",
  paramount: "https://cdn.simpleicons.org/paramount",
  star_plus: "https://cdn.simpleicons.org/star",
  crunchyroll: "https://cdn.simpleicons.org/crunchyroll",
  globoplay: "https://cdn.simpleicons.org/globoplay",
  lionsgate: "https://cdn.simpleicons.org/lionsgate",
  ngu: "",

  // MÚSICA
  spotify: "https://cdn.simpleicons.org/spotify",
  apple_music: "https://cdn.simpleicons.org/apple",
  deezer: "https://cdn.simpleicons.org/deezer",
  youtube_premium: "https://cdn.simpleicons.org/youtube",

  // CLOUD
  icloud: "https://cdn.simpleicons.org/icloud",
  google_one: "https://cdn.simpleicons.org/google",
  onedrive: "https://cdn.simpleicons.org/microsoftonedrive",
  dropbox: "https://cdn.simpleicons.org/dropbox",
  mega: "https://cdn.simpleicons.org/mega",

  // JOGOS
  ps_plus: "https://cdn.simpleicons.org/playstation",
  xbox_game_pass: "https://cdn.simpleicons.org/xbox",
  nintendo_online: "https://cdn.simpleicons.org/nintendo",
  ea_play: "https://cdn.simpleicons.org/electronicarts",
  riot_pass: "",
  epic_pass: "",

  // PRODUTIVIDADE
  notion: "https://cdn.simpleicons.org/notion",
  todoist: "https://cdn.simpleicons.org/todoist",
  evernote: "https://cdn.simpleicons.org/evernote",
  microsoft_365: "https://cdn.simpleicons.org/microsoft",
  adobe_cc: "https://cdn.simpleicons.org/adobe",
  canva: "https://cdn.simpleicons.org/canva",

  // DESIGN
  figma: "https://cdn.simpleicons.org/figma",
  sketch: "",
  procreate: "",

  // IA / TECH
  chatgpt_plus: "https://cdn.simpleicons.org/openai",
  claude_pro: "",
  midjourney: "",
  copilot: "https://cdn.simpleicons.org/github",
  runway: "",
  perplexity: "",

  // FINTECH
  nomad: "",
  wise: "",
  revolut: "https://cdn.simpleicons.org/revolut",
  inter: "",
  nubank_ultra: "https://cdn.simpleicons.org/nubank",

  // EDUCAÇÃO
  duolingo: "https://cdn.simpleicons.org/duolingo",
  alura: "",
  udemy: "https://cdn.simpleicons.org/udemy",
  coursera: "https://cdn.simpleicons.org/coursera",
  skillshare: "",

  // FITNESS / SAÚDE
  apple_fitness: "",
  strava: "https://cdn.simpleicons.org/strava",
  calm: "",
  headspace: "",

  // VPN / SEGURANÇA
  vpn_express: "",
  vpn_nord: "",
  "1password": "",
  bitwarden: "",

  // OUTROS / CLOUD / TECH
  aws: "https://cdn.simpleicons.org/amazonaws",
  vercel: "https://cdn.simpleicons.org/vercel",
};

/* -------------------------------------------------------
   COMPONENT
-------------------------------------------------------- */
export default function HomeSubscriptionsCard() {
  const router = useRouter();
  const { monthlyTotal = 0, subscriptions = [] } = useSubscriptions();

  const MAX_ICONS = 4;
  const visibleIcons = subscriptions.slice(0, MAX_ICONS);
  const remaining = Math.max(subscriptions.length - MAX_ICONS, 0);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/subscriptions")}
      style={{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        justifyContent: "space-between",
      }}
    >
      {/* ================= HEADER ================= */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="repeat" size={16} color="#9CA3AF" />
        <Text style={{ color: "#9CA3AF", fontSize: 13, fontWeight: "500" }}>
          Assinaturas
        </Text>
      </View>

      {/* ================= ICONS ================= */}
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        {visibleIcons.map((s, index) => {
          const key = normalizeServiceName(s.service);
          const iconUrl = subscriptionIcons[key];

          return (
            <View
              key={s.id ?? `${key}-${index}`}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: index === 0 ? 0 : -10,
                overflow: "hidden",
              }}
            >
              {iconUrl ? (
                <Image
                  source={{ uri: iconUrl }}
                  style={{ width: 18, height: 18 }}
                  resizeMode="contain"
                />
              ) : (
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {s.service?.[0]?.toUpperCase() ?? "•"}
                </Text>
              )}
            </View>
          );
        })}

        {remaining > 0 && (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.06)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: -10,
            }}
          >
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              +{remaining}
            </Text>
          </View>
        )}
      </View>

      {/* ================= VALUE ================= */}
      <View>
        <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>
          R$ {monthlyTotal.toFixed(2)}
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>
          {subscriptions.length} serviços ativos
        </Text>
      </View>
    </TouchableOpacity>
  );
}
