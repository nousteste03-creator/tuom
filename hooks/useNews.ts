// /hooks/useNews.ts
import { useEffect, useState } from "react";
import { fetchNews, RemoteNewsItem } from "@/lib/api/news";

export function useNews(query: string) {
  const [news, setNews] = useState<RemoteNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchNews(query);
        if (!cancelled) setNews(data);
      } catch {
        if (!cancelled) setNews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return { news, loading };
}
