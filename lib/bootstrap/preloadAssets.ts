import { Asset } from "expo-asset";

export async function preloadInsightsAssets() {
  try {
    await Asset.loadAsync([
      require("@/assets/video/insights-hero.mp4"),
      require("@/assets/video/insights-hero-poster.png"),
      require("@/assets/images/insight-fallback.png"),
    ]);
  } catch (err) {
    console.warn("[preload] insights assets failed", err);
  }
}
