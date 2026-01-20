import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";

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

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => item?.id ?? String(index)}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#fff"
          />
        }
        ListHeaderComponent={
          <>
            <VideoHeroInsight />
            <CategoryFilters
              categories={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </>
        }
        ListEmptyComponent={
          loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <EmptyState />
          )
        }
        renderItem={({ item }) => {
          if (!item) return null;

          return (
            <InsightCard
              data={{
                title: item.title,
                image: item.image,
                category: item.category,
                impactLevel: item.impactLevel,
                publishedAt: item.publishedAt,
              }}
            />
          );
        }}
        contentContainerStyle={styles.content}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
      />
    </View>
  );
};

export default InsightsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    paddingBottom: 32,
  },
});
