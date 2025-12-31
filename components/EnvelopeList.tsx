"use client";

import Link from "next/link";
import { BudgetDocV1, YYYYMM } from "@/types/budget";
import { getAllocationCents, getRemainingCents } from "@/lib/selectors";
import { Tracker } from "@/components/Tracker";

export function EnvelopeList({ doc, month }: { doc: BudgetDocV1; month: YYYYMM }) {
  const categories = [...doc.categories]
    .filter(c => !c.archived)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!categories.length) {
    return (
      <div className="border rounded p-4 bg-white">
        <p className="text-emerald-700">No envelopes yet.</p>
        <p className="text-sm text-emerald-500 mt-1">Use “Add Envelope” to create one.</p>
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