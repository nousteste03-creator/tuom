import { useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function PublicIndex() {
  const router = useRouter();

  useEffect(() => {
    const decideInitialRoute = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (user) {
        router.replace("/home");
      } else {
        router.replace("/lobby");
      }
    };

    decideInitialRoute();
  }, []);

  return null;
}
