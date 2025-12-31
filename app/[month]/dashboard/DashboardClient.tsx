"use client";

import { useEffect, useMemo } from "react";
import { useBudget } from "@/hooks/useBudget";
import { Navbar } from "@/components/Navbar";
import { EnvelopeList } from "@/components/EnvelopeList";
import { currentYYYYMM, prevYYYYMM } from "@/lib/date";
import { MonthlyAllocation, YYYYMM } from "@/types/budget";

export default function DashboardClient({ month }: { month: YYYYMM }) {
  const { doc, commit } = useBudget();

  // Auto-fill allocations from previous month (only for current month, only if missing)
  useEffect(() => {
    if (!doc) return;

    const cur = currentYYYYMM();
    if (month !== cur) return; // only auto-fill for current month

    const prev = prevYYYYMM(month);

    // Build a quick lookup of existing allocations
    const allocMap = new Map<string, number>();
    for (const a of doc.allocations) {
      allocMap.set(`${a.month}|${a.envelopeId}`, a.amountCents);
    }

    const newAllocations: MonthlyAllocation[] = [];
    for (const cat of doc.categories) {
      if (cat.archived) continue;

      const keyThis = `${month}|${cat.id}`;
      const keyPrev = `${prev}|${cat.id}`;

      const hasThis = allocMap.has(keyThis);
      const prevVal = allocMap.get(keyPrev);

      if (!hasThis && typeof prevVal === "number") {
        newAllocations.push({ month, envelopeId: cat.id, amountCents: prevVal });
      }
    }

    if (newAllocations.length === 0) return;

    // Persist once: add missing allocations (do not overwrite existing)
    commit((d) => ({
      ...d,
      allocations: [...d.allocations, ...newAllocations],
    }));
  }, [doc, commit, month]);

  const content = useMemo(() => {
    if (!doc) return <div className="text-gray-600">Loading…</div>;
    return <EnvelopeList doc={doc} month={month} />;
  }, [doc, month]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar month={month} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-xl font-semibold mb-4 text-gray-600">Dashboard</h1>
        {content}
      </main>
    </div>
  );
}