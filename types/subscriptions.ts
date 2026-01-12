export type Subscription = {
  id: string;
  user_id: string;
  service: string;
  price: number;
  frequency: "monthly" | "yearly" | "weekly";
  next_billing: string;
  created_at: string;
  category?: string | null;
};
