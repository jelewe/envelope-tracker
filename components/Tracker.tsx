import { formatCents } from "@/lib/money";

export function Tracker({
  allocationCents,
  remainingCents,
}: {
  allocationCents: number;
  remainingCents: number;
}) {
  const negative = remainingCents < 0;

  // If allocation is 0, show an "empty" bar and rely on red state if negative
  const pct =
    allocationCents <= 0
      ? 0
      : Math.max(0, Math.min(100, Math.round((remainingCents / allocationCents) * 100)));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className={negative ? "text-red-600 font-medium" : "text-gray-700"}>
          Remaining: {formatCents(remainingCents)}
        </span>
        <span className="text-gray-500">Budget: {formatCents(allocationCents)}</span>
      </div>

      <div className={`h-3 w-full rounded bg-gray-200 overflow-hidden ${negative ? "ring-1 ring-red-400" : ""}`}>
        <div
          className={`h-full ${negative ? "bg-red-500" : "bg-green-600"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}