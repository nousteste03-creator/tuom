export async function fetchNews(query: string) {
  const res = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/news-fetch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) return [];

  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

export async function fetchNewsDetail(url: string) {
  const res = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/news-scrape`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ url }),
    }
  );

  if (!res.ok) return null;
  return res.json();
}
