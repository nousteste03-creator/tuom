// lib/api/market.ts

export type CryptoQuote = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
};

export type StockQuote = {
  symbol: string;
  name: string;
  price: number;
  change: number; // variação diária %
};

/* ================================
   CONFIG
================================ */

const COINGECKO =
  "https://api.coingecko.com/api/v3/simple/price";

const AV_BASE = "https://www.alphavantage.co/query";
const AV_KEY = process.env.EXPO_PUBLIC_ALPHA_KEY;

// 5 criptos principais
const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
];

// ações principais EUA
const STOCK_SYMBOLS = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"];

/* ================================
   FETCH CRYPTO — CoinGecko
================================ */

async function fetchCrypto(): Promise<CryptoQuote[]> {
  try {
    const ids = COINS.map((c) => c.id).join(",");

    const url = `${COINGECKO}?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

    const res = await fetch(url);
    const json = await res.json();

    return COINS.map((c) => {
      const d = json[c.id];
      return {
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        price: d?.usd ?? 0,
        change24h: d?.usd_24h_change ?? 0,
      };
    });
  } catch (err) {
    console.log("CRYPTO FETCH ERROR:", err);
    return [];
  }
}

/* ================================
   FETCH STOCKS — AlphaVantage
================================ */
async function fetchStocks(): Promise<StockQuote[]> {
  if (!AV_KEY) {
    return [
      { symbol: "AAPL", name: "Apple", price: 0, change: 1.2 },
      { symbol: "TSLA", name: "Tesla", price: 0, change: -0.8 },
      { symbol: "NVDA", name: "Nvidia", price: 0, change: 3.1 },
    ];
  }

  try {
    const results: StockQuote[] = [];

    for (const sym of STOCK_SYMBOLS) {
      const url = `${AV_BASE}?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${AV_KEY}`;
      const res = await fetch(url);
      const json = await res.json();

      const data = json["Global Quote"];
      if (!data) continue;

      results.push({
        symbol: sym,
        name: sym,
        price: Number(data["05. price"]) || 0,
        change: Number(data["10. change percent"]?.replace("%", "")) || 0,
      });
    }

    return results;
  } catch (err) {
    console.log("STOCK FETCH ERROR:", err);
    return [
      { symbol: "AAPL", name: "Apple", price: 0, change: 1.2 },
      { symbol: "TSLA", name: "Tesla", price: 0, change: -0.8 },
      { symbol: "NVDA", name: "Nvidia", price: 0, change: 3.1 },
    ];
  }
}

/* ================================
   FINAL EXPORT
================================ */
export async function fetchMarket(): Promise<{
  crypto: CryptoQuote[];
  stocks: StockQuote[];
}> {
  const [crypto, stocks] = await Promise.all([
    fetchCrypto(),
    fetchStocks(),
  ]);

  return { crypto, stocks };
}
