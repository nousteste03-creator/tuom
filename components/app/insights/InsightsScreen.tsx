import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useNews } from "@/hooks/useNews";
import { useMarket } from "@/hooks/useMarket";
import type { RemoteNewsItem } from "@/lib/api/news";

import {
  computeNewsSentiment,
  formatSentimentScore,
} from "@/lib/analytics/sentiment";

/* -------------------------------------------------
   HERO — 7 frases
--------------------------------------------------- */
const HERO_MESSAGES = [
  {
    title: "O hábito que aumenta suas despesas sem você ver.",
    body: "Seu cérebro normaliza assinaturas. A Pila te mostra como quebrar esse padrão.",
  },
  {
    title: "Por que você vive sentindo que 'ganha e desaparece'?",
    body: "Seu dinheiro não some. Ele está sendo distribuído sem consciência. Hoje você vai enxergar claramente.",
  },
  {
    title: "Como o emocional te faz gastar 22% a mais toda semana.",
    body: "Existem gatilhos de consumo invisíveis. A Pila te ajuda a neutralizar um por um.",
  },
  {
    title: "Você não gasta demais. Você gasta sem ver.",
    body: "O segredo não é cortar tudo — é controlar o que passa despercebido.",
  },
  {
    title: "A assinatura silenciosa que custa mais que seu aluguel.",
    body: "Alguns hábitos custam caro porque se repetem, não porque são grandes.",
  },
  {
    title: "O sistema foi feito para você não perceber.",
    body: "Mas você está assumindo o controle aos poucos. Continue.",
  },
];
const heroIndex = new Date().getDay() % HERO_MESSAGES.length;
const hero = HERO_MESSAGES[heroIndex];

/* -------------------------------------------------
   TENDÊNCIAS — AGORA COM QUERIES REAIS
--------------------------------------------------- */
const TREND_CATEGORIES = [
  {
    id: "ai",
    title: "IA — Mundo",
    query: `"inteligência artificial" OR "AI"`,
  },
  {
    id: "startups",
    title: "Startups — Mundo",
    query: `"startup" OR "startups"`,
  },
  {
    id: "economy",
    title: "Economia — Mundo",
    query: `"economia" OR "economy"`,
  },
  {
    id: "tech",
    title: "Tecnologia — Mundo",
    query: `"tecnologia" OR "technology"`,
  },
];

/* -------------------------------------------------
   MINI TENDÊNCIA
--------------------------------------------------- */
function getTrendLabel(change: number) {
  if (change > 0.5) return "↑ em alta";
  if (change < -0.5) return "↓ em baixa";
  return "~ estável";
}

