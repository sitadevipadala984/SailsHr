"use client";

type LeaveType = "CL" | "SL" | "PL";

type BalanceItem = {
  type: LeaveType;
  balance: number;
  used: number;
  total: number;
};

type LeaveBalanceWidgetProps = {
  /** API may return single pool or per-type. We normalize to per-type for display. */
  balances: Array<{ employeeId: string; balance: number; used: number; total: number; CL?: number; SL?: number; PL?: number }>;
};

const LEAVE_LABELS: Record<LeaveType, string> = {
  CL: "Casual Leave",
  SL: "Sick Leave",
  PL: "Privilege Leave"
};

function getItemsFromBalances(
  balances: LeaveBalanceWidgetProps["balances"]
): BalanceItem[] {
  const first = balances[0];
  if (!first) return [];

  const types: LeaveType[] = ["CL", "SL", "PL"];
  return types.map((type) => ({
    type,
    balance: first.balance,
    used: first.used,
    total: first.total
  }));
}

export function LeaveBalanceWidget({ balances }: LeaveBalanceWidgetProps) {
  const items = getItemsFromBalances(balances);
  if (items.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => {
        const total = item.total || 1;
        const used = item.used;
        const balance = item.balance;
        const pct = (used / total) * 100;
        const isLow = balance <= 2;
        const barColor = isLow ? "bg-error" : pct >= 80 ? "bg-amber-500" : "bg-success";

        return (
          <div
            key={item.type}
            className="rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              {LEAVE_LABELS[item.type]} ({item.type})
            </p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {balance} <span className="text-sm font-normal text-text-secondary">/ {total}</span>
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">Used: {used} days</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${Math.min(100, pct)}%` }}
                role="progressbar"
                aria-valuenow={used}
                aria-valuemin={0}
                aria-valuemax={total}
              />
            </div>
            {isLow && (
              <p className="mt-2 text-xs font-medium text-error">Low balance</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
