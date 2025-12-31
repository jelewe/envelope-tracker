import { ISODate, YYYYMM } from "@/types/budget";;

export function prevYYYYMM(month: YYYYMM): YYYYMM {
  const [yStr, mStr] = month.split("-");
  const y = Number(yStr);
  const m = Number(mStr);

  if (m === 1) {
    return `${y - 1}-12` as YYYYMM;
  }

  const mm = String(m - 1).padStart(2, "0");
  return `${y}-${mm}` as YYYYMM;
}

export function toYYYYMM(date: ISODate): YYYYMM {
  return date.slice(0, 7) as YYYYMM;
}

export function currentYYYYMM(): YYYYMM {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}` as YYYYMM;
}

export function formatMMYY(month: YYYYMM): string {
  const [year, m] = month.split("-");
  return `${m}/${year.slice(2)}`;
}

export function todayISODate(): ISODate {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isPastMonth(month: YYYYMM, current: YYYYMM): boolean {
  return month < current; // works lexicographically for YYYY-MM
}

export function isYYYYMM(value: string): value is YYYYMM {
  return /^\d{4}-\d{2}$/.test(value);
}