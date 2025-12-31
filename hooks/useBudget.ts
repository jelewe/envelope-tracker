"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BudgetDocV1 } from "@/types/budget";
import { loadBudgetDoc, saveBudgetDoc } from "@/lib/storage";

export function useBudget() {
  const [doc, setDoc] = useState<BudgetDocV1 | null>(null);

  useEffect(() => {
    setDoc(loadBudgetDoc());
  }, []);

  // Debounce for normal edits
  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(() => saveBudgetDoc(doc), 200);
    return () => clearTimeout(t);
  }, [doc]);

  const commit = useCallback((fn: (draft: BudgetDocV1) => BudgetDocV1) => {
    setDoc(prev => {
      if (!prev) return prev;
      const next = fn(prev);
      saveBudgetDoc(next); // <-- immediate flush
      return next;
    });
  }, []);

  const update = useCallback((fn: (draft: BudgetDocV1) => BudgetDocV1) => {
    setDoc(prev => {
      if (!prev) return prev;
      return fn(prev);
    });
  }, []);

  return useMemo(() => ({ doc, setDoc, update, commit }), [doc, update, commit]);
}