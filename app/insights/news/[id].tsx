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
    description?: string;
  }>();

  const title = params.title || "";
  const source = params.source && !params.source.toLowerCase().includes("desconhecid")
    ? params.source
    : "TUÖM Insights";
  const img = params.imageUrl;
  const url = params.url;
  const time = formatTimeAgo(params.publishedAt);
  const summary = params.description || "Essa matéria não disponibilizou uma descrição completa.";

  function openFull() {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* TOPBAR */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notícia</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* HERO */}
        <View style={styles.heroWrapper}>
          {img ? <Image source={{ uri: img }} style={styles.heroImage} resizeMode="cover" /> : <View style={styles.heroFallback} />}
          <View style={styles.heroGradient} />
          <View style={styles.heroMeta}>
            <Text style={styles.heroSource}>{source}</Text>
            {time && <Text style={styles.heroTime}>{time}</Text>}
          </View>
          <View style={styles.heroTitleBox}>
            <Text style={styles.heroTitle}>{title}</Text>
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        {/* FULL ARTICLE BUTTON */}
        {url && (
          <TouchableOpacity style={styles.fullButton} onPress={openFull}>
            <Text style={styles.fullButtonText}>Ler matéria completa</Text>
            <Ionicons name="chevron-forward-outline" size={18} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050507" },
  topBar: { zIndex: 99, paddingBottom: 6, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#050507" },
  topTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  backButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.10)", alignItems: "center", justifyContent: "center" },
  heroWrapper: { width: "100%", height: 280, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, overflow: "hidden", backgroundColor: "#000" },
  heroImage: { width: "100%", height: "100%", position: "absolute" },
  heroFallback: { width: "100%", height: "100%", backgroundColor: "rgba(255,255,255,0.06)" },
  heroGradient: { position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)" },
  heroMeta: { position: "absolute", top: 16, left: 16 },
  heroSource: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 2 },
  heroTime: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  heroTitleBox: { position: "absolute", bottom: 20, left: 16, right: 16 },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "#fff", lineHeight: 28 },
  summaryCard: { marginTop: 24, paddingHorizontal: 20 },
  summaryText: { fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 22 },
  fullButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 28, marginHorizontal: 40, paddingVertical: 12, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20 },
  fullButtonText: { color: "#fff", fontWeight: "600", fontSize: 15, marginRight: 6 },
});
