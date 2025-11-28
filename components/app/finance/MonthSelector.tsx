import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import Icon from "@/components/ui/Icon";
import { TimelineMonth } from "@/app/finance";

type Props = {
  months: TimelineMonth[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export default function MonthSelector({
  months,
  selectedIndex,
  onSelect,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const selected = months[selectedIndex];

  function handleChange(_: any, date?: Date) {
    if (!date) return;

    const month = date.getMonth();
    const year = date.getFullYear();

    // procura o mês correspondente
    const idx = months.findIndex(
      (m) =>
        m.year === year &&
        m.label.toLowerCase().includes(
          date.toLocaleDateString("pt-BR", { month: "short" }).slice(0, 3)
        )
    );

    if (idx !== -1) onSelect(idx);

    if (Platform.OS === "android") setShowPicker(false);
  }

  return (
    <View style={{ gap: 10 }}>
      {/* BOTÃO PRINCIPAL */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setShowPicker(true)}
        style={{
          borderRadius: 999,
          overflow: "hidden",
          borderWidth: 1,
          alignSelf: "flex-start",
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        <BlurView
          intensity={26}
          tint="dark"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="calendar-outline" size={14} color="#E5E7EB" />
          <Text
            style={{
              color: "#FFF",
              fontSize: 14,
              fontWeight: "500",
              textTransform: "capitalize",
            }}
          >
            {selected.label} {selected.year}
          </Text>
          <Icon
            name="chevron-down"
            size={14}
            color="rgba(156,163,175,0.95)"
            style={{ marginLeft: 4 }}
          />
        </BlurView>
      </TouchableOpacity>

      {/* PICKER NATIVO */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: "#111",
                  padding: 20,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: "#FFF",
                    textAlign: "center",
                    marginBottom: 10,
                    fontSize: 14,
                  }}
                >
                  Escolha mês e ano
                </Text>

                <DateTimePicker
                  value={new Date(selected.year, new Date().getMonth(), 1)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleChange}
                />

                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={{ marginTop: 12, padding: 12 }}
                  >
                    <Text
                      style={{
                        color: "#FFF",
                        fontSize: 16,
                        textAlign: "center",
                      }}
                    >
                      Concluir
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
