import { useEffect } from "react";
import { router } from "expo-router";

export default function MetaTab() {
  useEffect(() => {
    router.replace("/goals");
  }, []);

  return null;
}
