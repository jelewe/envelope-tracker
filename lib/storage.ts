// lib/storage.ts
import { BudgetDocV1 } from "@/types/budget";

const STORAGE_KEY = "envelopeBudget:v1";

export function loadBudgetDoc(): BudgetDocV1 {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const empty: BudgetDocV1 = {
      version: 1,
      categories: [],
      allocations: [],
      transactions: [],
      settings: { lockPastMonths: true },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
    return empty;
  }

  const parsed = JSON.parse(raw) as BudgetDocV1;
  if (!parsed || parsed.version !== 1) {
    throw new Error("Unsupported budget schema version.");
  }

  return parsed;
}

export function saveBudgetDoc(doc: BudgetDocV1): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
}

export function exportBudgetDoc(): string {
  const doc = loadBudgetDoc();
  return JSON.stringify(doc, null, 2);
}

export function importBudgetDoc(json: string): BudgetDocV1 {
  const parsed = JSON.parse(json) as BudgetDocV1;
  if (!parsed || parsed.version !== 1) {
    throw new Error("Import failed: unsupported schema version.");
  }
  saveBudgetDoc(parsed);
  return parsed;
}