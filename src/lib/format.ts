export function formatCurrency(amount: number) {
  const formatted = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
  // Real minus sign, as the design system asks for.
  return formatted.replace(/^-/, "−");
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** yyyy-mm-dd in local time, for <input type="date">. */
export function toDateInput(date: Date | string = new Date()) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** A date-input value as a Date at local noon, so timezones never push it onto the next/previous day. */
export function fromDateInput(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export const ACCOUNT_KINDS = ["BANK", "SAVINGS", "WALLET", "CASH"] as const;

export const ACCOUNT_KIND_LABELS: Record<string, string> = {
  BANK: "Bank account",
  SAVINGS: "Savings",
  WALLET: "Mobile wallet",
  CASH: "Cash",
};
