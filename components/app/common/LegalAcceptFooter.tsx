import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

type Props = {
  accepted: boolean;
  setAccepted: (v: boolean) => void;
  loading?: boolean;
  buttonLabel?: string;
  onPressAccept: () => void;
  helperText?: string;
};

export default function LegalAcceptFooter({
  accepted,
  setAccepted,
  loading,
  buttonLabel = "Aceito",
  onPressAccept,
  helperText,
}: Props) {
  const canSubmit = useMemo(() => accepted && !loading, [accepted, loading]);

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => setAccepted(!accepted)}
        activeOpacity={0.85}
        hitSlop={8}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
          {accepted ? <Text style={styles.check}>✓</Text> : null}
        </View>

        <Text style={styles.text}>
          Eu li e concordo com este documento.
          {helperText ? <Text style={styles.helper}> {"\n"}{helperText}</Text> : null}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        disabled={!canSubmit}
        onPress={onPressAccept}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "rgba(255,255,255,0.9)",
  },
  check: { color: "#000", fontSize: 12, fontWeight: "800" },
  text: {
    flex: 1,
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: brandFont,
  },
  helper: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: brandFont,
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "500", fontFamily: brandFont },
});
