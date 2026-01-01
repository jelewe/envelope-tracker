"use client";

import Link from "next/link";
import { BudgetDocV1, YYYYMM } from "@/types/budget";
import { getAllocationCents, getRemainingCents } from "@/lib/selectors";
import { Tracker } from "@/components/Tracker";
import { currentYYYYMM } from "@/lib/date";

export function EnvelopeList({ doc, month }: { doc: BudgetDocV1; month: YYYYMM }) {
  const categories = [...doc.categories]
    .filter(c => !c.archived)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const editable = month === currentYYYYMM();

  if (!categories.length) {
    return (
      <div className="border rounded p-4 bg-white">
        <p className="text-emerald-700">No envelopes yet.</p>
        <div className= "p-3">
                    <button
                      type="button"
                      className="mt-2 px-4 py-2 rounded bg-black text-white disabled:opacity-40"
                      disabled={!editable}
                      onClick={() => {
                        window.location.href = `/${month}/envelopes/new`;
                      }}
                    >
                      { editable ? "Add your first envelope" : "Past months are read-only" }
                    </button>
                  </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {categories.map(c => {
        const alloc = getAllocationCents(doc, month, c.id);
        const remaining = getRemainingCents(doc, month, c.id);

        return (
          <div key={c.id} className="border rounded p-4 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link className="font-semibold text-gray-600 hover:underline" href={`/${month}/envelopes/${c.id}`}>
                  {c.name}
                </Link>
              </div>
              <div className="w-80 max-w-full">
                <Tracker allocationCents={alloc} remainingCents={remaining} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}