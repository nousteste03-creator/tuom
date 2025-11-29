// lib/formatters.ts

export function formatCurrency(value: number): string {
  if (isNaN(value)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatMonthLong(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export function formatMonthShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
}
