// hooks/useSubscriptions.ts
import { useEffect, useState } from "react";
import { getUserSubscriptions } from "@/services/subscriptions";
import type { Subscription } from "@/types/subscriptions";

type Metrics = {
  monthlyTotal: number;
  annualTotal: number;
  upcomingRenewals: Subscription[];
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function computeMetrics(subs: Subscription[]): Metrics {
  let monthlyTotal = 0;

  for (const s of subs) {
    let factor = 1;

    switch (s.frequency) {
      case "monthly":
        factor = 1;
        break;
      case "yearly":
        factor = 1 / 12;
        break;
      case "weekly":
        factor = 4.345;
        break;
    }

    monthlyTotal += Number(s.price || 0) * factor;
  }

  const annualTotal = monthlyTotal * 12;

  const today = new Date();
  const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingRenewals = subs
    .filter((s) => {
      if (!s.next_billing) return false;
      const d = new Date(s.next_billing);
      return d >= startOfDay(today) && d <= endOfDay(in7);
    })
    .sort(
      (a, b) =>
        new Date(a.next_billing).getTime() -
        new Date(b.next_billing).getTime()
    );

  return { monthlyTotal, annualTotal, upcomingRenewals };
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [annualTotal, setAnnualTotal] = useState(0);
  const [upcomingRenewals, setUpcomingRenewals] = useState<Subscription[]>([]);

  async function load() {
    try {
      setLoading(true);

      const data = await getUserSubscriptions();
      setSubscriptions(data);

      const metrics = computeMetrics(data);
      setMonthlyTotal(metrics.monthlyTotal);
      setAnnualTotal(metrics.annualTotal);
      setUpcomingRenewals(metrics.upcomingRenewals);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return {
    subscriptions,
    monthlyTotal,
    annualTotal,
    upcomingRenewals,
    loading,
    error,
    reload: load,
  };
}
