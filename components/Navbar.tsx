"use client";

import Link from "next/link";
import { YYYYMM } from "@/types/budget";
import { currentYYYYMM } from "@/lib/date";

type NavbarProps = {
  month: YYYYMM;
  hideMonthPicker?: boolean;
};

export function Navbar({ month, hideMonthPicker = false }: NavbarProps) {
  const current = currentYYYYMM();

  return (
    <div className="w-full border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link className="font-semibold text-gray-600" href={`/${month}/dashboard`}>
            Budget
          </Link>

          <Link
            className="text-sm text-gray-600 hover:text-gray-900"
            href={`/${month}/transactions/new`}
          >
            Add Transaction
          </Link>

          <Link
            className="text-sm text-gray-600 hover:text-gray-900"
            href={`/${month}/envelopes/new`}
          >
            Add Envelope
          </Link>

          <Link
            className="text-sm text-gray-600 hover:text-gray-900"
            href="/settings"
          >
            Settings
          </Link>
        </div>

        {!hideMonthPicker && (
          <div className="flex items-center gap-2 text-sm">
            <input
              className="border rounded px-2 py-1 text-gray-500"
              type="month"
              value={month}
              onChange={(e) => {
                const next = e.target.value as YYYYMM;
                window.location.href = `/${next}/dashboard`;
              }}
            />

            {month !== current && (
              <span className="ml-2 text-xs text-gray-500">(view-only)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}