/* -------------------------------------------------
   SCREEN
--------------------------------------------------- */
export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const isPro = false;

  const [openedNewsCount, setOpenedNewsCount] = useState(0);
  const [openedTrendCount, setOpenedTrendCount] = useState(0);

  /* NEWS — AGORA COM QUERIES NOVAS */
  const { news: mainNews, loading: loadingMain } = useNews("finance");

  const { news: aiNews } = useNews(TREND_CATEGORIES[0].query);
  const { news: startupsNews } = useNews(TREND_CATEGORIES[1].query);
  const { news: economyNews } = useNews(TREND_CATEGORIES[2].query);
  const { news: techNews } = useNews(TREND_CATEGORIES[3].query);

  const trendNewsMap: Record<string, RemoteNewsItem[]> = {
    ai: aiNews,
    startups: startupsNews,
    economy: economyNews,
    tech: techNews,
  };

  /* MERCADO */
  const { crypto, stocks, loading: loadingMarket } = useMarket();

  /* OPEN NEWS */
  function handleOpenNews(item: RemoteNewsItem) {
    if (!isPro && openedNewsCount >= 3) {
      Alert.alert("Limite diário", "Você já leu 3 notícias hoje.");
      return;
    }

    setOpenedNewsCount((x) => x + 1);

    router.push({
      pathname: "/insights/news/[id]",
      params: {
        id: encodeURIComponent(item.id),
        title: item.title,
        source: item.source ?? "",
        publishedAt: item.publishedAt ?? "",
        imageUrl: item.imageUrl ?? "",
        url: item.id,
      },
    });
  }

  /* OPEN TREND */
  function handleOpenTrend(categoryId: string, title: string) {
    if (!isPro && openedTrendCount >= 1) {
      Alert.alert("Tendência limitada", "Assine o Pro para liberar todas.");
      return;
    }

    setOpenedTrendCount((x) => x + 1);

    router.push({
      pathname: "/insights/trend/[category]",
      params: { category: categoryId, title },
    });
  }

  /* -------------------------------------------------
     RENDER
  --------------------------------------------------- */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 8 },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
          <Text style={styles.headerSubtitle}>
            Continue lendo insights que realmente importam.
          </Text>
        </View>

        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Insight do dia</Text>
            <Text style={styles.heroTitle}>{hero.title}</Text>
            <Text style={styles.heroBody}>{hero.body}</Text>
          </View>
        </View>

        {/* HOJE NO MUNDO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoje no mundo</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loadingMain && (
              <Text style={styles.loadingText}>Carregando notícias...</Text>
            )}

            {!loadingMain &&
              mainNews.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleOpenNews(item)}
                  activeOpacity={0.85}
                  style={styles.newsCard}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.newsImage}
                    />
                  ) : (
                    <View style={styles.noImage} />
                  )}

                  <View style={styles.newsHeaderRow}>
                    <Text style={styles.newsSource}>{item.source}</Text>
                    {typeof item.minutesAgo === "number" && (
                      <Text style={styles.newsTime}>
                        {item.minutesAgo}min
                      </Text>
                    )}
                  </View>

                  <Text style={styles.newsTitle} numberOfLines={3}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {/* TENDÊNCIAS QUE IMPORTAM */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tendências que importam</Text>

          <View style={styles.trendsGrid}>
            {TREND_CATEGORIES.map((cat) => {
              const items = trendNewsMap[cat.id] || [];
              const sentiment = computeNewsSentiment(items);
              const scoreText = formatSentimentScore(sentiment);

              const locked = !isPro && openedTrendCount >= 1;

              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={locked ? 1 : 0.85}
                  onPress={() =>
                    locked
                      ? Alert.alert("Tendência limitada", "Assine o Pro.")
                      : handleOpenTrend(cat.id, cat.title)
                  }
                  style={[
                    styles.trendCard,
                    locked && styles.trendCardLocked,
                  ]}
                >
                  <Text style={styles.trendTitle}>{cat.title}</Text>
                  <Text style={styles.trendSubtitle}>
                    {items.length === 0
                      ? "Analisando..."
                      : `${scoreText} • ${sentiment.label}`}
                  </Text>
                  <View style={styles.sentimentDot} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* MERCADO AGORA */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Mercado agora</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.marketSeeMoreRow}
              onPress={() => router.push("/market")}
            >
              <Text style={styles.marketSeeMoreText}>
                Ver mercado completo
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#8A8FFF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.marketCard}>
            {loadingMarket ? (
              <Text style={styles.loadingText}>Carregando mercado...</Text>
            ) : (
              <>
                {/* CRIPTO */}
                <Text style={styles.subSectionTitle}>Criptos principais</Text>

                {crypto.slice(0, 3).map((c) => {
                  const isPositive = c.change24h >= 0;
                  const trendLabel = getTrendLabel(c.change24h);

                  return (
                    <View key={c.id} style={styles.assetRow}>
                      <View style={styles.assetLeft}>
                        <View style={styles.assetIcon}>
                          <Text style={styles.assetIconText}>
                            {c.symbol.toUpperCase().slice(0, 3)}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.assetName}>{c.name}</Text>
                          <Text style={styles.assetSymbol}>
                            {c.symbol.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.assetRight}>
                        <Text
                          style={[
                            styles.assetChange,
                            isPositive ? styles.positive : styles.negative,
                          ]}
                        >
                          {isPositive ? "+" : ""}
                          {c.change24h.toFixed(2)}%
                        </Text>
                        <Text style={styles.assetTrend}>{trendLabel}</Text>
                      </View>
                    </View>
                  );
                })}

                {/* STOCKS */}
                <Text style={[styles.subSectionTitle, { marginTop: 18 }]}>
                  Ações globais
                </Text>

                {stocks.slice(0, 3).map((s) => {
                  const isPositive = s.change >= 0;
                  const trendLabel = getTrendLabel(s.change);

                  return (
                    <View key={s.symbol} style={styles.assetRow}>
                      <View style={styles.assetLeft}>
                        <View style={styles.assetIcon}>
                          <Text style={styles.assetIconText}>
                            {s.symbol.toUpperCase().slice(0, 3)}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.assetName}>{s.name}</Text>
                          <Text style={styles.assetSymbol}>
                            {s.symbol.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.assetRight}>
                        <Text
                          style={[
                            styles.assetChange,
                            isPositive ? styles.positive : styles.negative,
                          ]}
                        >
                          {isPositive ? "+" : ""}
                          {s.change.toFixed(2)}%
                        </Text>
                        <Text style={styles.assetTrend}>{trendLabel}</Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------
   STYLES — GLASS APPLE
--------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050507" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  header: { alignItems: "center", marginBottom: 22 },
  headerTitle: { fontSize: 28, color: "#FFF", fontWeight: "700" },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
    textAlign: "center",
  },

  heroCard: {
    height: 160,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,5,7,0.45)",
  },
  heroContent: { padding: 18 },
  heroLabel: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  heroTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 6,
  },
  heroBody: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },

  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 12,
  },

  newsCard: {
    width: 260,
    marginRight: 12,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  newsImage: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    marginBottom: 10,
  },
  noImage: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  newsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  newsSource: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  newsTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  newsTitle: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
  },

  trendsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  trendCard: {
    flexBasis: "48%",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  trendCardLocked: { opacity: 0.4 },
  trendTitle: { fontSize: 15, color: "#FFF", fontWeight: "600" },
  trendSubtitle: {
    fontSize: 12,
    marginTop: 6,
    color: "rgba(255,255,255,0.6)",
  },
  sentimentDot: {
    width: 14,
    height: 14,
    marginTop: 10,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  marketSeeMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  marketSeeMoreText: {
    color: "#8A8FFF",
    fontSize: 12,
  },
  marketCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  subSectionTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },

  assetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  assetIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  assetIconText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 13,
  },
  assetName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  assetSymbol: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
  },

  assetRight: {
    alignItems: "flex-end",
  },
  assetChange: {
    fontSize: 14,
    fontWeight: "600",
  },
  assetTrend: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  loadingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginTop: 4,
  },

  positive: { color: "#4ECB71" },
  negative: { color: "#FF5C5C" },
});
