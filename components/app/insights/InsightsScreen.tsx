import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  Pressable,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";

import { useInsightsFeed } from "@/hooks/useInsightsFeed";

import VideoHeroInsight from "./VideoHeroInsight";
import InsightCard from "./InsightCard";
import CategoryFilters from "./CategoryFilters";

import LoadingCard from "./states/LoadingCard";
import EmptyState from "./states/EmptyState";

const InsightsScreen = () => {
  const {
    items,
    categories,
    loading,
    selectedCategory,
    setSelectedCategory,
    refresh,
  } = useInsightsFeed();

  const [radarExpanded, setRadarExpanded] = useState(false);

  const isEmpty = !loading && items.length === 0;

  const featured = items[0];
  const nowItems = items.slice(1, 3);
  const radarItems = items.slice(3);
  const radarVisible = radarExpanded
    ? radarItems
    : radarItems.slice(0, 3);

  return (
    <View style={styles.container}>
      <FlatList
        data={radarExpanded ? radarItems : []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#fff"
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* HERO */}
            <VideoHeroInsight />

            <Text style={styles.heroQuote}>
              A economia muda em silêncio.
            </Text>

            {/* FILTROS */}
            <CategoryFilters
              categories={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />

            {isEmpty && <EmptyState />}

            {/* DESTAQUE */}
            {featured && (
              <>
                <SectionTitle title="Destaque" />
                <InsightCard
                  variant="featured"
                  data={{
                    title: featured.title,
                    image: featured.image,
                    category: featured.category,
                    impactLevel: featured.impactLevel,
                    publishedAt: featured.publishedAt,
                  }}
                />
              </>
            )}

            {/* AGORA */}
            {nowItems.length > 0 && (
              <>
                <SectionTitle title="Agora" />
                <View style={styles.row}>
                  {nowItems.map((item) => (
                    <View key={item.id} style={styles.half}>
                      <InsightCard
                        data={{
                          title: item.title,
                          image: item.image,
                          category: item.category,
                          impactLevel: item.impactLevel,
                          publishedAt: item.publishedAt,
                        }}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* RADAR */}
            {radarItems.length > 0 && (
              <>
                <SectionTitle title="Radar" subtle />

                <View style={styles.radarGrid}>
                  {radarVisible.map((item) => (
                    <RadarCard
                      key={item.id}
                      item={item}
                      compact={!radarExpanded}
                    />
                  ))}
                </View>

                {radarItems.length > 3 && (
                  <Pressable
                    onPress={() =>
                      setRadarExpanded((prev) => !prev)
                    }
                    style={styles.radarToggle}
                  >
                    <Text style={styles.radarToggleText}>
                      {radarExpanded ? "Ver menos" : "Ver mais"}
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : null
        }
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

export default InsightsScreen;

/* -------------------------------------------------------------------------- */
/*                               SUB COMPONENTS                               */
/* -------------------------------------------------------------------------- */

const SectionTitle = ({
  title,
  subtle,
}: {
  title: string;
  subtle?: boolean;
}) => (
  <Text
    style={[
      styles.sectionTitle,
      subtle && styles.sectionTitleSubtle,
    ]}
  >
    {title}
  </Text>
);

const RadarCard = ({
  item,
  compact,
}: {
  item: any;
  compact: boolean;
}) => {
  return (
    <BlurView
      intensity={28}
      tint="dark"
      style={[
        styles.radarCard,
        compact && styles.radarCardCompact,
      ]}
    >
      <Image
        source={item.image}
        style={styles.radarImage}
      />

      <View style={styles.radarText}>
        <Text
          style={styles.radarTitle}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <Text style={styles.radarMeta}>
          {item.category} • {item.impactLevel}
        </Text>
      </View>
    </BlurView>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  content: {
    paddingBottom: 40,
  },

  heroQuote: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 16,
    letterSpacing: 0.4,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginTop: 28,
    marginBottom: 12,
  },

  sectionTitleSubtle: {
    color: "#777",
    fontSize: 16,
    marginTop: 32,
  },

  row: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },

  half: {
    flex: 1,
  },

  /* ----------------------------- RADAR ----------------------------- */

  radarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
  },

  radarCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  radarCardCompact: {
    width: "48%",
  },

  radarImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#111",
  },

  radarText: {
    flex: 1,
  },

  radarTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
  },

  radarMeta: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },

  radarToggle: {
    marginTop: 14,
    alignItems: "center",
  },

  radarToggleText: {
    color: "#aaa",
    fontSize: 13,
  },
});
