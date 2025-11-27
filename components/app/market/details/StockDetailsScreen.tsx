import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Mock temporário (vamos substituir pela API do FMP depois)
const MOCK_COMPANY = {
  price: 192.21,
  changePct: 1.2,
  summary: [
    "Ações sobem após relatório sólido.",
    "Volume acima da média.",
    "Analistas revisam alvo para US$ 210.",
  ],
  indicators: {
    marketCap: "US$ 2.9T",
    pe: "29.8",
    divYield: "0.55%",
    volume: "57M",
  },
  news: [
    {
      id: "1",
      source: "TechCrunch",
      time: "2h",
      headline: "Apple anuncia avanço significativo em chips sob medida.",
    },
    {
      id: "2",
      source: "Reuters",
      time: "4h",
      headline: "AAPL mantém estabilidade mesmo após volatilidade do setor.",
    },
  ],
};

export default function StockDetailsScreen({ ticker }: { ticker: string }) {
  const isPositive = MOCK_COMPANY.changePct >= 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.headerTitle}>{ticker}</Text>
          </View>

          <View style={{ width: 30 }} />
        </View>

        {/* PRICE */}
        <View style={styles.priceBlock}>
          <Text style={styles.priceValue}>
            US$ {MOCK_COMPANY.price.toFixed(2)}
          </Text>
          <Text
            style={[
              styles.priceChange,
              isPositive ? styles.positive : styles.negative,
            ]}
          >
            {isPositive ? "+" : ""}
            {MOCK_COMPANY.changePct}%
          </Text>
        </View>

        {/* CHART PLACEHOLDER */}
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>[ Gráfico 7 dias ]</Text>
        </View>

        {/* RESUMO DO DIA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do dia</Text>

          <View style={styles.summaryList}>
            {MOCK_COMPANY.summary.map((item, idx) => (
              <Text key={idx} style={styles.summaryItem}>
                • {item}
              </Text>
            ))}
          </View>
        </View>

        {/* INDICADORES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores</Text>

          <View style={styles.indicatorsCard}>
            <Row label="Market Cap" value={MOCK_COMPANY.indicators.marketCap} />
            <Row label="P/L" value={MOCK_COMPANY.indicators.pe} />
            <Row label="Dividend Yield" value={MOCK_COMPANY.indicators.divYield} />
            <Row label="Volume 24h" value={MOCK_COMPANY.indicators.volume} />
          </View>
        </View>

        {/* NOTÍCIAS DA EMPRESA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notícias da empresa</Text>

          {MOCK_COMPANY.news.map((n) => (
            <View key={n.id} style={styles.newsCard}>
              <View style={styles.newsHeader}>
                <Text style={styles.newsSource}>{n.source}</Text>
                <Text style={styles.newsTime}>{n.time}</Text>
              </View>
              <Text style={styles.newsHeadline}>{n.headline}</Text>
            </View>
          ))}
        </View>

        {/* PILA (PRO) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights da Pila (Pro)</Text>

          <View style={styles.pilaLocked}>
            <Ionicons name="lock-closed-outline" size={20} color="#fff" />
            <Text style={styles.pilaLockedText}>
              A Pila preparou uma análise avançada deste ativo.
            </Text>
            <Text style={styles.pilaLockedSub}>
              Assine o Pro para desbloquear.
            </Text>
          </View>
        </View>

        {/* BUTTON */}
        <TouchableOpacity style={styles.watchButton} activeOpacity={0.85}>
          <Text style={styles.watchText}>Adicionar aos monitorados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* COMPONENTE AUXILIAR */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050507" },

  scroll: { paddingHorizontal: 20 },

  header: {
    marginTop: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },

  priceBlock: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  priceChange: {
    fontSize: 16,
    marginTop: 4,
  },

  positive: { color: "#4ECB71" },
  negative: { color: "#FF5C5C" },

  chartPlaceholder: {
    height: 160,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  chartText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },

  summaryList: {
    gap: 4,
  },
  summaryItem: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },

  indicatorsCard: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLabel: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  rowValue: { color: "#fff", fontSize: 14, fontWeight: "600" },

  newsCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 12,
  },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  newsSource: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  newsTime: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  newsHeadline: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  pilaLocked: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    gap: 6,
  },
  pilaLockedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  pilaLockedSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },

  watchButton: {
    backgroundColor: "#8A8FFF",
    paddingVertical: 12,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  watchText: {
    color: "#050507",
    fontWeight: "600",
    fontSize: 14,
  },
});
