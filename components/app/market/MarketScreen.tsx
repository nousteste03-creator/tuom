import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type StockItem = {
  id: string;
  ticker: string;
  name: string;
  price: number;
  changePct: number;
  headline?: string;
};

const MOCK_WINNERS = [
  { id: "1", ticker: "NVDA", changePct: 3.8 },
  { id: "2", ticker: "AAPL", changePct: 2.7 },
  { id: "3", ticker: "AMZN", changePct: 2.5 },
];

const MOCK_LOSERS = [
  { id: "4", ticker: "TSLA", changePct: -2.1 },
  { id: "5", ticker: "META", changePct: -1.9 },
  { id: "6", ticker: "NFLX", changePct: -1.5 },
];

const MOCK_STOCKS: StockItem[] = [
  {
    id: "1",
    ticker: "AAPL",
    name: "Apple",
    price: 192.21,
    changePct: 1.2,
    headline: "Mercado reage ao novo relatório de resultados.",
  },
  {
    id: "2",
    ticker: "TSLA",
    name: "Tesla",
    price: 241.92,
    changePct: -0.8,
    headline: "Investidores aguardam guidance anual.",
  },
  {
    id: "3",
    ticker: "NVDA",
    name: "Nvidia",
    price: 875.12,
    changePct: 3.1,
    headline: "IA impulsiona receita trimestral.",
  },
];

export default function MarketScreen() {
  const [query, setQuery] = useState("");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mercado & Ações</Text>
          <Text style={styles.headerSubtitle}>
            Dados atualizados há 15 min
          </Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#777" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar empresas ou tickers"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* TOP WINNERS & LOSERS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top do dia</Text>

          <View style={styles.wlRow}>
            <View style={styles.wlColumn}>
              <Text style={styles.wlTitle}>Winners</Text>
              {MOCK_WINNERS.map((item) => (
                <View key={item.id} style={styles.wlItem}>
                  <Text style={styles.wlTicker}>{item.ticker}</Text>
                  <Text style={[styles.wlChange, styles.positive]}>
                    +{item.changePct}%
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.wlColumn}>
              <Text style={styles.wlTitle}>Losers</Text>
              {MOCK_LOSERS.map((item) => (
                <View key={item.id} style={styles.wlItem}>
                  <Text style={styles.wlTicker}>{item.ticker}</Text>
                  <Text style={[styles.wlChange, styles.negative]}>
                    {item.changePct}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* STOCK LIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações em destaque</Text>

          <View style={{ gap: 12 }}>
            {MOCK_STOCKS.map((stock) => {
              const isPositive = stock.changePct >= 0;

              return (
                <TouchableOpacity
                  key={stock.id}
                  style={styles.stockCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push(`/market/${stock.ticker.toLowerCase()}`)
                  }
                >
                  <View style={styles.stockRow}>
                    <View style={styles.stockIcon}>
                      <Text style={styles.stockIconText}>
                        {stock.ticker[0]}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.stockName}>{stock.name}</Text>
                      <Text style={styles.stockTicker}>{stock.ticker}</Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.stockPrice}>
                        US$ {stock.price.toFixed(2)}
                      </Text>
                      <Text
                        style={[
                          styles.stockChange,
                          isPositive ? styles.positive : styles.negative,
                        ]}
                      >
                        {isPositive ? "+" : ""}
                        {stock.changePct}%
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.stockHeadline}
                    numberOfLines={2}
                  >
                    {stock.headline}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* PRO SECTION */}
        <View style={styles.section}>
          <Text style={styles.proTitle}>Insights avançados (Pro)</Text>

          <View style={styles.proCard}>
            <Text style={styles.proText}>
              A Pila analisou padrões dos últimos 30 dias:
            </Text>
            <Text style={styles.proBullet}>• Volatilidade aumentou</Text>
            <Text style={styles.proBullet}>• Tendência de médio prazo positiva</Text>
            <Text style={styles.proBullet}>• Recomenda atenção ao mercado</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050507",
  },
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 24,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },

  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },

  wlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  wlColumn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginRight: 10,
    gap: 6,
  },
  wlTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 6,
  },
  wlItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  wlTicker: {
    color: "#fff",
    fontSize: 14,
  },
  wlChange: {
    fontSize: 14,
    fontWeight: "600",
  },

  stockCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  stockIconText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  stockName: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  stockTicker: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  stockPrice: {
    fontSize: 14,
    color: "#fff",
  },
  stockChange: {
    fontSize: 13,
    fontWeight: "600",
  },
  stockHeadline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },

  positive: { color: "#4ECB71" },
  negative: { color: "#FF5C5C" },

  proTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  proCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  proText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 10,
  },
  proBullet: {
    fontSize: 13,
    color: "#fff",
    marginBottom: 4,
  },
});
