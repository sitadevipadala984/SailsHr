"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select } from "../../../components/ui";
import { LeaveBalanceWidget } from "./leave-balance-widget";

type LeaveApplyFormProps = {
  action: (formData: FormData) => Promise<void>;
  balances: Array<{ employeeId: string; balance: number; used: number; total: number }>;
};

function daysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const a = new Date(start);
  const b = new Date(end);
  const diff = (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(diff) + 1);
}

export function LeaveApplyForm({ action, balances }: LeaveApplyFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const leaveDays = useMemo(
    () => (startDate && endDate ? daysBetween(startDate, endDate) : 0),
    [startDate, endDate]
  );

  const dateError =
    startDate && endDate && new Date(endDate) < new Date(startDate)
      ? "End date must be on or after start date"
      : null;

  useEffect(() => {
    const error = searchParams.get("leaveError");
    const updated = searchParams.get("leaveUpdated");
    if (error) {
      setToast({ type: "error", message: decodeURIComponent(error) });
      router.replace("/leave", { scroll: false });
    } else if (updated) {
      setToast({ type: "success", message: "Leave request submitted successfully." });
      router.replace("/leave", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div
          role="alert"
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-lg border px-4 py-3 shadow-lg ${
            toast.type === "error"
              ? "border-error/30 bg-surface text-error"
              : "border-success/30 bg-surface text-success"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium">{toast.message}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setToast(null)}
              className="shrink-0 text-current opacity-70 hover:opacity-100"
              aria-label="Dismiss"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      <section>
        <h2 className="text-lg font-medium text-text-primary">Leave balance</h2>
        <div className="mt-2">
          <LeaveBalanceWidget balances={balances} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold text-text-primary">Apply for leave</h2>
          <p className="mt-1 text-sm text-text-secondary">Submit a new leave request.</p>
        </div>

        <form action={action} className="flex flex-col">
          {dateError && (
            <div className="mx-6 mt-4 rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-sm text-error">
              {dateError}
            </div>
          )}
          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="leave-type" className="text-sm font-medium text-text-primary">
                Leave type
              </label>
              <Select id="leave-type" name="type" required>
                <option value="">Select type</option>
                <option value="CL">CL — Casual Leave</option>
                <option value="SL">SL — Sick Leave</option>
                <option value="PL">PL — Privilege Leave</option>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="leave-days-preview" className="text-sm font-medium text-text-primary">
                Leave days (preview)
              </label>
              <div
                id="leave-days-preview"
                className="rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-medium text-text-primary"
              >
                {leaveDays > 0 ? `${leaveDays} day${leaveDays !== 1 ? "s" : ""}` : "—"}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="start-date" className="text-sm font-medium text-text-primary">
                Start date
              </label>
              <Input
                id="start-date"
                name="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="end-date" className="text-sm font-medium text-text-primary">
                End date
              </label>
              <Input
                id="end-date"
                name="endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="reason" className="text-sm font-medium text-text-primary">
                Reason <span className="text-text-secondary">(optional)</span>
              </label>
              <Input
                id="reason"
                name="reason"
                type="text"
                placeholder="Brief reason for leave"
              />
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-border bg-surface px-6 py-4">
            <Button
              type="submit"
              variant="primary"
              disabled={!!dateError}
              className="w-full sm:w-auto sm:min-w-[140px]"
            >
              Submit request
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
