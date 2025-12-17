import { View, Text, StyleSheet, Platform } from "react-native";
import { useLegalAcceptances } from "@/hooks/useLegalAcceptances";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function LegalAcceptanceBlock() {
  const { data, loading } = useLegalAcceptances();

  if (loading) return null;
  if (!data) return null;

  const formattedDate = new Date(data.accepted_at).toLocaleDateString("pt-BR");

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Aceites legais</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Termos de Uso</Text>
        <Text style={styles.value}>
          v{data.accepted_terms_version} · {formattedDate}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Privacidade</Text>
        <Text style={styles.value}>
          v{data.accepted_privacy_version} · {formattedDate}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
    fontFamily: brandFont,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  label: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: brandFont,
  },
  value: {
    fontSize: 13,
    color: "#fff",
    fontFamily: brandFont,
  },
});
