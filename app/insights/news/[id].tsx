import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

/* ---------------- UTILS ---------------- */

function formatTimeAgo(publishedAt?: string) {
  if (!publishedAt) return "";
  const t = new Date(publishedAt).getTime();
  if (Number.isNaN(t)) return "";

  const diffMin = Math.floor((Date.now() - t) / 60000);

  if (diffMin < 60) return `${diffMin}min atrás`;
  const hours = Math.floor(diffMin / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) return `${days}d atrás`;

  return `${hours}h atrás`;
}

/* ---------------- SCREEN ---------------- */

export default function NewsDetailCinematic() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    title?: string;
    source?: string;
    imageUrl?: string;
    url?: string;
    publishedAt?: string;
  }>();

  const title = params.title ?? "";
  const source =
    !params.source || params.source.toLowerCase().includes("desconhecid")
      ? "TUÖM Insights"
      : params.source;

  const img = params.imageUrl;
  const url = params.url;
  const time = formatTimeAgo(params.publishedAt);

  /* ===== Fallback de resumo curto ===== */
  const fallbackSummary =
    "Essa matéria não disponibilizou uma descrição completa. Toque abaixo para ler a versão original.";

  const summary = fallbackSummary;

  function openFull() {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* TOPBAR FIXA */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 6,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Notícia</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        {/* HERO CINEMATIC */}
        <View style={styles.heroWrapper}>
          {img ? (
            <Image
              source={{ uri: img }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroFallback} />
          )}

          <View style={styles.heroGradient} />

          <View style={styles.heroMeta}>
            <Text style={styles.heroSource}>{source}</Text>
            {time ? <Text style={styles.heroTime}>{time}</Text> : null}
          </View>

          <View style={styles.heroTitleBox}>
            <Text style={styles.heroTitle}>{title}</Text>
          </View>
        </View>

        {/* SUMMARY BLOCK */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        {/* FULL ARTICLE BUTTON */}
        {url && (
          <TouchableOpacity style={styles.fullButton} onPress={openFull}>
            <Text style={styles.fullButtonText}>Ler matéria completa</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050507" },

  /* TOPBAR */
  topBar: {
    zIndex: 99,
    paddingBottom: 6,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#050507",
  },
  topTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* HERO */
  heroWrapper: {
    width: "100%",
    height: 280,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  heroFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  heroGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  heroMeta: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  heroSource: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  heroTime: {
    marginTop: 2,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },

  heroTitleBox: {
    position: "absolute",
    bottom: 22,
    width: "100%",
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: "#fff",
  },

  /* SUMMARY */
  summaryCard: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
  },

  /* FULL BUTTON */
  fullButton: {
    marginTop: 26,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
  },
  fullButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
});
