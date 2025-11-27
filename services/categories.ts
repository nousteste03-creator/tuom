import { supabase } from "@/lib/supabase";
import type { Category } from "@/types/categories";

export async function getUserCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(category: {
  title: string;
  amount: number;
  type: "expense" | "income" | "goal";
}): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(category: Category): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update({
      title: category.title,
      amount: category.amount,
      type: category.type,
    })
    .eq("id", category.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
