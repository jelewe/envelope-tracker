// lib/selectors.ts
import { BudgetDocV1, UUID, YYYYMM } from "@/types/budget";

export function getAllocationCents(doc: BudgetDocV1, month: YYYYMM, envelopeId: UUID): number {
  const a = doc.allocations.find(x => x.month === month && x.envelopeId === envelopeId);
  return a?.amountCents ?? 0;
}

export function getSpentCents(doc: BudgetDocV1, month: YYYYMM, envelopeId: UUID): number {
  let spent = 0;

  for (const tx of doc.transactions) {
    if (tx.date.slice(0, 7) !== month) continue;

    if (tx.kind === "expense" && tx.envelopeId === envelopeId) {
      spent += tx.amountCents;
    }

    if (tx.kind === "transfer") {
      if (tx.fromEnvelopeId === envelopeId) spent += tx.amountCents; // leaving envelope
      if (tx.toEnvelopeId === envelopeId) spent -= tx.amountCents;   // entering envelope reduces "spent"
    }
  }

  return spent;
}

// Remaining = allocation - spent (spent includes net transfers)
export function getRemainingCents(doc: BudgetDocV1, month: YYYYMM, envelopeId: UUID): number {
  const alloc = getAllocationCents(doc, month, envelopeId);
  const spent = getSpentCents(doc, month, envelopeId);
  return alloc - spent;
}

export function getEnvelopeTransactions(doc: BudgetDocV1, month: YYYYMM, envelopeId: UUID) {
  return doc.transactions
    .filter(tx => tx.date.slice(0, 7) === month)
    .filter(tx => {
      if (tx.kind === "expense") return tx.envelopeId === envelopeId;
      return tx.fromEnvelopeId === envelopeId || tx.toEnvelopeId === envelopeId;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}