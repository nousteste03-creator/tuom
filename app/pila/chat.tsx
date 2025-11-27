// app/pila/chat.tsx
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

import Screen from "@/components/layout/Screen";
import Icon from "@/components/ui/Icon";
import { usePilaChat } from "@/hooks/usePilaChat";

const brandFont = Platform.select({
  ios: "SF Pro Display",
  default: "System",
});

export default function PilaChatScreen() {
  const router = useRouter();
  const { messages, loading, sending, sendMessage, session } = usePilaChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);

  const isLogged = !!session?.user;

  // HEADER COLLAPSE ANIMATION
  const headerOpacity = useSharedValue(1);

  function handleScroll(e: any) {
    const y = e.nativeEvent.contentOffset.y;
    const to = y > 10 ? 0 : 1;
    headerOpacity.value = withTiming(to, {
      duration: 260,
      easing: Easing.out(Easing.quad),
    });
  }

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: withTiming(headerOpacity.value === 1 ? 0 : -18, {
          duration: 260,
          easing: Easing.out(Easing.quad),
        }),
      },
    ],
  }));

  // INPUT ANIMATION
  const inputScale = useSharedValue(1);
  function animateInput(focused: boolean) {
    inputScale.value = withTiming(focused ? 0.97 : 1, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
  }

  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  // AUTO SCROLL
  useEffect(() => {
    const timeout = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      60
    );
    return () => clearTimeout(timeout);
  }, [messages.length, sending]);

  async function handleSend() {
    if (!input.trim() || sending || !isLogged) return;
    const text = input.trim();
    setInput("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(text);
  }

  // CHIPS
  const suggestionChips = [
    "Explique minhas assinaturas",
    "Onde posso cortar gastos?",
    "Projete meu mês com folga",
    "Quais são meus maiores gastos?",
  ];

  const shouldShowChips = input.trim().length === 0;

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
      >
        <View style={{ flex: 1, backgroundColor: "#111111" }}>
          {/* HEADER */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 20,
              },
              headerStyle,
            ]}
          >
            <BlurView
              intensity={24}
              tint="dark"
              style={{
                paddingTop: 12,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.07)",
                backgroundColor: "rgba(17,17,17,0.98)",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                }}
              >
                <TouchableOpacity
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.10)",
                  }}
                >
                  <Icon name="chevron-back" size={18} color="#E5E7EB" />
                </TouchableOpacity>

                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#F5F5F5",
                      fontSize: 17,
                      fontWeight: "600",
                      fontFamily: brandFont ?? undefined,
                    }}
                  >
                    Pila
                  </Text>
                  <Text
                    style={{
                      color: "#9CA3AF",
                      fontSize: 11,
                      marginTop: 2,
                    }}
                  >
                    Assistente financeira
                  </Text>
                </View>

                <View style={{ width: 32, height: 32 }} />
              </View>
            </BlurView>
          </Animated.View>

          {/* MENSAGENS */}
          <ScrollView
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingTop: 80,
              paddingBottom: shouldShowChips ? 70 : 16,
              paddingHorizontal: 16,
              gap: 14,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && !loading && (
              <Animated.View entering={FadeInUp.duration(260)}>
                <PilaBubble
                  content={
                    "Oi, eu sou a Pila.\n\nPosso te ajudar a entender para onde seu dinheiro está indo, encontrar cortes inteligentes e projetar seus próximos meses.\n\nPor onde você quer começar?"
                  }
                />
              </Animated.View>
            )}

            {loading && messages.length === 0 && (
              <ActivityIndicator color="#FFFFFF" style={{ marginTop: 20 }} />
            )}

            {messages.map((m) =>
              m.role === "assistant" ? (
                <Animated.View key={m.id} entering={FadeInUp.duration(260)}>
                  <PilaBubble content={m.content} />
                </Animated.View>
              ) : (
                <Animated.View key={m.id} entering={FadeInUp.duration(260)}>
                  <UserBubble content={m.content} />
                </Animated.View>
              )
            )}

            {sending && (
              <Animated.View entering={FadeIn.duration(220)}>
                <TypingIndicator />
              </Animated.View>
            )}
          </ScrollView>

          {/* CHIPS FIXOS */}
          {shouldShowChips && (
            <Animated.View
              entering={FadeInUp.duration(260)}
              style={{
                paddingHorizontal: 12,
                paddingBottom: 6,
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingRight: 8,
                  gap: 8,
                }}
              >
                {suggestionChips.map((s) => (
                  <TouchableOpacity
                    key={s}
                    activeOpacity={0.9}
                    onPress={() => setInput(s)}
                    style={{
                      minWidth: 190,
                      maxWidth: 260,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 18,
                      backgroundColor: "rgba(24,24,24,0.95)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.12)",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#E5E5E5",
                        fontSize: 13,
                        lineHeight: 18,
                      }}
                      numberOfLines={2}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* INPUT FINAL */}
          <BlurView
            intensity={18}
            tint="dark"
            style={{
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.06)",
              backgroundColor: "rgba(12,12,12,0.96)",
              paddingHorizontal: 12,
              paddingBottom: Platform.OS === "ios" ? 8 : 8,
              paddingTop: 6,
            }}
          >
            <Animated.View style={animatedInputStyle}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 999,
                  backgroundColor: "rgba(22,22,22,0.95)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                  paddingHorizontal: 16,
                  height: 44,
                }}
              >
                {/* texto */}
                <TextInput
                  style={{
                    flex: 1,
                    color: "#F5F5F5",
                    fontSize: 15,
                  }}
                  placeholder="Pergunte alguma coisa..."
                  placeholderTextColor="#6B7280"
                  multiline
                  onFocus={() => animateInput(true)}
                  onBlur={() => animateInput(false)}
                  value={input}
                  onChangeText={setInput}
                  editable={isLogged && !sending}
                />

                {/* ESPAÇO DO MIC (removido mas preserva alinhamento) */}
                <View style={{ width: 28, height: 28, marginLeft: 8 }} />

                {/* enviar */}
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!input.trim() || sending || !isLogged}
                  activeOpacity={0.7}
                  style={{
                    marginLeft: 6,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor:
                      input.trim() && isLogged
                        ? "#F5F5F5"
                        : "rgba(255,255,255,0.14)",
                  }}
                >
                  {sending ? (
                    <ActivityIndicator
                      size="small"
                      color={input.trim() && isLogged ? "#000000" : "#D1D5DB"}
                    />
                  ) : (
                    <Icon
                      name="arrow-up"
                      size={15}
                      color={
                        input.trim() && isLogged ? "#000000" : "#9CA3AF"
                      }
                    />
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>

            <Text
              style={{
                marginTop: 6,
                color: "#4B5563",
                fontSize: 10.5,
                textAlign: "center",
              }}
            >
              A Pila ainda está em beta. Sempre confirme valores importantes.
            </Text>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// BUBBLES -----------------------------

function PilaBubble({ content }: { content: string }) {
  return (
    <View style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 16,
          backgroundColor: "#1A1A1A",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text
          style={{
            color: "#EEEEEE",
            fontSize: 15,
            lineHeight: 21,
          }}
        >
          {content}
        </Text>
      </View>
    </View>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <View style={{ alignSelf: "flex-end", maxWidth: "85%" }}>
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 16,
          backgroundColor: "#F5F5F5",
        }}
      >
        <Text
          style={{
            color: "#111111",
            fontSize: 15,
            lineHeight: 21,
          }}
        >
          {content}
        </Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={{ alignSelf: "flex-start", maxWidth: "70%" }}>
      <View
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 14,
          backgroundColor: "#1A1A1A",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <View style={{ flexDirection: "row", gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: "#9CA3AF",
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
