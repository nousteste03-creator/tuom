export type CategoryType = "expense" | "income" | "goal";

export interface Category {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: CategoryType;
  created_at: string;
  updated_at: string;
}
