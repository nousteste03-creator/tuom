import { supabase } from "@/lib/supabase";
import { View, Button, Text } from "react-native";

export default function DevLogin() {
  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "test2@nous.com",
      password: "123456",
    });

    console.log("LOGIN:", data, error);
  }

  return (
    <View style={{ padding: 40 }}>
      <Button title="Login DEV" onPress={login} />
    </View>
  );
}
