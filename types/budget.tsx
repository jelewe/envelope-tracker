// types/budget.ts

export type YYYYMM = `${number}${number}${number}${number}-${number}${number}`; // "2025-12"
export type ISODate = string; // "2025-12-20" 
export type UUID = string;

export interface EnvelopeCategory {
  id: UUID;
  name: string;
  sortOrder: number;
  archived: boolean;
}

export interface MonthlyAllocation {
  month: YYYYMM;
  envelopeId: UUID;
  amountCents: number; // how much you planned for this envelope this month
}

export type TransactionKind = "expense" | "transfer";

export interface ExpenseTransaction {
  id: UUID;
  kind: "expense";
  date: ISODate; // date-only; month is derived from this
  envelopeId: UUID; // REQUIRED (no unassigned)
  payee?: string;
  memo?: string;
  amountCents: number; // positive number (spent)
  createdAt: string; // ISO datetime for auditing
}

export interface TransferTransaction {
  id: UUID;
  kind: "transfer";
  date: ISODate;
  fromEnvelopeId: UUID;
  toEnvelopeId: UUID;
  amountCents: number; // positive amount moved
  memo?: string;
  createdAt: string;
}

export type Transaction = ExpenseTransaction | TransferTransaction;

export interface BudgetDocV1 {
  version: 1;
  categories: EnvelopeCategory[];
  allocations: MonthlyAllocation[];
  transactions: Transaction[];
  settings: {
    lockPastMonths: true;
  };
}

