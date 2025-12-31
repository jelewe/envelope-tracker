"use client";

import { BudgetDocV1, Transaction, UUID, YYYYMM } from "@/types/budget";
import { formatCents } from "@/lib/money";
import { currentYYYYMM } from "@/lib/date";

export function TransactionList({
  doc,
  month,
  transactions,
  onDelete,
}: {
  doc: BudgetDocV1;
  month: YYYYMM;
  transactions: Transaction[];
  onDelete: (txId: UUID) => void;
}) {
  const isEditable = month === currentYYYYMM();

  const nameById = new Map(doc.categories.map(c => [c.id, c.name] as const));

  if (!transactions.length) {
    return <div className="text-sm text-gray-500">No transactions yet.</div>;
  }

  return (
    <div className="border rounded bg-white overflow-hidden mb-6">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left p-3">Date</th>
            <th className="text-left p-3">Type</th>
            <th className="text-left p-3">Details</th>
            <th className="text-right p-3">Amount</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => {
            let details = "";
            let amount = 0;

            if (tx.kind === "expense") {
              details = `${tx.payee ?? ""}${tx.memo ? ` — ${tx.memo}` : ""}`.trim() || nameById.get(tx.envelopeId) || "Expense";
              amount = tx.amountCents;
            } else {
              const from = nameById.get(tx.fromEnvelopeId) ?? "From";
              const to = nameById.get(tx.toEnvelopeId) ?? "To";
              details = `${from} → ${to}${tx.memo ? ` — ${tx.memo}` : ""}`;
              amount = tx.amountCents;
            }

            return (
              <tr key={tx.id} className="border-t">
                <td className="p-3 text-gray-600">{tx.date}</td>
                <td className="p-3 text-gray-600 capitalize">{tx.kind}</td>
                <td className="p-3 text-gray-600">{details}</td>
                <td className="p-3 text-right text-gray-600">{formatCents(amount)}</td>
                <td className="p-3 text-right text-gray-600">
                  {isEditable ? (
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => onDelete(tx.id)}
                    >
                      Delete
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}