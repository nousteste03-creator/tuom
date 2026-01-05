// app/subscriptions/add.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Screen from "@/components/layout/Screen";
import { SERVICES_LIBRARY, type ServiceItem } from "@/constants/services";
import { addSubscription } from "@/services/subscriptions";
import { getSubscriptionIcon } from "@/constants/subscriptionIcons";

const { width } = Dimensions.get("window");

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function AddSubscription() {
  const [serviceQuery, setServiceQuery] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly");
  const [nextBilling, setNextBilling] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const serviceNameForUI = selectedService?.name ?? serviceQuery;

  const filteredServices =
    serviceQuery.length > 0 && !selectedService
      ? SERVICES_LIBRARY.filter((s) =>
          s.name.toLowerCase().includes(serviceQuery.toLowerCase())
        )
      : [];

  function handleSelectService(service: ServiceItem) {
    setSelectedService(service);
    setServiceQuery("");
    setErrorMessage(null);

    if (service.defaultPrice != null) {
      setPrice(String(service.defaultPrice).replace(",", "."));
    }
  }

  function formatDate(d: Date) {
    try {
      return d.toLocaleDateString("pt-BR");
    } catch {
      return d.toISOString().split("T")[0];
    }
  }

  async function handleSave() {
    setErrorMessage(null);

    const nameToSave = selectedService?.name ?? serviceQuery.trim();

    if (!nameToSave) {
      setErrorMessage("Informe ou selecione o nome do serviço.");
      return;
    }

    if (!price) {
      setErrorMessage("Informe o preço da assinatura.");
      return;
    }

    const numericPrice = Number(
      price.replace(",", ".").replace(/[^\d.]/g, "")
    );

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMessage("Preço inválido.");
      return;
    }

    setLoading(true);

    try {
      await addSubscription({
        service: nameToSave,
        price: numericPrice,
        frequency,
        next_billing: nextBilling.toISOString().split("T")[0], // YYYY-MM-DD
      });

      router.replace("/(tabs)/home");
    } catch (err) {
      console.log("ADD SUBSCRIPTION ERROR:", err);
      setErrorMessage("Erro ao salvar assinatura. Tente novamente.");
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
                  minHeight: width * 0.30,
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
                    Nova assinatura
                  </Text>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 22,
                      fontWeight: "700",
                      fontFamily: brandFont ?? undefined,
                    }}
                  >
                    Conecte o que você paga{"\n"}todo mês em um só lugar.
                  </Text>
                </View>

                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 12,
                    marginTop: 10,
                  }}
                >
                  Use a biblioteca de serviços ou crie algo manual. Depois
                  a gente cuida do resto.
                </Text>
              </View>
            </BlurView>
          </View>

          {/* CARD RESUMO DO SERVIÇO */}
          <View
            style={{
              backgroundColor: "rgba(15,15,15,0.9)",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.07)",
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.06)",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              {getSubscriptionIcon(serviceNameForUI) ? (
                <Image
                  source={getSubscriptionIcon(serviceNameForUI)}
                  style={{ width: 44, height: 44, resizeMode: "contain" }}
                />
              ) : (
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 20,
                    fontWeight: "700",
                  }}
                >
                  {serviceNameForUI ? serviceNameForUI.charAt(0) : "?"}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#E5E7EB",
                  fontSize: 15,
                  fontWeight: "600",
                }}
                numberOfLines={1}
              >
                {serviceNameForUI || "Selecione ou digite um serviço"}
              </Text>
              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 13,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {selectedService
                  ? selectedService.category
                  : "Ex: Netflix, Spotify, iCloud, Duolingo..."}
              </Text>
            </View>

            {selectedService && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedService(null);
                  setServiceQuery(serviceNameForUI);
                }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.16)",
                }}
              >
                <Text
                  style={{
                    color: "#E5E7EB",
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  Trocar
                </Text>
              </TouchableOpacity>
            )}
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

          {/* BLOCO: SERVIÇO (INPUT + AUTOCOMPLETE) */}
          <View>
            <Text style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 13 }}>
              Nome do serviço
            </Text>

            <TextInput
              value={serviceNameForUI}
              onChangeText={(t) => {
                setSelectedService(null);
                setServiceQuery(t);
              }}
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

            {filteredServices.length > 0 && !selectedService && (
              <View
                style={{
                  marginTop: 6,
                  backgroundColor: "rgba(8,8,8,0.96)",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.06)",
                  maxHeight: 260,
                  overflow: "hidden",
                }}
              >
                <ScrollView keyboardShouldPersistTaps="handled">
                  {filteredServices.map((item) => {
                    const iconSource = getSubscriptionIcon(item.name);

                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleSelectService(item)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "rgba(31,41,55,0.7)",
                          gap: 10,
                        }}
                      >
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            backgroundColor: "rgba(31,41,55,1)",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                          }}
                        >
                          {iconSource ? (
                            <Image
                              source={iconSource}
                              style={{
                                width: 32,
                                height: 32,
                                resizeMode: "contain",
                              }}
                            />
                          ) : (
                            <Text
                              style={{
                                color: "#E5E7EB",
                                fontSize: 14,
                                fontWeight: "600",
                              }}
                            >
                              {item.name.charAt(0)}
                            </Text>
                          )}
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: "#F9FAFB",
                              fontSize: 15,
                              fontWeight: "500",
                            }}
                          >
                            {item.name}
                          </Text>
                          <Text
                            style={{
                              color: "#6B7280",
                              fontSize: 12,
                              marginTop: 2,
                            }}
                          >
                            {item.category}
                          </Text>
                        </View>

                        {item.defaultPrice != null && (
                          <Text
                            style={{
                              color: "#9CA3AF",
                              fontSize: 13,
                            }}
                          >
                            R$ {item.defaultPrice.toFixed(2)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {/* BLOCO: PREÇO */}
          <View>
            <Text style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 13 }}>
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

          {/* BLOCO: FREQUÊNCIA */}
          <View>
            <Text style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 13 }}>
              Frequência
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
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

          {/* BLOCO: PRÓXIMA COBRANÇA */}
          <View>
            <Text style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 13 }}>
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
              {loading ? "Salvando..." : "Salvar assinatura"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Screen>
  );
}
