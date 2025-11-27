// app/insights/news/[id].tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchNewsDetail } from "@/lib/api/news";

/* ---------------- CLEANER ---------------- */

function cleanNewsContent(raw?: string): string {
  if (!raw) return "";

  let text = raw.replace(/\s+/g, " ").trim();
  if (text.length > 5000) text = text.slice(0, 5000);

  const chunks = text.split(/(?<=[.!?])\s+/);
  const cleaned: string[] = [];

  for (const chunk of chunks) {
    const c = chunk.trim();
    if (!c) continue;

    const lower = c.toLowerCase();
    const words = c.split(/\s+/).length;
    const commas = (c.match(/,/g) || []).length;

    if (words > 120 && commas > 15) continue; // menus gigantes
    if (/(english|español|deutsch|中文|bahasa|português \(portugal\))/i.test(c))
      continue;
    if (/(login|cadastre|registre|privacy|terms|política)/i.test(lower))
      continue;
    if (c.length > 200 && !/[.!?]/.test(c)) continue;

    cleaned.push(c);
    if (cleaned.length >= 6) break;
  }

  return cleaned.join(" ");
}

function formatTimeAgo(publishedAt?: string) {
  if (!publishedAt) return "";
  const date = new Date(publishedAt).getTime();
  if (Number.isNaN(date)) return "";
  const diffMin = Math.floor((Date.now() - date) / 60000);
  if (diffMin < 60) return `${diffMin}min atrás`;
  const hours = Math.floor(diffMin / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days}d atrás`;
  const rest = diffMin % 60;
  return rest === 0 ? `${hours}h atrás` : `${hours}h${rest} atrás`;
}

/* ---------------- SCREEN ---------------- */

export default function NewsDetailScreen() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    source?: string;
    imageUrl?: string;
    url?: string;
    publishedAt?: string;
  }>();

  const [detail, setDetail] = useState<{ url: string; content: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const title = params.title ?? "";
  const source =
    !params.source || params.source.toLowerCase().includes("desconhecid")
      ? "NÖUS Insights"
      : params.source;
  const img = params.imageUrl;
  const publishedAt = params.publishedAt;
  const originalUrl = params.url ?? params.id ?? detail?.url;

  const cleaned = useMemo(
    () => cleanNewsContent(detail?.content),
    [detail?.content]
  );

  useEffect(() => {
    let cancel = false;

    async function load() {
      try {
        if (!originalUrl) {
          setLoading(false);
          return;
        }
        const res = await fetchNewsDetail(originalUrl);
        if (!cancel && res) setDetail({ url: res.url, content: res.content });
      } catch {
        if (!cancel) setDetail(null);
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    load();
    return () => {
      cancel = true;
    };
  }, [originalUrl]);

  function openFull() {
    if (!originalUrl) return;
    Linking.openURL(detail?.url || originalUrl).catch(() => {});
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* -------- TOPBAR FIX COM SAFE AREA -------- */}
        <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.topTitle}>Notícia</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* -------- HEADER (metade imagem / metade texto) -------- */}
        <View style={styles.headerRow}>
          <Image
            source={{ uri: img }}
            style={styles.headerImage}
            resizeMode="cover"
          />

          <View style={styles.headerText}>
            <Text style={styles.appName}>NÖUS</Text>
            <Text style={styles.appSection}>Insights</Text>
          </View>
        </View>

        {/* META */}
        <View style={styles.metaRow}>
          <Text style={styles.metaSource}>{source}</Text>
          {publishedAt && (
            <Text style={styles.metaTime}>{formatTimeAgo(publishedAt)}</Text>
          )}
        </View>

        {/* TITLE */}
        <Text style={styles.title}>{title}</Text>

        {/* CONTENT BOX */}
        <View style={styles.contentCard}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.loadingText}>
                Extraindo conteúdo da matéria...
              </Text>
            </View>
          ) : cleaned ? (
            <Text style={styles.body}>{cleaned}</Text>
          ) : (
            <Text style={styles.bodyMuted}>
              Não conseguimos extrair o texto limpo dessa matéria.
            </Text>
          )}
        </View>

        {/* FULL BUTTON */}
        {originalUrl && (
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
  scroll: { paddingHorizontal: 20 },

  /* TOP */
  topBar: {
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },

  /* HEADER */
  headerRow: {
    marginTop: 4,
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  headerImage: {
    width: "50%",
    height: 120,
    borderRadius: 20,
    marginRight: 14,
  },
  headerText: {
    width: "50%",
    justifyContent: "center",
  },

  /* Fonte fina e premium */
  appName: {
    fontSize: 22,
    fontWeight: "500",
    letterSpacing: 0.6,
    color: "#ffffff",
  },
  appSection: {
    fontSize: 18,
    fontWeight: "400",
    marginTop: 4,
    letterSpacing: 0.3,
    color: "rgba(255,255,255,0.85)",
  },

  /* META */
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  metaSource: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  metaTime: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },

  /* TITLE */
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },

  /* CONTENT */
  contentCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  loadingRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.90)",
  },
  bodyMuted: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.60)",
  },

  /* BUTTON */
  fullButton: {
    marginTop: 24,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  fullButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.95)",
  },
});
