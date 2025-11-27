import { Text, TouchableOpacity, StyleSheet } from "react-native";
import Screen from "@/components/layout/Screen";
import { signInWithGoogle } from "@/services/auth/authService";

export default function Login() {
  async function handleLogin() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.log("Google login error:", err);
    }
  }

  return (
    <Screen>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.text}>Entrar com Google</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  text: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },
});
