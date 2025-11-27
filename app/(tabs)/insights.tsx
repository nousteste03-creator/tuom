import React from "react";
import { View, StyleSheet } from "react-native";
import InsightsScreen from "@/components/app/insights/InsightsScreen";

const InsightsRoute = () => {
  return (
    <View style={styles.container}>
      <InsightsScreen />
    </View>
  );
};

export default InsightsRoute;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
