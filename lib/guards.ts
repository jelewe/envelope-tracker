// lib/guards.ts
import { YYYYMM } from "@/types/budget";
import { currentYYYYMM, isPastMonth } from "@/lib/date";

export function assertEditableMonth(month: YYYYMM): void {
  const cur = currentYYYYMM();
  if (isPastMonth(month, cur)) {
    throw new Error("Past months are locked and cannot be edited.");
  }
}