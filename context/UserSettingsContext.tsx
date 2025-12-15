import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

/* ============================================================
   TIPOS
============================================================ */

export type UserSettings = {
  operation_mode: "manual" | "automatic";

  notifications_enabled: boolean;
  silent_mode: boolean;
  notification_time: string;

  notify_subscription_due: boolean;
  notify_subscription_today: boolean;
  notify_subscription_price_change: boolean;

  notify_budget_limit: boolean;
  notify_budget_exceeded: boolean;

  notify_goal_delayed: boolean;
  notify_goal_completed: boolean;
  notify_installment_due: boolean;
  notify_installment_overdue: boolean;

  notify_income_today: boolean;
  notify_income_delayed: boolean;

  smart_insights_daily: boolean;
  smart_insights_weekly: boolean;

  month_close_day: number;
  consider_investments_in_cashflow: boolean;
};

type Ctx = {
  settings: UserSettings | null;
  loading: boolean;
  updateSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => Promise<void>;
  refreshSettings: () => Promise<void>;
};

/* ============================================================
   CONTEXT
============================================================ */

const UserSettingsContext = createContext<Ctx>({
  settings: null,
  loading: true,
  updateSetting: async () => {},
  refreshSettings: async () => {},
});

/* ============================================================
   PROVIDER
============================================================ */

export function UserSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------
     LOAD REAL — SEM LOOP
  ------------------------------------------------------------- */
  const loadSettings = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_settings")
      .select(
        `
        operation_mode,
        notifications_enabled,
        silent_mode,
        notification_time,

        notify_subscription_due,
        notify_subscription_today,
        notify_subscription_price_change,

        notify_budget_limit,
        notify_budget_exceeded,

        notify_goal_delayed,
        notify_goal_completed,
        notify_installment_due,
        notify_installment_overdue,

        notify_income_today,
        notify_income_delayed,

        smart_insights_daily,
        smart_insights_weekly,

        month_close_day,
        consider_investments_in_cashflow
      `
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setSettings(data as UserSettings);
    }

    setLoading(false);
  };

  /* ------------------------------------------------------------
     INIT + AUTH LISTENER
  ------------------------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await loadSettings();
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session?.user) loadSettings();
        else {
          setSettings(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /* ------------------------------------------------------------
     UPDATE SIMPLES (1 CAMPO)
  ------------------------------------------------------------- */
  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!settings) return;

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    setSettings((prev) =>
      prev ? { ...prev, [key]: value } : prev
    );

    await supabase
      .from("user_settings")
      .update({ [key]: value })
      .eq("user_id", user.id);
  };

  /* ------------------------------------------------------------
     VALUE MEMOIZADO
  ------------------------------------------------------------- */
  const value = useMemo(
    () => ({
      settings,
      loading,
      updateSetting,
      refreshSettings: loadSettings,
    }),
    [settings, loading]
  );

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
}

/* ============================================================
   HOOK
============================================================ */

export function useUserSettings() {
  return useContext(UserSettingsContext);
}
