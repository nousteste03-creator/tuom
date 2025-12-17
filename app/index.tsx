import { useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const decideRoute = async () => {
      try {
        // 1️⃣ Busca sessão local
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.warn("[auth-gate] getSession error:", sessionError.message);
          router.replace("/lobby");
          return;
        }

        const session = sessionData.session;

        if (!session) {
          console.log("[auth-gate] no session → lobby");
          router.replace("/lobby");
          return;
        }

        // 2️⃣ Valida usuário REAL no backend
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData?.user) {
          console.warn("[auth-gate] invalid user → signOut");
          await supabase.auth.signOut();
          router.replace("/lobby");
          return;
        }

        // 3️⃣ Sessão válida + usuário existe
        console.log("[auth-gate] valid session → home");
        router.replace("/home");
      } catch (err) {
        console.error("[auth-gate] fatal error:", err);
        router.replace("/lobby");
      }
    };

    decideRoute();
  }, [router]);

  return null;
}
