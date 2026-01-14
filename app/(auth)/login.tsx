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
import { featureFlags } from "@/lib/featureFlags";
import { Ionicons, AntDesign } from "@expo/vector-icons";

// --- Condicional para WebView / WebBrowser ---
let WebView: any = null;
let WebBrowser: any = { maybeCompleteAuthSession: () => {} };

try {
  WebBrowser = require("expo-web-browser");
  WebView = require("react-native-webview").WebView;
  WebBrowser.maybeCompleteAuthSession();
} catch (e) {
  // Ambiente Expo Go ou Web → ignora, não quebra
  WebView = null;
}

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const isValid = useMemo(
    () => email.includes("@") && password.length >= 6 && (!WebView || captchaToken),
    [email, password, captchaToken]
  );

  /* ---------------- Email / Password ---------------- */
  async function handleLogin() {
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);
    authLogger.info("LOGIN", "password login started");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
      options: WebView ? { captchaToken: captchaToken! } : undefined,
    });

    setLoading(false);

    if (error) {
      authLogger.warn("LOGIN", "login failed", error);

      if (
        error.message?.toLowerCase().includes("email") &&
        error.message?.toLowerCase().includes("confirm")
      ) {
        authLogger.info("LOGIN", "email not confirmed → /verify");
        router.replace(
          `/(auth)/verify?email=${encodeURIComponent(email.trim())}`
        );
        return;
      }

      setError("Email ou senha inválidos");
      return;
    }

    authLogger.info("LOGIN", "success → /home");
    router.replace("/home");
  }

  /* ---------------- Google OAuth ---------------- */
  async function handleGoogleLogin() {
    if (socialLoading) return;

    setError(null);
    setSocialLoading("google");

    try {
      authLogger.info("GOOGLE", "start OAuth");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "nouscore://auth-callback",
        },
      });

      if (error || !data?.url) {
        authLogger.error("GOOGLE", "OAuth init failed", error);
        setError("Erro ao iniciar login com Google");
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        "nouscore://auth-callback"
      );

      if (result.type !== "success" || !result.url) {
        setError("Login cancelado");
        return;
      }

      const hash = result.url.split("#")[1];
      const params = new URLSearchParams(hash);

      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (!access_token || !refresh_token) {
        authLogger.error("GOOGLE", "tokens missing");
        setError("Falha ao obter tokens");
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        authLogger.error("GOOGLE", "setSession failed", sessionError);
        setError("Erro ao salvar sessão");
        return;
      }

      authLogger.info("GOOGLE", "success → /home");
      router.replace("/home");
    } catch (err) {
      authLogger.error("GOOGLE", "fatal error", err);
      setError("Erro inesperado no login com Google");
    } finally {
      setSocialLoading(null);
    }
  }

  /* ---------------- Apple Sign In ---------------- */
  function handleApplePress() {
    if (!featureFlags.appleSignInEnabled) {
      setError("Apple Sign In estará disponível em breve.");
      return;
    }
  }

  return (
    <View style={styles.root}>
      {/* Close */}
      <TouchableOpacity
        style={styles.close}
        onPress={() => router.replace("/lobby")}
        hitSlop={10}
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>
          Organize sua vida financeira em um só lugar
        </Text>
      </View>

      {/* Form */}
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

        <View style={styles.inputBlock}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor="rgba(255,255,255,0.3)"
            secureTextEntry
            style={styles.input}
          />
        </View>

        {/* Turnstile WebView só aparece no build nativo */}
        {WebView && (
          <View style={styles.captchaBlock}>
            <WebView
              originWhitelist={["*"]}
              source={{
                html: `
                  <html>
                    <head>
                      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
                    </head>
                    <body>
                      <div class="cf-turnstile" data-sitekey="YOUR_TURNSTILE_SITE_KEY" data-callback="onSuccess"></div>
                      <script>
                        function onSuccess(token) {
                          window.ReactNativeWebView.postMessage(token);
                        }
                      </script>
                    </body>
                  </html>
                `,
              }}
              onMessage={(event) => setCaptchaToken(event.nativeEvent.data)}
              javaScriptEnabled
              style={{ flex: 1, height: 90 }}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot")}
          style={styles.forgot}
        >
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]}
          disabled={!isValid || loading}
          onPress={handleLogin}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>ou</Text>
        <View style={styles.line} />
      </View>

      {/* Social */}
      <View style={styles.social}>
        <TouchableOpacity
          style={[styles.socialButton, !featureFlags.appleSignInEnabled && { opacity: 0.4 }]}
          onPress={handleApplePress}
        >
          <Ionicons name="logo-apple" size={18} color="#fff" />
          <Text style={styles.socialText}>Continuar com Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleLogin}
          disabled={socialLoading === "google"}
        >
          {socialLoading === "google" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <AntDesign name="google" size={16} color="#fff" />
              <Text style={styles.socialText}>Continuar com Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
          <Text style={styles.footerLink}>
            Não tem conta? <Text style={styles.footerStrong}>Criar agora</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Ao continuar, você concorda com nossos{" "}
          <Text style={styles.legalLink} onPress={() => router.push("/terms")}>
            Termos
          </Text>{" "}
          e{" "}
          <Text style={styles.legalLink} onPress={() => router.push("/privacy")}>
            Privacidade
          </Text>
          .
        </Text>
      </View>
    </View>
  );
}

/* styles */
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

  forgot: { alignSelf: "flex-end", marginBottom: 12 },
  forgotText: { color: "rgba(255,255,255,0.5)", fontSize: 13 },

  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },

  error: { marginTop: 12, color: "#ff6b6b", fontSize: 14 },

  divider: { flexDirection: "row", alignItems: "center", marginVertical: 28 },
  line: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  or: { marginHorizontal: 12, color: "rgba(255,255,255,0.4)" },

  social: { gap: 12 },
  socialButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  socialText: { color: "#fff", fontSize: 15 },

  footer: { marginTop: 32, alignItems: "center" },
  footerLink: { color: "rgba(255,255,255,0.6)", marginBottom: 16 },
  footerStrong: { color: "#fff", fontWeight: "500" },

  legal: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    lineHeight: 16,
  },
  legalLink: { color: "rgba(255,255,255,0.75)", textDecorationLine: "underline" },

  captchaBlock: { marginVertical: 12, alignItems: "center" },
});
