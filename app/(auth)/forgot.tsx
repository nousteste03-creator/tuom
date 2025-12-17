import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { authLogger } from "@/lib/authLogger";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => email.includes("@"), [email]);

  async function handleSend() {
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    authLogger.info("RECOVERY", "request started");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      // 🔑 ESTE redirectTo É O QUE FAZ O EMAIL ABRIR O APP
      redirectTo: "nouscore://auth-recovery",
    });

    setLoading(false);

    if (error) {
      authLogger.warn("RECOVERY", "failed", error);
      setError("Não foi possível enviar o email. Tente novamente.");
      return;
    }

    setInfo("Se o email existir, enviamos um link de recuperação.");
  }

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={styles.close}
        onPress={() => router.replace("/(auth)/login")}
        hitSlop={10}
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          Enviaremos um link para redefinir sua senha
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            !isValid && styles.primaryButtonDisabled,
          ]}
          disabled={!isValid || loading}
          onPress={handleSend}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Enviar link</Text>
          )}
        </TouchableOpacity>

        {info && <Text style={styles.info}>{info}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", paddingHorizontal: 24 },
  close: { position: "absolute", top: 56, right: 24, zIndex: 10 },
  closeText: { color: "rgba(255,255,255,0.6)", fontSize: 28, fontFamily: brandFont },
  header: { marginTop: 120, marginBottom: 40 },
  title: { fontSize: 34, fontWeight: "600", color: "#fff", fontFamily: brandFont },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.6)", fontFamily: brandFont },
  form: { marginBottom: 32 },
  inputBlock: { marginBottom: 16 },
  label: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 6 },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    color: "#fff",
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  info: { marginTop: 12, color: "rgba(255,255,255,0.7)" },
  error: { marginTop: 12, color: "#ff6b6b" },
});
