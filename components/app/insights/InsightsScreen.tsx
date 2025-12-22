import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useInsights } from "@/hooks/useInsights";

/* ---------------------------------------------------------
   Helper — formatar "1h atrás"
----------------------------------------------------------*/
function formatTimeAgo(publishedAt?: string) {
  if (!publishedAt) return "";
  const t = new Date(publishedAt).getTime();
  if (Number.isNaN(t)) return "";
  const diffMin = Math.floor((Date.now() - t) / 60000);
  if (diffMin < 60) return `${diffMin}min atrás`;
  const hours = Math.floor(diffMin / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days}d atrás`;
  const rest = diffMin % 60;
  return rest === 0 ? `${hours}h atrás` : `${hours}h${rest}min atrás`;
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { loading, insightOfDay, today, trends, events } = useInsights();

  // ESTADO DE EXPANSÃO DA TIMELINE
  const [expanded, setExpanded] = useState(false);

  // mostra 8 notícias se fechado / tudo se aberto
  const visibleEvents = expanded ? events : events.slice(0, 8);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16 },
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
            <Text style={styles.heroTitle}>{insightOfDay.title}</Text>
            <Text style={styles.heroBody}>{insightOfDay.subtitle}</Text>
          </View>
        </View>

        {/* HOJE NO MUNDO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoje no mundo</Text>

          {loading && (
            <Text style={styles.loadingText}>Carregando notícias...</Text>
          )}

          {!loading && today && today.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.todayCarousel}
            >
              {today.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  style={styles.todayCard}
                  onPress={() =>
                    router.push({
                      pathname: "/insights/news/[id]",
                      params: {
                        id: encodeURIComponent(item.id),
                        title: item.title,
                        source: item.source,
                        imageUrl: item.imageUrl,
                        url: item.url,
                        publishedAt: item.publishedAt,
                        description: item.description,
                      },
                    })
                  }
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.todayImage}
                    />
                  ) : (
                    <View style={styles.noImage} />
                  )}

                  <View style={styles.todayMetaRow}>
                    <Text style={styles.todaySource}>
                      {item.source || "TUÖM Insights"}
                    </Text>
                    <Text style={styles.todayTime}>
                      {formatTimeAgo(item.publishedAt)}
                    </Text>
                  </View>

                  <Text style={styles.todayTitle} numberOfLines={3}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* TENDÊNCIAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tendências que importam</Text>

          <View style={styles.trendsGrid}>
            {trends?.map((trend, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                style={styles.trendCard}
                onPress={() =>
                  router.push({
                    pathname: "/insights/trend/[category]",
                    params: {
                      category: encodeURIComponent(trend.category),
                    },
                  })
                }
              >
                <Text style={styles.trendTitle}>{trend.category}</Text>

                <Text style={styles.trendSubtitle}>
                  {trend.articles?.length > 0
                    ? `${trend.articles.length} artigos`
                    : "Analisando..."}
                </Text>

                <View style={styles.trendDot} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* LINHA DO TEMPO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linha do tempo do dia</Text>
          <Text style={styles.timelineSubtitle}>
            Os eventos mais importantes acontecendo agora.
          </Text>

          {visibleEvents.map((ev) => (
            <TouchableOpacity
              key={ev.id}
              activeOpacity={0.9}
              style={styles.timelineCard}
              onPress={() =>
                router.push({
                  pathname: "/insights/news/[id]",
                  params: {
                    id: encodeURIComponent(ev.id),
                    title: ev.title,
                    source: ev.source,
                    imageUrl: ev.imageUrl,
                    url: ev.url,
                    publishedAt: ev.publishedAt,
                    description: ev.description,
                  },
                })
              }
            >
              {ev.imageUrl ? (
                <Image
                  source={{ uri: ev.imageUrl }}
                  style={styles.timelineImage}
                />
              ) : (
                <View style={styles.timelineNoImage} />
              )}

              <View style={styles.timelineRight}>
                <Text style={styles.timelineTitle} numberOfLines={2}>
                  {ev.title}
                </Text>

                <View style={styles.timelineMetaRow}>
                  <Text style={styles.timelineSource}>
                    {ev.source || "TUÖM Insights"}
                  </Text>
                  <Text style={styles.timelineTime}>
                    {formatTimeAgo(ev.publishedAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* BOTÃO VER MAIS / VER MENOS */}
          {events.length > 8 && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.moreButton}
              onPress={() => setExpanded((v) => !v)}
            >
              <Text style={styles.moreButtonText}>
                {expanded ? "Ver menos" : "Ver mais"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------
   ESTILOS
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

  /* HERO */
  heroCard: {
    height: 160,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,5,7,0.55)",
  },
  heroContent: { padding: 18 },
  heroLabel: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  heroTitle: { color: "#FFF", fontSize: 18, fontWeight: "600", marginTop: 6 },
  heroBody: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },

  /* HOJE NO MUNDO */
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 12,
  },

  todayCarousel: { paddingRight: 4 },
  todayCard: {
    width: 260,
    marginRight: 14,
    padding: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  todayImage: {
    width: "100%",
    height: 140,
    borderRadius: 18,
    marginBottom: 8,
  },
  noImage: {
    width: "100%",
    height: 140,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 8,
  },
  todayMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  todaySource: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  todayTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },
  todayTitle: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
  },

  /* TENDÊNCIAS */
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
    borderColor: "rgba(255,255,255,0.08)",
  },
  trendTitle: {
    fontSize: 15,
    color: "#FFF",
    fontWeight: "600",
  },
  trendSubtitle: {
    fontSize: 13,
    marginTop: 4,
    color: "rgba(255,255,255,0.6)",
  },
  trendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginTop: 10,
  },

  /* TIMELINE */
  timelineSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 10,
  },
  timelineCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 10,
  },
  timelineImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 10,
  },
  timelineNoImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  timelineRight: { flex: 1 },
  timelineTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  timelineMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timelineSource: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  timelineTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
  },

  moreButton: {
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginTop: 10,
  },
  moreButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
  },
});
