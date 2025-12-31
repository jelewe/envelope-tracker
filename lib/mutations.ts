import { assertEditableMonth } from "@/lib/guards";
import { currentYYYYMM, toYYYYMM } from "@/lib/date";
import { BudgetDocV1, UUID, YYYYMM, Transaction } from "@/types/budget";

export function upsertCategory(doc: BudgetDocV1, input: { id?: UUID; name: string }): BudgetDocV1 {
  const name = input.name.trim();
  if (!name) throw new Error("Category name required.");

  // If id is provided and doesn't exist, create with that id
  if (input.id && !doc.categories.some(c => c.id === input.id)) {
    const sortOrder = doc.categories.length ? Math.max(...doc.categories.map(c => c.sortOrder)) + 1 : 1;
    return {
      ...doc,
      categories: [...doc.categories, { id: input.id, name, sortOrder, archived: false }],
    };
  }

  // No id provided => create new id
  if (!input.id) {
    const id = crypto.randomUUID();
    const sortOrder = doc.categories.length ? Math.max(...doc.categories.map(c => c.sortOrder)) + 1 : 1;
    return {
      ...doc,
      categories: [...doc.categories, { id, name, sortOrder, archived: false }],
    };
  }

  // Existing => update name
  return {
    ...doc,
    categories: doc.categories.map(c => (c.id === input.id ? { ...c, name } : c)),
  };
}

export function setMonthlyAllocation(doc: BudgetDocV1, month: YYYYMM, envelopeId: UUID, amountCents: number): BudgetDocV1 {
  assertEditableMonth(month);

  const existing = doc.allocations.find(a => a.month === month && a.envelopeId === envelopeId);
  if (!existing) {
    return { ...doc, allocations: [...doc.allocations, { month, envelopeId, amountCents }] };
  }

  return {
    ...doc,
    allocations: doc.allocations.map(a =>
      a.month === month && a.envelopeId === envelopeId ? { ...a, amountCents } : a
    ),
  };
}

export function addTransaction(doc: BudgetDocV1, tx: Transaction): BudgetDocV1 {
  const month = toYYYYMM(tx.date);
  assertEditableMonth(month);

  // No unassigned (enforced by type), no income (no kind)
  if (tx.kind === "transfer" && tx.fromEnvelopeId === tx.toEnvelopeId) {
    throw new Error("Transfer envelopes must be different.");
  }

  return { ...doc, transactions: [...doc.transactions, tx] };
}

export function deleteTransaction(doc: BudgetDocV1, txId: UUID): BudgetDocV1 {
  const tx = doc.transactions.find(t => t.id === txId);
  if (!tx) return doc;

  assertEditableMonth(toYYYYMM(tx.date));

  return { ...doc, transactions: doc.transactions.filter(t => t.id !== txId) };
}

export function deleteEnvelope(doc: BudgetDocV1, envelopeId: UUID): BudgetDocV1 {
  const cur = currentYYYYMM();

  // If envelope has ANY history in past months, block deletion
  const hasPastAlloc = doc.allocations.some(a => a.envelopeId === envelopeId && a.month < cur);

  const hasPastTx = doc.transactions.some(tx => {
    const m = tx.date.slice(0, 7);
    if (m >= cur) return false;

    if (tx.kind === "expense") return tx.envelopeId === envelopeId;
    return tx.fromEnvelopeId === envelopeId || tx.toEnvelopeId === envelopeId;
  });

  if (hasPastAlloc || hasPastTx) {
    throw new Error("Cannot delete: this envelope has history in past months. Archive it instead.");
  }

  return {
    ...doc,
    categories: doc.categories.filter(c => c.id !== envelopeId),
    allocations: doc.allocations.filter(a => a.envelopeId !== envelopeId),
    transactions: doc.transactions.filter(tx => {
      if (tx.kind === "expense") return tx.envelopeId !== envelopeId;
      return tx.fromEnvelopeId !== envelopeId && tx.toEnvelopeId !== envelopeId;
    }),
  };
}

export function setEnvelopeArchived(doc: BudgetDocV1, envelopeId: UUID, archived: boolean): BudgetDocV1 {
  const exists = doc.categories.some(c => c.id === envelopeId);
  if (!exists) throw new Error("Envelope not found.");

  return {
    ...doc,
    categories: doc.categories.map(c =>
      c.id === envelopeId ? { ...c, archived } : c
    ),
  };
}