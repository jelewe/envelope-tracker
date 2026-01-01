"use client";

import { useMemo, useState } from "react";
//hooks
import { useBudget } from "@/hooks/useBudget";
//components
import { TransactionList } from "@/components/TransactionList";
import { Tracker } from "@/components/Tracker";
import { Navbar } from "@/components/Navbar";
//types
import { BudgetDocV1, EnvelopeCategory, Transaction, YYYYMM } from "@/types/budget";
//libs
import { setMonthlyAllocation, deleteEnvelope, deleteTransaction, setEnvelopeArchived } from "@/lib/mutations";
import { formatCents, parseDollarsToCents } from "@/lib/money";
import { currentYYYYMM } from "@/lib/date";
import { getAllocationCents, getRemainingCents, getEnvelopeTransactions } from "@/lib/selectors";

type EnvelopeViewSuccess = {
  envelope: EnvelopeCategory;
  alloc: number;
  remaining: number;
  txs: Transaction[];
};

type EnvelopeViewError = { error: string };

function buildEnvelopeView(
  doc: BudgetDocV1,
  month: YYYYMM,
  envelopeId: string
): EnvelopeViewSuccess | EnvelopeViewError {
  const envelope = doc.categories.find((c) => c.id === envelopeId);
  if (!envelope) return { error: "Envelope not found." };

  const alloc = getAllocationCents(doc, month, envelopeId);
  const remaining = getRemainingCents(doc, month, envelopeId);
  const txs = getEnvelopeTransactions(doc, month, envelopeId);

  return { envelope, alloc, remaining, txs };
}

export default function EnvelopeDetailClient({
  month,
  envelopeId,
}: {
  month: YYYYMM;
  envelopeId: string;
}) {
  const { doc, update, commit } = useBudget();
  const editable = month === currentYYYYMM();
  const [allocInput, setAllocInput] = useState("");
  const [allocError, setAllocError] = useState<string | null>(null);
  const [isEditingAlloc, setIsEditingAlloc] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const view = useMemo(() => {
    if (!doc) return null;
    return buildEnvelopeView(doc, month, envelopeId);
  }, [doc, month, envelopeId]);

  return (
    <div className="min-h-screen bg-gray-100">
        <Navbar month={month} />
        <main className="mx-auto max-w-5xl px-4 py-6">

            {!doc && <div className="text-gray-600">Loading…</div>}

            {doc && view && "error" in view && (
            <div className="text-red-600">{view.error}</div>
            )}

            {doc && view && !("error" in view) && (
            <>
                <div className="mb-4">
                <h1 className="text-xl text-emerald-600 font-semibold">{view.envelope.name}</h1>
                </div>

                <div className="mb-6 border rounded p-4 bg-white space-y-3">
                <Tracker allocationCents={view.alloc} remainingCents={view.remaining} />

                <div className="pt-2 border-t">
                    <div className="text-sm text-gray-600">
                    Current allocation:{" "}
                    <span className="font-medium text-gray-900">
                        {formatCents(view.alloc)}
                    </span>
                    </div>

                    {editable && !isEditingAlloc && (
                    <button
                        className="mt-2 text-sm text-blue-600 hover:underline"
                        onClick={() => {
                        setAllocInput((view.alloc / 100).toFixed(2));
                        setIsEditingAlloc(true);
                        }}
                    >
                        Edit allocation
                    </button>
                    )}

                    {editable && isEditingAlloc && (
                    <div className="mt-3 space-y-2">
                        <label className="block text-sm text-gray-600">
                        Allocation for {month}
                        </label>

                        <div className="flex gap-2">
                        <input
                            className="flex-1 border rounded px-3 py-2 placeholder-gray-400 text-gray-400"
                            value={allocInput}
                            onChange={(e) => setAllocInput(e.target.value)}
                            placeholder="e.g. 400.00"
                        />

                        <button
                            className="px-4 py-2 rounded bg-black text-white"
                            onClick={() => {
                            try {
                                setAllocError(null);
                                const cents = parseDollarsToCents(allocInput);

                                commit((d) =>
                                setMonthlyAllocation(d, month, envelopeId, cents)
                                );

                                setIsEditingAlloc(false);
                                setAllocInput("");
                            } catch (e) {
                                setAllocError(
                                e instanceof Error
                                    ? e.message
                                    : "Failed to update allocation."
                                );
                            }
                            }}
                        >
                            Save
                        </button>

                        <button
                            className="px-4 py-2 rounded border text-gray-600"
                            onClick={() => {
                            setIsEditingAlloc(false);
                            setAllocError(null);
                            }}
                        >
                            Cancel
                        </button>
                        </div>

                        {allocError && (
                        <p className="text-sm text-red-600">{allocError}</p>
                        )}
                    </div>
                    )}

                    {!editable && (
                    <p className="mt-2 text-xs text-gray-500">
                        Past months are locked.
                    </p>
                    )}
                </div>
                </div>
                    <h2 className="text-lg text-gray-600 font-semibold mb-2">Transactions</h2>
                    <TransactionList
                    doc={doc}
                    month={month}
                    transactions={view.txs}
                    onDelete={(txId) => {
                        commit((d) => deleteTransaction(d, txId));
                    }}
                    />

                    <h3 className="font-semibold mb-2 text-gray-600">Envelope actions</h3>
                    <div className="mb-6 border rounded p-4 bg-white">
                        

                        <button
                            className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
                            onClick={() => {
                            const nextArchived = !view.envelope.archived;

                            const ok = window.confirm(
                                nextArchived
                                ? "Archive this envelope?\n\nIt will be hidden from the dashboard, but past months are preserved."
                                : "Unarchive this envelope?\n\nIt will reappear on the dashboard."
                            );
                            if (!ok) return;

                            commit(d => setEnvelopeArchived(d, envelopeId, nextArchived));

                            // Optional UX: when archiving, return to dashboard so you see it disappear
                            if (nextArchived) {
                                window.location.href = `/${month}/dashboard`;
                            }
                            }}
                        >
                            {view.envelope.archived ? "Unarchive envelope" : "Archive envelope"}
                        </button>

                        <br />
                        <br />

                        {deleteError && <p className="text-sm text-red-600 mb-2">{deleteError}</p>}
                        <button
                            className="px-4 py-2 rounded border text-red-600 hover:bg-red-100 disabled:opacity-40"
                            disabled={!editable}
                            onClick={() => {
                            const ok = window.confirm(
                                "Delete this envelope?\n\nThis will remove the envelope and any CURRENT-month transactions/transfers tied to it. Past-month envelopes cannot be deleted."
                            );
                            if (!ok) return;

                            try {
                                setDeleteError(null);
                                commit(d => deleteEnvelope(d, envelopeId));
                                window.location.href = `/${month}/dashboard`;
                            } catch (e) {
                                setDeleteError(e instanceof Error ? e.message : "Failed to delete envelope.");
                            }
                            }}
                        >
                            Delete envelope
                        </button>

                        {!editable && (
                            <p className="text-xs text-gray-500 mt-2">
                            Past months are locked.
                            </p>
                        )}
                    </div>
            </>
            )}
      </main>
    </div>
  );
}