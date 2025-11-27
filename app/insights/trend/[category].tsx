// app/insights/trend/[category].tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useNews } from "@/hooks/useNews";
import type { RemoteNewsItem } from "@/lib/api/news";
import {
  analyzeCategoryNews,
  type CategoryAnalysisResult,
} from "@/lib/insights/analysis";

type CategorySlug = "ai" | "startups" | "economy" | "tech";

type CategoryConfig = {
  label: string;
  query: string;
};

const CATEGORY_MAP: Record<CategorySlug, CategoryConfig> = {
  ai: {
    label: "Inteligência Artificial",
    query: "inteligência artificial OR artificial intelligence",
  },
  startups: {
    label: "Startups & Inovação",
    query: "startups inovação venture capital",
  },
  economy: {
    label: "Economia",
    query: "economia juros inflação mercado",
  },
  tech: {
    label: "Tecnologia Global",
    query: "technology stocks",
  },
};

function getCategoryConfig(raw: string | string[] | undefined): {
  slug: CategorySlug;
  label: string;
  query: string;
} {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const slug = (value as CategorySlug) || "tech";

  if (slug in CATEGORY_MAP) {
    const cfg = CATEGORY_MAP[slug];
    return { slug, label: cfg.label, query: cfg.query };
  }

  const fallback = CATEGORY_MAP.tech;
  return { slug: "tech", label: fallback.label, query: fallback.query };
}

function formatTimeAgoFromMinutes(minutes?: number): string {
  if (minutes == null || Number.isNaN(minutes)) return "";

  if (minutes < 60) return `${minutes}min atrás`;

  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) return `${days}d atrás`;

  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h atrás`;

  return `${hours}h${remainingMinutes} atrás`;
}

function formatScore(score: number): string {
  if (score === 0) return "0%";
  if (score > 0) return `+${score}%`;
  return `${score}%`;
}

function getSentimentPosition(score: number): "pessimista" | "neutro" | "otimista" {
  if (score > 8) return "otimista";
  if (score < -8) return "pessimista";
  return "neutro";
}

const TrendAnalysisScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();

  const { label: categoryLabel, query } = getCategoryConfig(params.category);
  const { news, loading } = useNews(query);

  const analysis: CategoryAnalysisResult = analyzeCategoryNews(
    categoryLabel,
    (news || []) as RemoteNewsItem[]
  );

  const sentimentPosition = getSentimentPosition(analysis.score);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>Tendência</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* HERO ANALÍTICO */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <Text style={styles.heroCategory}>{categoryLabel}</Text>
          </View>

          <View style={styles.heroScoreRow}>
            <Text style={[styles.heroScore, { color: analysis.sentimentColor }]}>
              {formatScore(analysis.score)}
            </Text>
            <Text style={styles.heroSentimentLabel}>{analysis.sentimentLabel}</Text>
          </View>

          <View style={styles.intensityTrack}>
            <View
              style={[
                styles.intensityFill,
                {
                  backgroundColor: analysis.sentimentColor,
                  width: `${Math.min(1, Math.abs(analysis.score) / 40) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* LOADING / SEM DADOS */}
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Calculando análise de hoje...</Text>
          </View>
        )}

        {!loading && news.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Sem dados suficientes hoje</Text>
            <Text style={styles.emptyText}>
              Ainda não há notícias relevantes o bastante para gerar uma leitura
              consistente dessa tendência. Volte mais tarde para ver a análise consolidada.
            </Text>
          </View>
        )}

        {!loading && news.length > 0 && (
          <>
            {/* RESUMO ANALÍTICO */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumo analítico do dia</Text>
              <Text style={styles.sectionBody}>{analysis.summaryText}</Text>
            </View>

            {/* FATORES / NOTÍCIAS QUE INFLUENCIARAM A TENDÊNCIA */}
            {analysis.topHeadlines.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Fatores que influenciaram a tendência
                </Text>

                <View style={styles.headlinesList}>
                  {analysis.topHeadlines.map((h) => (
                    <TouchableOpacity
                      key={h.id}
                      activeOpacity={0.8}
                      style={styles.headlineCard}
                      onPress={() =>
                        router.push({
                          pathname: "/insights/news/[id]",
                          params: {
                            id: encodeURIComponent(h.id),
                            title: h.title,
                            source: h.source ?? "",
                            imageUrl: "",
                            publishedAt: h.publishedAt ?? "",
                            url: h.id,
                          },
                        })
                      }
                    >
                      <Text style={styles.headlineTitle}>{h.title}</Text>

                      <View style={styles.headlineMetaRow}>
                        <Text style={styles.headlineMeta}>
                          {h.source}
                          {h.minutesAgo != null
                            ? `  •  ${formatTimeAgoFromMinutes(h.minutesAgo)}`
                            : ""}
                        </Text>

                        <View style={styles.impactTag}>
                          <Text style={styles.impactTagText}>{h.impactTag}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* LEITURA DO MERCADO */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Leitura do mercado</Text>
              <Text style={styles.sectionBody}>{analysis.marketViewText}</Text>
            </View>

            {/* CORRENTE DE SENTIMENTO */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Corrente de sentimento</Text>

              <View style={styles.sentimentScale}>
                <Text style={styles.sentimentLabelScale}>Pessimista</Text>
                <Text style={styles.sentimentLabelScale}>Neutro</Text>
                <Text style={styles.sentimentLabelScale}>Otimista</Text>
              </View>

              <View style={styles.sentimentTrack}>
                <View style={styles.sentimentTrackLine} />
                <View
                  style={[
                    styles.sentimentPointer,
                    sentimentPosition === "pessimista" && { left: 0 },
                    sentimentPosition === "neutro" && { left: "50%" },
                    sentimentPosition === "otimista" && { left: "100%" },
                  ]}
                />
              </View>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default TrendAnalysisScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050507",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  heroCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 22,
  },
  heroHeaderRow: { marginBottom: 12 },
  heroCategory: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  heroScoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  heroScore: { fontSize: 26, fontWeight: "700", marginRight: 8 },
  heroSentimentLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  intensityTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  intensityFill: {
    height: "100%",
    borderRadius: 999,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },

  emptyBox: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },

  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.78)",
  },

  headlinesList: { gap: 10 },
  headlineCard: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  headlineTitle: {
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 6,
  },
  headlineMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headlineMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    flex: 1,
  },
  impactTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  impactTagText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.9)",
  },

  sentimentScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sentimentLabelScale: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  sentimentTrack: {
    height: 24,
    justifyContent: "center",
  },
  sentimentTrackLine: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  sentimentPointer: {
    position: "absolute",
    top: 4,
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#050507",
  },
});
