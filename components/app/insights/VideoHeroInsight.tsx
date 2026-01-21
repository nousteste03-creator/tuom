import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Video, ResizeMode } from "expo-av";

const HERO_VIDEO = require("../../../assets/video/insights-hero.mp4");
const HERO_POSTER = require("../../../assets/video/insights-hero-poster.png");

const VideoHeroInsight = () => {
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    videoRef.current?.playAsync();
  }, []);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={HERO_VIDEO}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        posterSource={HERO_POSTER}
        usePoster
      />
    </View>
  );
};

export default VideoHeroInsight;

const styles = StyleSheet.create({
  container: {
    height: 280,
    backgroundColor: "#000",
    marginBottom: 16,
    overflow: "hidden",
  },
});
