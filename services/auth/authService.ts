import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";

export async function signInWithGoogle() {
  const redirect = Linking.createURL("/auth/v1/callback");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirect,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  return supabase.auth.getUser();
}
