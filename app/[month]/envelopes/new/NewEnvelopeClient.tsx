"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useBudget } from "@/hooks/useBudget";
import { currentYYYYMM } from "@/lib/date";
import { YYYYMM } from "@/types/budget";
import { setMonthlyAllocation, upsertCategory } from "@/lib/mutations";
import { parseDollarsToCents } from "@/lib/money";

export default function NewEnvelopeClient({ month }: { month: YYYYMM }) {
  const { doc, commit } = useBudget();
  const [name, setName] = useState("");
  const [allocation, setAllocation] = useState(""); // dollars input, e.g. "400.00"
  const [error, setError] = useState<string | null>(null);

  const editable = month === currentYYYYMM();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar month={month} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-xl text-emerald-600 font-semibold mb-4">Add Envelope</h1>

        {!editable && (
          <div className="mb-4 p-3 rounded border bg-white text-sm text-gray-700">
            Past months are view-only. Switch to the current month to add envelopes.
          </div>
        )}

        <div className="border rounded p-4 bg-white">
          <label className="block text-sm text-gray-600 mb-2">Envelope name</label>
          <input
            className="w-full border rounded px-3 py-2 text-gray-600 placeholder-gray-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editable}
            placeholder="e.g. Groceries"
          />

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <label 
            style={{ marginTop: "0.5rem" }} 
            className="block text-sm text-gray-600 mb-2">
              Allocation for {month} (optional)
          </label>
          <input
            className="w-full border rounded px-3 py-2 text-gray-600 placeholder-gray-400"
            value={allocation}
            onChange={(e) => setAllocation(e.target.value)}
            disabled={!editable}
            placeholder="300.00"
          />

          <button
            className="mt-4 px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
            disabled={!editable || !doc}
            onClick={() => {
              try {
                setError(null);

                const envelopeId = crypto.randomUUID();
                const allocationCents = allocation.trim() ? parseDollarsToCents(allocation) : 0;

                commit((d) => {
                  const withCat = upsertCategory(d, { id: envelopeId, name });
                  const withAlloc = setMonthlyAllocation(withCat, month, envelopeId, allocationCents);
                  return withAlloc;
                });
                window.location.href = `/${month}/dashboard`;
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to add envelope.");
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