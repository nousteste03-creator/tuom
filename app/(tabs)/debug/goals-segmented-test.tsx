// app/debug/goal-main-card.tsx
import React from "react";
import { ScrollView, View } from "react-native";
import GoalMainCard from "@/components/app/goals/GoalMainCard";
import { useGoals } from "@/hooks/useGoals";

export default function DebugGoalMainCard() {
  const { primaryGoal, loading } = useGoals();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0B0B0C" }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={{ height: 60 }} />

      {!loading && (
        <GoalMainCard
          goal={primaryGoal}
          isPro={true} // FORÇA visual premium para teste
          onPressDetails={() => console.log("VER DETALHES")}
          onPressEdit={() => console.log("EDITAR")}
          onPressAddInstallment={() => console.log("ADD PARCELA")}
        />
      )}
    </ScrollView>
  );
}
