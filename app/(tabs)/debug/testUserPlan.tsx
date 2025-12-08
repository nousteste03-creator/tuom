import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { supabase } from "@/lib/supabase";

export default function TestUserPlan() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", "972536fd-6d71-4f21-b373-ea7a937ffb1c")
        .maybeSingle();

      console.log("USER SETTINGS TEST:", data, error);
      setResult(data || error || "EMPTY");
    }
    load();
  }, []);

  return (
    <View style={{ padding: 40 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Resultado:</Text>
      <Text>{JSON.stringify(result, null, 2)}</Text>
    </View>
  );
}
