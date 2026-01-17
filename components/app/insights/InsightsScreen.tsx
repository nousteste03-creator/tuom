// components/app/insights/InsightsScreen.tsx
import React, { useMemo, useCallback } from "react";
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

import { useInsights, InsightItem } from "@/hooks/useInsights";

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

/* ---------------------------------------------------------
   Componente principal
----------------------------------------------------------*/
export default function InsightsScreen() {
  const insets = useSafeAreaInsets();

  const {
    loading,
    insightOfDay,
    today,
    highlights,
    trends,
    error,
  } = useInsights();

  const isEmpty = !loading && today.length === 0 && highlights.length === 0;

  const headerSubtitle = useMemo(
    () => "Atualizações globais • Curadoria TUÖM",
    []
  );

  /* ---------------------------------------------------------
     Abrir notícia
  ----------------------------------------------------------*/
  const openNews = useCallback((item: InsightItem) => {
    router.push({
      pathname: "/insights/news/[id]",
      params: {
        id: encodeURIComponent(item.id),
        title: item.title,
        source: item.source,
        publishedAt: item.publishedAt,
        description: item.subtitle || item.description || "",
      },
    });
  }, []);

  /* ---------------------------------------------------------
     Render do card (SEM key aqui)
  ----------------------------------------------------------*/
  const renderInsightCard = (item: InsightItem) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.highlightCard}
      onPress={() => openNews(item)}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.highlightImage} />
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
  );

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

        {/* HERO */}
        {insightOfDay && (
          <View style={styles.insightCard}>
            <Text style={styles.insightLabel}>Destaque do dia</Text>
            <Text style={styles.insightTitle}>{insightOfDay.title}</Text>
            <Text style={styles.insightBody}>{insightOfDay.subtitle}</Text>
          </View>
        )}

        {/* LOADING / EMPTY */}
        {loading && (
          <Text style={styles.loadingText}>Carregando insights…</Text>
        )}
        {!loading && isEmpty && (
          <Text style={styles.loadingText}>
            Nenhuma atualização disponível.
          </Text>
        )}
        {error && (
          <Text style={styles.loadingText}>Erro: {error}</Text>
        )}

        {/* HOJE */}
        {!loading && today.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hoje</Text>
            {today.map((item) => (
              <View key={`today-${item.id}`}>
                {renderInsightCard(item)}
              </View>
            ))}
          </View>
        )}

        {/* DESTAQUES */}
        {!loading && highlights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destaques</Text>
            {highlights.map((item) => (
              <View key={`highlight-${item.id}`}>
                {renderInsightCard(item)}
              </View>
            ))}
          </View>
        )}

        {/* TRENDS / CATEGORIAS */}
        {!loading &&
          trends.map((group) => (
            <View key={`trend-${group.category}`} style={styles.section}>
              <Text style={styles.sectionTitle}>{group.category}</Text>
              {group.articles.map((item) => (
                <View key={`trend-${group.category}-${item.id}`}>
                  {renderInsightCard(item)}
                </View>
              ))}
            </View>
          ))}

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
    textAlign: "center",
    marginVertical: 12,
  },

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

  highlightCard: {
    marginBottom: 14,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  highlightImage: { width: "100%", height: 160 },
  highlightBody: { padding: 14 },
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
});

