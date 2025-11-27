// components/app/common/NativeDatePicker.tsx
import { useState } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  value: Date;
  onChange: (newDate: Date) => void;
};

export function NativeDatePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  function handleChange(_: any, selected?: Date) {
    if (Platform.OS === "android") {
      setOpen(false);
    }

    if (selected) {
      const newDate = new Date(value);
      newDate.setMonth(selected.getMonth());
      newDate.setFullYear(selected.getFullYear());
      onChange(newDate);
    }
  }

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.14)",
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 14 }}>
          {value.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
        </Text>
      </TouchableOpacity>

      {/* iOS modal */}
      {Platform.OS === "ios" && (
        <Modal visible={open} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.45)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: "#111",
                paddingTop: 12,
                paddingBottom: 40,
                borderTopLeftRadius: 26,
                borderTopRightRadius: 26,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.14)",
              }}
            >
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={{
                  alignSelf: "flex-end",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: "#A5B4FC", fontSize: 15 }}>Fechar</Text>
              </TouchableOpacity>

              <DateTimePicker
                value={value}
                mode="date"
                display="spinner"
                onChange={handleChange}
                locale="pt-BR"
                style={{ backgroundColor: "#111" }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android popup */}
      {Platform.OS === "android" && open && (
        <DateTimePicker
          value={value}
          mode="date"
          display="calendar"
          onChange={handleChange}
          locale="pt-BR"
        />
      )}
    </View>
  );
}
