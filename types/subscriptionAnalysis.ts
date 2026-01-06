export interface SubscriptionAnalysis {
  id: string;

  monthly_total: number;
  annual_total: number;
  subscriptions_count: number;
  impact_score: number;

  subscriptions: SubscriptionItem[];
}

export interface SubscriptionItem {
  id: string;

  name: string;
  category: string;

  monthly_cost: number;
  annual_cost: number;

  billing_cycle: "monthly" | "annual" | "irregular";
  price_stability: "stable" | "variable" | "increasing";

  increase_risk_score: number;
  market_signal: "positive" | "neutral" | "negative";

  insight?: string;
}
