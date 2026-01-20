import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Video, ResizeMode } from "expo-av";

const HERO_VIDEO = require("../../../assets/video/insights-hero.mp4");

const VideoHeroInsight = () => {
  const videoRef = useRef<Video>(null);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={HERO_VIDEO}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (
            status.isLoaded &&
            status.didJustFinish &&
            videoRef.current
          ) {
            videoRef.current.pauseAsync(); // congela no último frame
          }
        }}
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
