"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useBudget } from "@/hooks/useBudget";
import { addTransaction } from "@/lib/mutations";
import { currentYYYYMM, todayISODate } from "@/lib/date";
import { parseDollarsToCents } from "@/lib/money";
import { Transaction, YYYYMM } from "@/types/budget";

export default function NewTransactionClient({ month }: { month: YYYYMM }) {
  const { doc, commit } = useBudget();
  const editable = month === currentYYYYMM();

  const categories = useMemo(() => {
    if (!doc) return [];
    return [...doc.categories]
      .filter((c) => !c.archived)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [doc]);

  const canTransfer = categories.length >= 2;
  const [kind, setKind] = useState<"expense" | "transfer">("expense");
  const [date, setDate] = useState(todayISODate());
  const [amount, setAmount] = useState("");
  const [envelopeId, setEnvelopeId] = useState("");
  const [fromEnvelopeId, setFromEnvelopeId] = useState("");
  const [toEnvelopeId, setToEnvelopeId] = useState("");
  const [payee, setPayee] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar month={month} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-xl text-emerald-600 font-semibold mb-4">Add Transaction</h1>

        {!editable && (
          <div className="mb-4 p-3 rounded border bg-white text-sm text-gray-700">
            Past months are view-only. Switch to the current month to add transactions.
          </div>
        )}

        <div className="border rounded p-4 bg-white space-y-4">
          {/* Type + Date */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">Type</label>
              <select
                className="w-full border rounded px-3 py-2 text-gray-600"
                value={kind}
                onChange={(e) => setKind(e.target.value as any)}
                disabled={!editable}
              >
                <option value="expense">Expense</option>
                <option value="transfer" disabled={!canTransfer}>Transfer</option>
              </select>
              {!canTransfer && (
                <p className="text-xs text-gray-500 mt-1">
                  Need at least 2 envelopes for transfers.
                </p>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">Date</label>
              <input
                className="w-full border rounded px-3 py-2 text-gray-600"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!editable}
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Amount (e.g. 12.34)</label>
            <input
              className="w-full border rounded px-3 py-2 text-gray-600"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!editable}
            />
          </div>

          {/* Expense vs Transfer */}
          {kind === "expense" ? (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Envelope</label>
                <select
                  className="w-full border rounded px-3 py-2 text-gray-600"
                  value={envelopeId}
                  onChange={(e) => setEnvelopeId(e.target.value)}
                  disabled={!editable || categories.length === 0}
                >
                  <option value="">
                    {categories.length === 0 ? "No envelopes yet…" : "Select…"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 && (
                  <div className= "p-3">
                    <button
                      type="button"
                      className="mt-2 px-4 py-2 rounded bg-black text-white disabled:opacity-40"
                      disabled={!editable}
                      onClick={() => {
                        window.location.href = `/${month}/envelopes/new`;
                      }}
                    >
                      Add your first envelope
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">Payee (optional)</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-gray-600"
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    disabled={!editable}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">Memo (optional)</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-gray-600"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    disabled={!editable}
                  />
                </div>
              </div>
            </>
          ) : (
            // Transfer
            <>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">From</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-gray-600"
                    value={fromEnvelopeId}
                    onChange={(e) => setFromEnvelopeId(e.target.value)}
                    disabled={!editable}
                  >
                    <option value="">Select…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">To</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-gray-600"
                    value={toEnvelopeId}
                    onChange={(e) => setToEnvelopeId(e.target.value)}
                    disabled={!editable}
                  >
                    <option value="">Select…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Memo (optional)</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  disabled={!editable}
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
            disabled={!editable || !doc}
            onClick={() => {
              try {
                setError(null);

                const amountCents = parseDollarsToCents(amount);
                if (amountCents <= 0) throw new Error("Amount must be greater than 0.");

                if (kind === "transfer" && !canTransfer) {
                  throw new Error("Need at least 2 envelopes for transfers.");
                }

                let tx: Transaction;

                if (kind === "expense") {
                  if (!envelopeId) throw new Error("Envelope is required.");
                  tx = {
                    id: crypto.randomUUID(),
                    kind: "expense",
                    date,
                    envelopeId,
                    payee: payee.trim() || undefined,
                    memo: memo.trim() || undefined,
                    amountCents,
                    createdAt: new Date().toISOString(),
                  };
                } else {
                  if (!fromEnvelopeId || !toEnvelopeId) throw new Error("From and To envelopes are required.");
                  tx = {
                    id: crypto.randomUUID(),
                    kind: "transfer",
                    date,
                    fromEnvelopeId,
                    toEnvelopeId,
                    amountCents,
                    memo: memo.trim() || undefined,
                    createdAt: new Date().toISOString(),
                  };
                }

                commit((d) => addTransaction(d, tx));
                window.location.href = `/${month}/dashboard`;
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to add transaction.");
              }
            }}
          >
            Save
          </button>
        </div>
      </main>
    </div>
  );
}