import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useInsights } from "@/hooks/useInsights";
import { SentimentBar } from "@/components/app/insights/SentimentBar";

export default function TrendDetailScreen() {
  const insets = useSafeAreaInsets();
  const { category } = useLocalSearchParams<{ category?: string }>();

  const { loading, trends } = useInsights();

  // Encontrar tendência da categoria
  const trend = trends.find((t) => t.category === category);

  const analysis = trend?.analysis;
  const articles = trend?.articles || [];

  const sentimentLabel = analysis
    ? `${analysis.sentiment_percent > 0 ? "+" : ""}${analysis.sentiment_percent}% • ${analysis.sentiment_label}`
    : "Carregando...";

  return (
    <View style={styles.container}>

      {/* TOPBAR */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Tendência</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80,
          paddingHorizontal: 20,
        }}
      >

        {/* HERO */}
        <View style={styles.heroCard}>
          <Text style={styles.heroCategory}>
            {category?.toUpperCase() || "TENDÊNCIA"}
          </Text>

          <Text style={styles.sentimentText}>{sentimentLabel}</Text>

          {analysis && (
            <SentimentBar
              score={analysis.sentiment_percent}
              bucket={
                analysis.sentiment_label === "otimista"
                  ? "positive"
                  : analysis.sentiment_label === "cauteloso"
                  ? "negative"
                  : "neutral"
              }
            />
          )}

          {analysis?.summary_pt && (
            <Text style={styles.heroDescription}>{analysis.summary_pt}</Text>
          )}
        </View>

        {/* LOADING */}
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.loadingText}>Carregando análise...</Text>
          </View>
        )}

        {/* IMPACTO */}
        {!loading && analysis?.impact_pt && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Impacto no mercado</Text>
            <Text style={styles.sectionText}>{analysis.impact_pt}</Text>
          </View>
        )}

        {/* HIGHLIGHTS */}
        {!loading && analysis?.highlights?.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pontos-chave</Text>

            {analysis.highlights.map((h: string, i: number) => (
              <Text key={i} style={styles.bullet}>
                • {h}
              </Text>
            ))}
          </View>
        )}

        {/* ARTIGOS */}
        {!loading && articles.length > 0 && (
          <View style={{ marginTop: 22, marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>Principais notícias</Text>
          </View>
        )}

        {!loading &&
          articles.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.articleCard}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: "/insights/news/[id]",
                  params: {
                    id: encodeURIComponent(item.title),
                    title: item.title,
                    source: item.source,
                    imageUrl: item.image_url,
                    url: item.url,
                    publishedAt: item.published_at,
                  },
                })
              }
            >
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.articleImage}
                />
              ) : (
                <View style={styles.noImage} />
              )}

              <Text style={styles.articleSource}>
                {item.source || "NÖUS Insights"}
              </Text>

              <Text style={styles.articleTitle} numberOfLines={3}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}

        {/* SEM DADOS */}
        {!loading && !analysis && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sem análise hoje</Text>
            <Text style={styles.emptyText}>
              As notícias desta categoria ainda não foram processadas.
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

/* =======================
   ESTILOS — Apple Dark
======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050507" },

  topBar: {
    paddingBottom: 6,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  heroCard: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 26,
  },
  heroCategory: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  sentimentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 12,
  },
  heroDescription: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.75)",
  },

  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { fontSize: 13, color: "rgba(255,255,255,0.6)" },

  sectionCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.75)",
  },
  bullet: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 6,
    lineHeight: 20,
  },

  articleCard: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 18,
  },
  articleImage: {
    width: "100%",
    height: 150,
    borderRadius: 16,
    marginBottom: 10,
  },
  noImage: {
    width: "100%",
    height: 150,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  articleSource: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },

  emptyCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.03)",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  emptyText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
});
