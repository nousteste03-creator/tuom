import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type LegalAcceptance = {
  accepted_terms_version: string;
  accepted_privacy_version: string;
  accepted_at: string;
};

export function useLegalAcceptances() {
  const [data, setData] = useState<LegalAcceptance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_legal_acceptances")
        .select(
          "accepted_terms_version, accepted_privacy_version, accepted_at"
        )
        .eq("user_id", user.id)
        .order("accepted_at", { ascending: false })
        .limit(1)
        .single();

      if (!error) {
        setData(data);
      }

      setLoading(false);
    };

    load();
  }, []);

  return { data, loading };
}
