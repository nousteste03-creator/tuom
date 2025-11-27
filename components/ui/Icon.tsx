// components/ui/Icon.tsx
import { Ionicons } from "@expo/vector-icons";

interface Props {
  name: string;
  size?: number;
  color?: string;
}

export default function Icon({ name, size = 22, color = "#FFFFFF" }: Props) {
  return <Ionicons name={name as any} size={size} color={color} />;
}
