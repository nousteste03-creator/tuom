import React, { useMemo } from "react";
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
   Helper — formatar tempo
----------------------------------------------------------*/
function formatTimeAgo(publishedAt?: string) {
  if (!publishedAt) return "";
  const t = new Date(publishedAt).getTime();
  if (Number.isNaN(t)) return "";
  const diffMin = Math.floor((Date.now() - t) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min`;
  const h = Math.floor(diffMin / 60);
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d}d`;
  return `${h}h`;
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { loading, insightOfDay, today, highlights, trends } = useInsights();

  const headerSubtitle = useMemo(
    () => "Atualizações globais • Curadoria TUÖM",
    []
  );

  function openNews(item: any) {
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
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 14 },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
          <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
        </View>

        {/* INSIGHT DO DIA */}
        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>Insight do dia</Text>
          <Text style={styles.insightTitle}>{insightOfDay.title}</Text>
          <Text style={styles.insightBody}>{insightOfDay.subtitle}</Text>
        </View>

        {/* HOJE — leitura rápida */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoje</Text>

          {loading && (
            <Text style={styles.loadingText}>Carregando…</Text>
          )}

          {!loading && today.length === 0 && (
            <Text style={styles.loadingText}>
              Nenhuma atualização agora.
            </Text>
          )}

          {!loading && today.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              {today.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.9}
                  style={styles.todayCard}
                  onPress={() => openNews(item)}
                >
                  <Text style={styles.todayText} numberOfLines={3}>
                    {item.title}
                  </Text>

                  <Text style={styles.todayMeta}>
                    {(item.source || "TUÖM") +
                      " • " +
                      formatTimeAgo(item.publishedAt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* DESTAQUES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destaques</Text>

          {highlights.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.highlightCard}
              onPress={() => openNews(item)}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.highlightImage}
                />
              ) : null}

              <View style={styles.highlightBody}>
                <Text style={styles.highlightTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={styles.highlightMeta}>
                  {(item.source || "TUÖM") +
                    " • " +
                    formatTimeAgo(item.publishedAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* TENDÊNCIAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tendências</Text>

          {trends.map((group, idx) => (
            <View key={group.category + idx} style={styles.trendBlock}>
              <Text style={styles.trendHeader}>{group.category}</Text>

              {group.articles.slice(0, 3).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  style={styles.trendItem}
                  onPress={() => openNews(item)}
                >
                  <Text style={styles.trendItemText} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.trendItemMeta}>
                    {formatTimeAgo(item.publishedAt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------
   ESTILOS — Apple News / iOS glass
--------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0D" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  header: { alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 28, color: "#FFF", fontWeight: "700" },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginTop: 6,
  },

  loadingText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },

  /* INSIGHT */
  insightCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 28,
  },
  insightLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 6,
  },
  insightTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFF",
  },
  insightBody: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
    lineHeight: 19,
  },

  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 14,
  },

  /* HOJE */
  row: { paddingRight: 8 },
  todayCard: {
    width: 220,
    marginRight: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  todayText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
  },
  todayMeta: {
    marginTop: 10,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },

  /* DESTAQUES */
  highlightCard: {
    marginBottom: 14,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  highlightImage: {
    width: "100%",
    height: 160,
  },
  highlightBody: {
    padding: 14,
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
    lineHeight: 20,
  },
  highlightMeta: {
    marginTop: 8,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },

  /* TRENDS */
  trendBlock: {
    marginBottom: 18,
  },
  trendHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 10,
  },
  trendItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  trendItemText: {
    fontSize: 14,
    color: "#FFF",
    lineHeight: 18,
  },
  trendItemMeta: {
    fontSize: 12,
    marginTop: 4,
    color: "rgba(255,255,255,0.45)",
  },
});
