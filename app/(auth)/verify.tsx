import { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { authLogger } from "@/lib/authLogger";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? "");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => email.includes("@"), [email]);

  async function handleResend() {
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      authLogger.info("VERIFY", "resend started");

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) {
        authLogger.warn("VERIFY", "resend failed", error);
        setError("Não foi possível reenviar. Tente novamente em instantes.");
        return;
      }

      setInfo("Enviamos um novo email de verificação.");
      authLogger.info("VERIFY", "resend success");
    } catch (e) {
      authLogger.error("VERIFY", "fatal", e);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.title}>Verifique seu email</Text>
        <Text style={styles.subtitle}>
          Para continuar, confirme o email no link que enviamos.
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
          style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]}
          disabled={!isValid || loading}
          onPress={handleResend}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Reenviar email</Text>
          )}
        </TouchableOpacity>

        {info && <Text style={styles.info}>{info}</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text style={styles.footerLink}>
            Já confirmou? <Text style={styles.footerStrong}>Entrar</Text>
          </Text>
        </TouchableOpacity>
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

  info: { marginTop: 12, color: "rgba(255,255,255,0.7)", fontSize: 14 },
  error: { marginTop: 12, color: "#ff6b6b", fontSize: 14 },

  footer: { marginTop: 32, alignItems: "center" },
  footerLink: { color: "rgba(255,255,255,0.6)" },
  footerStrong: { color: "#fff", fontWeight: "500" },
});
