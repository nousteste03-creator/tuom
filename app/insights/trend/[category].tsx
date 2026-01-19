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

  const { loading, categories } = useInsights();
  const articles = categories?.[category || ""] || [];

  const sentimentPercent = 0; // Placeholder, depois puxar do backend
  const sentimentLabel = "Neutro";

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

        <Text style={styles.topBarTitle}>{category?.toUpperCase() || "TENDÊNCIA"}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 20 }}>
        {/* HERO */}
        <View style={styles.heroCard}>
          <Text style={styles.heroCategory}>{category?.toUpperCase() || "TENDÊNCIA"}</Text>
          <Text style={styles.sentimentText}>{sentimentPercent}% • {sentimentLabel}</Text>
          <SentimentBar score={sentimentPercent} bucket="neutral" />
        </View>

        {/* LOADING */}
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.loadingText}>Carregando análise...</Text>
          </View>
        )}

        {/* ARTIGOS */}
        {!loading && articles.length > 0 && (
          <View style={{ marginTop: 22, marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>Principais notícias</Text>
          </View>
        )}
        {!loading && articles.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.articleCard}
            activeOpacity={0.9}
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
                },
              })
            }
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.articleImage} />
            ) : (
              <View style={styles.noImage} />
            )}
            <Text style={styles.articleSource}>{item.source || "TUÖM Insights"}</Text>
            <Text style={styles.articleTitle} numberOfLines={3}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050507" },
  topBar: { paddingBottom: 6, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  topBarTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  heroCard: { padding: 20, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginTop: 20, marginBottom: 26 },
  heroCategory: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 6 },
  sentimentText: { fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { fontSize: 13, color: "rgba(255,255,255,0.6)" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 8 },
  articleCard: { padding: 12, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 18 },
  articleImage: { width: "100%", height: 150, borderRadius: 16, marginBottom: 10 },
  noImage: { width: "100%", height: 150, borderRadius: 16, marginBottom: 10, backgroundColor: "rgba(255,255,255,0.06)" },
  articleSource: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 4 },
  articleTitle: { fontSize: 15, color: "#fff", fontWeight: "500" },
});
