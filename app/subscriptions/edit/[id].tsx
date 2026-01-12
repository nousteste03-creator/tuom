// app/subscriptions/edit/[id].tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { BlurView } from "expo-blur";
import DateTimePicker from "@react-native-community/datetimepicker";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { supabase } from "@/lib/supabase";
import type { Subscription } from "@/types/subscriptions";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function EditSubscriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subscriptions, update } = useSubscriptions(); // <-- ajustado

  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly");
  const [nextBilling, setNextBilling] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;

      const fromHook = subscriptions.find((s) => s.id === id);
      let sub: Subscription | null = null;

      if (fromHook) {
        sub = fromHook;
      } else {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.log("ERROR LOADING SUB FOR EDIT:", error);
        } else {
          sub = data as Subscription;
        }
      }

      if (!sub) return;

      setSubscription(sub);
      setServiceName(sub.service);
      setPrice(String(sub.price).replace(".", ","));
      setFrequency(sub.frequency === "yearly" ? "yearly" : "monthly");
      if (sub.next_billing) setNextBilling(new Date(sub.next_billing));
    }

    load();
  }, [id, subscriptions]);

  function formatDate(d: Date) {
    try {
      return d.toLocaleDateString("pt-BR");
    } catch {
      return d.toISOString().split("T")[0];
    }
  }

  async function handleSave() {
    if (!id) return;

    setErrorMessage(null);

    const nameToSave = serviceName.trim();
    if (!nameToSave) {
      setErrorMessage("Informe o nome do serviço.");
      return;
    }

    if (!price) {
      setErrorMessage("Informe o preço da assinatura.");
      return;
    }

    const numericPrice = Number(price.replace(",", ".").replace(/[^\d.]/g, ""));
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMessage("Preço inválido.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        service: nameToSave,
        price: numericPrice,
        frequency,
        next_billing: nextBilling.toISOString().split("T")[0],
      };

      // usa o update reativo do hook
      await update(id, payload);

      router.replace(`/subscriptions/${id}`);
    } catch (err) {
      console.log("UPDATE ERROR:", err);
      setErrorMessage("Erro ao salvar alterações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ flex: 1, backgroundColor: "#0B0B0C" }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
            gap: 22,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER VOLTAR */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.18)",
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Icon name="chevron-back" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 12,
                  marginBottom: 2,
                }}
              >
                Editar assinatura
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "600",
                  fontFamily: brandFont ?? undefined,
                }}
                numberOfLines={1}
              >
                {subscription?.service ?? "Carregando..."}
              </Text>
            </View>
          </View>

          {/* MINI-HERO COM BLUR */}
          <View
            style={{
              borderRadius: 26,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <BlurView intensity={28} tint="dark" style={{ flex: 1 }}>
              <View
                style={{
                  padding: 18,
                  minHeight: 120,
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text
                    style={{
                      color: "#9CA3AF",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    Ajustando sua recorrência
                  </Text>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 22,
                      fontWeight: "700",
                      fontFamily: brandFont ?? undefined,
                    }}
                  >
                    Pequenos ajustes aqui podem liberar{"\n"}mais espaço no seu
                    mês.
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* ERRO GLOBAL */}
          {errorMessage && (
            <View
              style={{
                backgroundColor: "rgba(248, 113, 113, 0.12)",
                borderRadius: 12,
                padding: 10,
                borderWidth: 1,
                borderColor: "rgba(248,113,113,0.4)",
              }}
            >
              <Text
                style={{
                  color: "#FCA5A5",
                  fontSize: 13,
                }}
              >
                {errorMessage}
              </Text>
            </View>
          )}

          {/* NOME DO SERVIÇO */}
          <View>
            <Text
              style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 13 }}
            >
              Nome do serviço
            </Text>

            <TextInput
              value={serviceName}
              onChangeText={setServiceName}
              placeholder="Netflix, Spotify, iCloud..."
              placeholderTextColor="#6B7280"
              style={{
                backgroundColor: "rgba(15,15,15,0.95)",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: "#FFFFFF",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                fontSize: 15,
              }}
            />
          </View>

          {/* PREÇO */}
          <View>
            <Text
              style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 13 }}
            >
              Preço (R$)
            </Text>
            <TextInput
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
              placeholder="Ex: 39,90"
              placeholderTextColor="#6B7280"
              style={{
                backgroundColor: "rgba(15,15,15,0.95)",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: "#FFFFFF",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                fontSize: 15,
              }}
            />
          </View>

          {/* FREQUÊNCIA */}
          <View>
            <Text
              style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 13 }}
            >
              Frequência
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
              }}
            >
              {(["monthly", "yearly"] as const).map((f) => {
                const label = f === "monthly" ? "Mensal" : "Anual";
                const active = frequency === f;

                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFrequency(f)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: active
                        ? "#FFFFFF"
                        : "rgba(255,255,255,0.18)",
                      backgroundColor: active
                        ? "#FFFFFF"
                        : "rgba(15,15,15,0.95)",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: active ? "#111827" : "#F9FAFB",
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* PRÓXIMA COBRANÇA */}
          <View>
            <Text
              style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 13 }}
            >
              Próxima cobrança
            </Text>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                backgroundColor: "rgba(15,15,15,0.95)",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 15 }}>
                {formatDate(nextBilling)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                value={nextBilling}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setNextBilling(date);
                }}
              />
            )}
          </View>

          {/* BOTÃO SALVAR */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={{
              marginTop: 10,
              backgroundColor: "#FFFFFF",
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text
              style={{
                color: "#111827",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Screen>
  );
}
