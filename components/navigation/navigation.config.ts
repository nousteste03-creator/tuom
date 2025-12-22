export type NavigationCard = {
  id: string;
  title: string;
  description?: string;
  route?: string;
  type: "primary" | "basic";
  fullWidth?: boolean;
};

export const PRIMARY_CARDS: NavigationCard[] = [
  {
    id: "home",
    title: "Home",
    description: "Visão geral da sua vida financeira",
    route: "/home",
    type: "primary",
  },
  {
    id: "subscriptions",
    title: "Assinaturas",
    description: "Controle de serviços e recorrências",
    route: "/subscriptions",
    type: "primary",
  },
  {
    id: "goals",
    title: "Metas",
    description: "Objetivos, dívidas e investimentos",
    route: "/goals",
    type: "primary",
  },
  {
    id: "insights",
    title: "Insights",
    description: "Leituras e análises financeiras",
    route: "/insights",
    type: "primary",
  },
  {
    id: "finance",
    title: "Finance",
    description: "Organização financeira avançada",
    route: "/finance",
    type: "primary",
    fullWidth: true,
  },
];

export const BASIC_CARDS: NavigationCard[] = [
  {
    id: "pila",
    title: "Pila",
    description: "Assistente financeiro",
    route: "/pila",
    type: "basic",
  },
  {
    id: "notifications",
    title: "Notificações",
    description: "Alertas e novidades",
    route: "/notifications",
    type: "basic",
  },
  {
    id: "settings",
    title: "Configurações",
    description: "Preferências do app",
    route: "/settings",
    type: "basic",
  },
  {
    id: "subscription",
    title: "TUÖM PRO",
    description: "Assinatura e plano",
    route: "/home/subscription",
    type: "basic",
  },
];
