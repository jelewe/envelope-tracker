"use client";

import Link from "next/link";
import { useEffect, useState, useId } from "react";
import { YYYYMM } from "@/types/budget";
import { currentYYYYMM, formatMMYY } from "@/lib/date";

type NavbarProps = {
  month: YYYYMM;
  hideMonthPicker?: boolean;
};

export function Navbar({ month, hideMonthPicker = false }: NavbarProps) {
  const current = currentYYYYMM();
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const [draftMonth, setDraftMonth] = useState<YYYYMM>(month);

  const goToMonth = (next: YYYYMM) => {
    setOpen(false);
    window.location.href = `/${next}/dashboard`;
  };

  const closeDrawer = () => {
    setDraftMonth(month); // reset to current route month
    setOpen(false);
  };

  const LinkItem = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      className="text-sm text-gray-700 hover:text-gray-900"
      href={href}
      onClick={closeDrawer}
    >
      {children}
    </Link>
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    setDraftMonth(month);
  }, [month]);

  // Lock body scroll while drawer open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="w-full border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Link className="font-semibold text-gray-700" href={`/${month}/dashboard`}>
            Budget {formatMMYY(month)}
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-4">
            <LinkItem href={`/${month}/transactions/new`}>Add Transaction</LinkItem>
            <LinkItem href={`/${month}/envelopes/new`}>Add Envelope</LinkItem>
            <LinkItem href="/settings">Settings</LinkItem>
          </div>
        </div>

        {/* Right */}
        {!hideMonthPicker && (
          <>
            {/* Desktop month picker */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <input
                className="border rounded px-2 py-1 text-gray-600"
                type="month"
                value={month}
                onChange={(e) => goToMonth(e.target.value as YYYYMM)}
                aria-label="Select month"
              />
              {month !== current && <span className="text-xs text-gray-500">(view-only)</span>}
            </div>

            {/* Mobile: compact month + hamburger */}
            <div className="flex md:hidden items-center gap-2">

              <button
                type="button"
                className="border rounded px-3 py-2 pb-2.5 text-md text-gray-700"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls={drawerId}
              >
                ☰
              </button>
            </div>
          </>
        )}

        {/* If month picker hidden (Settings), still show hamburger on mobile for nav */}
        {hideMonthPicker && (
          <div className="md:hidden">
            <button
              type="button"
              className="border rounded px-3 py-2 text-sm text-gray-700"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls={drawerId}
            >
              ☰
            </button>
          </div>
        )}
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close menu"
            onClick={closeDrawer}
          />

          {/* Panel */}
          <div
            id={drawerId}
            className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-lg p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-gray-800">Menu</div>
              <button
                type="button"
                className="border rounded px-3 py-2 text-sm text-gray-700"
                onClick={closeDrawer}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-3">
              <LinkItem href={`/${month}/dashboard`}>Dashboard</LinkItem>
              <LinkItem href={`/${month}/transactions/new`}>Add Transaction</LinkItem>
              <LinkItem href={`/${month}/envelopes/new`}>Add Envelope</LinkItem>
              <LinkItem href="/settings">Settings</LinkItem>
            </nav>

            {!hideMonthPicker && (
              <div className="mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">Month</div>
                <input
                  className="w-full border rounded px-2 py-2 text-gray-700"
                  type="month"
                  value={draftMonth}
                  onChange={(e) => setDraftMonth(e.target.value as YYYYMM)}
                  aria-label="Select month"
                />

                {draftMonth !== month && (
                  <button
                    type="button"
                    className="mt-2 w-full px-4 py-2 rounded bg-black text-white"
                    onClick={() => goToMonth(draftMonth)}
                  >
                    Apply
                  </button>
                )}

                {month !== current && (
                  <div className="text-xs text-gray-500 mt-2">Viewing a past month (read-only)</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}