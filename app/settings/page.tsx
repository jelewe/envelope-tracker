"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useBudget } from "@/hooks/useBudget";
import { exportBudgetDoc, importBudgetDoc } from "@/lib/storage";
import { currentYYYYMM } from "@/lib/date";

export default function SettingsPage() {
  const month = currentYYYYMM();

  const { doc, setDoc } = useBudget();
  const [importText, setImportText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar month={month} hideMonthPicker />

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="text-xl text-emerald-600 font-semibold">Settings</h1>

        <div className="border rounded p-4 bg-white space-y-3">
          <h2 className="font-semibold text-gray-600">Export</h2>
          <p className="text-sm text-gray-600">Download a JSON backup.</p>

          <button
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-40"
            disabled={!doc}
            onClick={() => {
              const json = exportBudgetDoc();
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "budget-backup.json";
              a.click();
              URL.revokeObjectURL(url);
              setMsg("Exported.");
              setErr(null);
            }}
          >
            Download JSON
          </button>
        </div>

        <div className="border rounded p-4 bg-white space-y-3">
          <h2 className="font-semibold text-gray-600">Import</h2>
          <p className="text-sm text-gray-600">
            Paste JSON to restore. This overwrites your current data.
          </p>

          <textarea
            className="w-full h-40 border rounded p-2 font-mono text-xs placeholder-gray-400 text-gray-400"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste budget-backup.json here…"
          />

          <button
            className="px-4 py-2 rounded bg-black text-white"
            onClick={() => {
              try {
                const next = importBudgetDoc(importText);
                setDoc(next);
                setMsg("Imported successfully.");
                setErr(null);
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Import failed.");
                setMsg(null);
              }
            }}
          >
            Import JSON
          </button>

          {msg && <p className="text-sm text-green-700">{msg}</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
      </main>
    </div>
  );
}