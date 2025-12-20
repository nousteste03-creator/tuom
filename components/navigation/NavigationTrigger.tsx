import { Pressable } from "react-native";
import Icon from "@/components/ui/Icon";
import { useNavigationOverlay } from "./useNavigationOverlay";

export default function NavigationTrigger() {
  const { toggle } = useNavigationOverlay();

  return (
    <Pressable
      onPress={toggle}
      style={{
        padding: 10,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Icon name="menu" size={22} color="#FFFFFF" />
    </Pressable>
  );
}
