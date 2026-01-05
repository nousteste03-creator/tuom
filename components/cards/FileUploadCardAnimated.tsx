import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

let DocumentPicker: any;
try {
  DocumentPicker = require("expo-document-picker");
} catch {
  // Mock para ambiente que não suporta módulo nativo (Codespaces, web)
  DocumentPicker = {
    getDocumentAsync: async () => ({
      type: "success",
      uri: `mock_uri_${Math.random()}`,
      name: `arquivo_${Math.floor(Math.random() * 100)}.pdf`,
      size: 12345,
    }),
  };
}

interface FileUploadCardAnimatedProps {
  onFilesChange?: (files: any[]) => void;
}

export const FileUploadCardAnimated: React.FC<FileUploadCardAnimatedProps> = ({
  onFilesChange,
}) => {
  const [files, setFiles] = useState<any[]>([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        const newFiles = [...files, result];
        setFiles(newFiles);
        onFilesChange?.(newFiles);

        // Animação do card
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        // Checkmark animado
        checkAnim.setValue(0);
        Animated.timing(checkAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    } catch (err) {
      console.log("Erro ao selecionar arquivo:", err);
    }
  };

  const removeFile = (uri: string) => {
    const newFiles = files.filter((f) => f.uri !== uri);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.uploadSquare}
          onPress={pickFile}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={36} color="#fff" />
          {files.length > 0 && (
            <Animated.View
              style={[
                styles.checkmark,
                { opacity: checkAnim, transform: [{ scale: checkAnim }] },
              ]}
            >
              <Ionicons name="checkmark-circle" size={28} color="#4cd137" />
            </Animated.View>
          )}
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Envie sua fatura</Text>
          <Text style={styles.subtitle}>
            Vamos analisar suas assinaturas e te mostrar tudo que você nem lembrava.
          </Text>
        </View>
      </Animated.View>

      <View style={{ marginTop: 20 }}>
        {files.map((item) => (
          <Animated.View
            key={item.uri}
            style={[
              styles.fileItem,
              {
                transform: [
                  {
                    translateX: checkAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: checkAnim,
              },
            ]}
          >
            <Text style={styles.fileText}>{item.name}</Text>
            <TouchableOpacity onPress={() => removeFile(item.uri)}>
              <Text style={styles.fileRemove}>X</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%" },
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)", // glass
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
  },
  uploadSquare: {
    width: 80,
    height: 80,
    backgroundColor: "#1C1C1C",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    position: "relative",
  },
  checkmark: { position: "absolute", top: -5, right: -5 },
  textContainer: { flex: 1 },
  title: { color: "#fff", fontWeight: "700", fontSize: 18, marginBottom: 5 },
  subtitle: { color: "#aaa", fontSize: 14 },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  fileText: { color: "#fff", flexShrink: 1 },
  fileRemove: { color: "#ff4d4d", fontWeight: "bold" },
});
