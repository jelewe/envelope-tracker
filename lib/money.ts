// lib/money.ts
export function formatCents(amountCents: number): string {
  const sign = amountCents < 0 ? "-" : "";
  const abs = Math.abs(amountCents);
  const dollars = Math.floor(abs / 100);
  const cents = abs % 100;
  return `${sign}$${dollars.toLocaleString()}.${cents.toString().padStart(2, "0")}`;
}

export function parseDollarsToCents(input: string): number {
  // Accepts "12", "12.3", "12.34"
  const trimmed = input.trim();
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) {
    throw new Error("Invalid amount. Use format like 12 or 12.34");
  }
  const [d, c = ""] = trimmed.split(".");
  const cents = Number((c + "00").slice(0, 2));
  return Number(d) * 100 + cents;
}