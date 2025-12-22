import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import Animated, {
  FadeInUp,
  Easing,
} from "react-native-reanimated";
import Icon from "@/components/ui/Icon";

const { width } = Dimensions.get("window");

const CARD_HEIGHT = 118;

export default function MenuScreen() {
  const router = useRouter();
  const isProUser = false;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.title}>Menu</Text>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {[
          {
            title: "Início",
            subtitle: "Visão geral da sua vida financeira",
            route: "/home",
          },
          {
            title: "Assinaturas",
            subtitle: "Planos, cobranças e upgrades",
            route: "/subscriptions",
          },
          {
            title: "Metas",
            subtitle: "Objetivos, dívidas e investimentos",
            route: "/goals",
          },
          {
            title: "Insights",
            subtitle: "Análises e leituras da PILA",
            route: "/insights",
          },
          {
            title: "Finanças",
            subtitle: isProUser
              ? "Controle financeiro completo"
              : "Recurso avançado (PRO)",
            route: "/finance",
            badge: !isProUser ? "PRO" : undefined,
          },
          {
            title: "Notificações",
            subtitle: "Alertas, notícias e lembretes",
            route: "/notifications",
          },
          {
            title: "Configurações",
            subtitle: "Preferências, privacidade e conta",
            route: "/home/settings",
          },
          {
            title: isProUser ? "Assinatura" : "TUÖM PRO",
            subtitle: isProUser
              ? "Plano e pagamentos"
              : "Desbloqueie recursos avançados",
            route: "home/subscription",
            highlight: true,
          },
        ].map((item, index) => (
          <Animated.View
            key={item.title}
            entering={FadeInUp
              .delay(120 + index * 70)
              .duration(380)
              .easing(Easing.bezier(0.22, 1, 0.36, 1))}
          >
            <MenuCard
              title={item.title}
              subtitle={item.subtitle}
              badge={item.badge}
              highlight={item.highlight}
              onPress={() => router.push(item.route)}
            />
          </Animated.View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

function MenuCard({
  title,
  subtitle,
  onPress,
  badge,
  highlight,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress}>
      <View style={styles.cardWrapper}>
        <BlurView
          intensity={highlight ? 26 : 18}
          tint="dark"
          style={[styles.card, highlight && styles.cardHighlight]}
        >
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </BlurView>
      </View>
    </TouchableOpacity>
  );
}

/* --------------------------------
   STYLES
--------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: 20,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 34,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },

  list: {
    paddingBottom: 56,
  },

  cardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },

  card: {
    height: CARD_HEIGHT,
    width: width - 40,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 20,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  cardHighlight: {
    backgroundColor: "rgba(255,255,255,0.085)",
    borderColor: "rgba(255,255,255,0.18)",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.2,
  },

  cardSubtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: "rgba(255,255,255,0.72)",
    maxWidth: "85%",
  },

  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: 0.3,
  },
});
