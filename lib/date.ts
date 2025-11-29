// lib/date.ts

// Retorna YYYY-MM atual
export function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Converte YYYY-MM para Date seguro
export function monthToDate(month: string): Date {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

// Formata YYYY-MM para "Março 2025"
export function formatMonthLabel(month: string): string {
  const d = monthToDate(month);
  return d.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

// Voltar 1 mês (YYYY-MM)
export function prevMonth(month: string): string {
  const d = monthToDate(month);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Avançar 1 mês (YYYY-MM)
export function nextMonth(month: string): string {
  const d = monthToDate(month);
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
