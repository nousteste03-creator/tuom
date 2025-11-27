// components/app/insights/NewsDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Share,
  Linking,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { fetchNewsDetail } from "@/lib/api/news";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HEADER_HEIGHT = 260;
const FREE_LIMIT_PER_DAY = 3;

type ArticleState = {
  title: string;
  source: string;
  imageUrl?: string;
  url: string;
  publishedAt?: string;
  minutesAgo?: number;
  content?: string;
};

const NewsDetailScreen: React.FC = () => {
  const params = useLocalSearchParams<{
    id: string;
    title?: string;
    source?: string;
    imageUrl?: string;
    publishedAt?: string;
    minutesAgo?: string;
  }>();

  const url = decodeURIComponent(params.id);
  const [article, setArticle] = useState<ArticleState>({
    url,
    title: params.title ?? "Notícia",
    source: params.source ?? "",
    imageUrl: params.imageUrl ? String(params.imageUrl) : undefined,
    publishedAt: params.publishedAt,
    minutesAgo: params.minutesAgo ? Number(params.minutesAgo) : undefined,
    content:
      "A Pila traz um resumo inteligente das principais notícias do mercado financeiro e de tecnologia. Esta matéria foi destacada por relevância e impacto no cenário econômico atual.",
  });
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-100, 0, 200],
      [-40, 0, 120],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.1, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  useEffect(() => {
    async function checkLimit() {
      const todayKey = new Date().toISOString().slice(0, 10);
      const stored = await AsyncStorage.getItem("news_read_counts");
      const parsed = stored ? JSON.parse(stored) : {};
      const todayCount = parsed[todayKey] ?? 0;

      if (todayCount >= FREE_LIMIT_PER_DAY) {
        setBlocked(true);
        setLoading(false);
        return;
      }

      try {
        const full = await fetchNewsDetail(url);
        if (full) {
          setArticle((prev) => ({
            ...prev,
            ...full,
          }));

          parsed[todayKey] = todayCount + 1;
          await AsyncStorage.setItem(
            "news_read_counts",
            JSON.stringify(parsed)
          );
        }
      } catch (err) {
        // Já tratamos erro no fetchNewsDetail, aqui só garantimos que não quebra
      } finally {
        setLoading(false);
      }
    }

    checkLimit();
  }, [url]);

  const handleOpenInBrowser = () => {
    if (article.url) {
      Linking.openURL(article.url);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title} - ${article.source}\n\n${article.url}`,
      });
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.ScrollView
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        {/* HERO */}
        <Animated.View style={[styles.header, headerStyle]}>
          {article.imageUrl ? (
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.headerFallback} />
          )}

          <View style={styles.headerTopBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconButton}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.iconButton}
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* CONTEÚDO */}
        <View style={styles.contentWrapper}>
          <Text style={styles.sourceText}>
            {article.source} •{" "}
            {article.publishedAt ? "1d" : ""}
          </Text>

          <Text style={styles.title}>{article.title}</Text>

          <Text style={styles.lead}>
            A Pila traz um resumo inteligente das principais notícias do mercado
            financeiro e de tecnologia. Esta matéria foi destacada por
            relevância e impacto no cenário econômico atual.
          </Text>

          {blocked ? (
            <View style={styles.blockedCard}>
              <Text style={styles.blockedTitle}>
                Você já leu 3 matérias completas hoje.
              </Text>
              <Text style={styles.blockedBody}>
                Para continuar lendo matérias completas sem limite diário,
                desbloqueie o Pila Pro.
              </Text>
            </View>
          ) : (
            <Text style={styles.bodyText}>
              {loading
                ? "Carregando matéria completa..."
                : article.content ??
                  "Não foi possível carregar o texto completo desta matéria. Você pode abrir o conteúdo original no site da fonte abaixo."}
            </Text>
          )}

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.glassButton}
            onPress={handleOpenInBrowser}
          >
            <Ionicons
              name="link-outline"
              size={18}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.glassButtonText}>Ler matéria completa</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default NewsDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050507",
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerFallback: {
    flex: 1,
    backgroundColor: "#15151A",
  },
  headerTopBar: {
    position: "absolute",
    top: 52,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  sourceText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  lead: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 18,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.82)",
    marginBottom: 24,
  },
  blockedCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 18,
  },
  blockedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  blockedBody: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  glassButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.08)", // glass leve
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  glassButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
  },
});
