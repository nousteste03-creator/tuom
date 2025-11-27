import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useOpenFinance() {
  const [connected, setConnected] = useState(false);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("openfinance_connections")
      .select("*");

    setProviders(data ?? []);
    setConnected((data?.length ?? 0) > 0);
  }

  return { connected, providers };
}
