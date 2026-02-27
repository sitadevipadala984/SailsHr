"use client";

import { useMemo, useState } from "react";
import { Button } from "../../../components/ui";

type AttendanceRecord = {
  employeeId: string;
  date: string;
  punchIn?: string;
  punchOut?: string;
  status: "PRESENT" | "ABSENT" | "HALF_DAY";
  workHours: number;
};

type LeaveRequest = {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

type Holiday = { date: string; name: string };

const HOLIDAYS: Holiday[] = [
  { date: "2026-02-24", name: "Republic Day observed" },
  { date: "2026-03-19", name: "Ugadi" },
  { date: "2026-03-29", name: "Holi" },
  { date: "2026-04-14", name: "Dr. Ambedkar Jayanthi" }
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayStatus = "present" | "absent" | "leave" | "holiday" | "half_day";

function getDayStatus(
  dateStr: string,
  attendance: AttendanceRecord[],
  leaves: LeaveRequest[],
  employeeId: string
): { status: DayStatus; record?: AttendanceRecord; leave?: LeaveRequest; holiday?: Holiday } {
  const holiday = HOLIDAYS.find((h) => h.date === dateStr);
  if (holiday) return { status: "holiday", holiday };

  const approvedLeave = leaves.find(
    (l) =>
      l.employeeId === employeeId &&
      l.status === "APPROVED" &&
      dateStr >= l.startDate &&
      dateStr <= l.endDate
  );
  if (approvedLeave) return { status: "leave", leave: approvedLeave };

  const record = attendance.find((r) => r.date === dateStr);
  if (record) {
    if (record.status === "HALF_DAY") return { status: "half_day", record };
    if (record.status === "PRESENT") return { status: "present", record };
    return { status: "absent", record };
  }
  return { status: "absent" };
}

const LEGEND = [
  { key: "present", label: "Present", className: "bg-success text-white" },
  { key: "absent", label: "Absent", className: "bg-error text-white" },
  { key: "leave", label: "Leave", className: "bg-blue-500 text-white" },
  { key: "holiday", label: "Holiday", className: "bg-gray-400 text-white" },
  { key: "half_day", label: "Half day", className: "bg-amber-500 text-white" }
] as const;

const STANDARD_IN = "09:00";
const STANDARD_OUT = "18:00";

function minutesFromMidnight(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function formatLateEarly(diffMins: number): string {
  if (diffMins <= 0) return "—";
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function getLateIn(punchIn: string | undefined): string | null {
  if (!punchIn) return null;
  const inMins = minutesFromMidnight(punchIn);
  const standardMins = minutesFromMidnight(STANDARD_IN);
  if (inMins <= standardMins) return null;
  return formatLateEarly(inMins - standardMins);
}

function getEarlyOut(punchOut: string | undefined): string | null {
  if (!punchOut) return null;
  const outMins = minutesFromMidnight(punchOut);
  const standardMins = minutesFromMidnight(STANDARD_OUT);
  if (outMins >= standardMins) return null;
  return formatLateEarly(standardMins - outMins);
}

type Props = {
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  employeeId: string;
};

export function AttendanceCalendar({ attendance, leaves, employeeId }: Props) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { days, startOffset } = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startOffset = first.getDay();
    const totalDays = last.getDate();
    const days: string[] = [];
    for (let d = 1; d <= totalDays; d++) {
      days.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return { days, startOffset };
  }, [viewDate]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  const thisMonth = new Date();
  const canGoNext =
    viewDate.getFullYear() < thisMonth.getFullYear() ||
    (viewDate.getFullYear() === thisMonth.getFullYear() &&
      viewDate.getMonth() < thisMonth.getMonth() + 2);

  const selectedDetail = useMemo(() => {
    if (!selectedDate) return null;
    const info = getDayStatus(selectedDate, attendance, leaves, employeeId);
    return { date: selectedDate, ...info };
  }, [selectedDate, attendance, leaves, employeeId]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-text-primary">
            {viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              ← Prev
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={nextMonth}
              disabled={!canGoNext}
              aria-label="Next month"
            >
              Next →
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {LEGEND.map((item) => (
            <span
              key={item.key}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${item.className}`}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid grid-cols-7 border-b border-border bg-muted">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-text-secondary"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startOffset }, (_, i) => (
              <div key={`pad-${i}`} className="min-h-[72px] border-b border-r border-border bg-muted/30 p-1" />
            ))}
            {days.map((dateStr) => {
              const info = getDayStatus(dateStr, attendance, leaves, employeeId);
              const dayNum = dateStr.slice(8);
              const isSelected = selectedDate === dateStr;
              const isToday =
                dateStr ===
                `${thisMonth.getFullYear()}-${String(thisMonth.getMonth() + 1).padStart(2, "0")}-${String(thisMonth.getDate()).padStart(2, "0")}`;

              const statusStyles: Record<DayStatus, string> = {
                present: "bg-success/15 text-success border-success/30",
                absent: "bg-error/10 text-error border-error/30",
                leave: "bg-blue-500/15 text-blue-600 border-blue-500/30",
                holiday: "bg-gray-400/15 text-gray-600 border-gray-400/30",
                half_day: "bg-amber-500/15 text-amber-700 border-amber-500/30"
              };
              const base =
                "group relative min-h-[72px] cursor-pointer border-b border-r border-border p-2 transition hover:ring-2 hover:ring-accent focus:outline-none focus:ring-2 focus:ring-accent";
              const cellClass = `${base} ${statusStyles[info.status]} ${isSelected ? "ring-2 ring-accent bg-accent/5" : ""} ${isToday ? "font-bold text-text-primary ring-2" : ""}`;

              const workHoursLabel =
                info.record?.workHours != null
                  ? `${info.record.workHours}h`
                  : info.status === "leave"
                    ? "Leave"
                    : info.status === "holiday"
                      ? info.holiday?.name ?? "Holiday"
                      : "";
              const tooltipText =
                info.record?.workHours != null
                  ? `Work hours: ${info.record.workHours}h`
                  : info.record?.punchIn && info.record?.punchOut
                    ? `${info.record.punchIn} – ${info.record.punchOut} (${info.record.workHours}h)`
                    : workHoursLabel;

              return (
                <Button
                  key={dateStr}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedDate(dateStr)}
                  className={cellClass}
                  title={tooltipText}
                >
                  <span className="block text-sm">{dayNum}</span>
                  {workHoursLabel && (
                    <span className="mt-1 block truncate text-xs opacity-90">
                      {info.record?.punchIn && info.record?.punchOut
                        ? `${info.record.punchIn}–${info.record.punchOut}`
                        : workHoursLabel}
                    </span>
                  )}
                  {tooltipText && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded border border-border bg-surface px-2 py-1 text-xs text-text-primary shadow-lg sm:block sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                    >
                      {tooltipText}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="w-full shrink-0 lg:w-80">
        <div className="sticky top-4 flex flex-col gap-0 rounded-xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-lg font-semibold text-text-primary">Date details</h3>
            {selectedDetail && (
              <p className="mt-1 text-sm text-text-secondary">{selectedDetail.date}</p>
            )}
          </div>

          {selectedDetail ? (
            <div className="flex flex-col divide-y divide-border">
              {(selectedDetail.status === "present" || selectedDetail.status === "half_day") &&
                selectedDetail.record && (
                  <>
                    <section className="px-6 py-4">
                      <p
                        className={
                          selectedDetail.status === "present"
                            ? "text-sm font-medium text-success"
                            : "text-sm font-medium text-amber-600"
                        }
                      >
                        {selectedDetail.status === "present" ? "Present" : "Half day"}
                      </p>
                    </section>

                    <section className="px-6 py-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                            First In
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-text-primary">
                            {selectedDetail.record.punchIn ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                            Last Out
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-text-primary">
                            {selectedDetail.record.punchOut ?? "—"}
                          </p>
                        </div>
                        {getLateIn(selectedDetail.record.punchIn) && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                              Late In
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-amber-600">
                              {getLateIn(selectedDetail.record.punchIn)}
                            </p>
                          </div>
                        )}
                        {getEarlyOut(selectedDetail.record.punchOut) && (
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                              Early Out
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-amber-600">
                              {getEarlyOut(selectedDetail.record.punchOut)}
                            </p>
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="px-6 py-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                        Total Work Hours
                      </p>
                      <p className="mt-0.5 text-xl font-semibold text-text-primary">
                        {selectedDetail.record.workHours}h
                      </p>
                    </section>
                  </>
                )}

              {selectedDetail.status === "absent" && (
                <section className="px-6 py-4">
                  <p className="text-sm font-medium text-error">Absent</p>
                  <p className="mt-1 text-xs text-text-secondary">No attendance record for this date.</p>
                </section>
              )}

              {selectedDetail.status === "leave" && selectedDetail.leave && (
                <section className="px-6 py-4">
                  <p className="text-sm font-medium text-blue-600">
                    Leave ({selectedDetail.leave.type})
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {selectedDetail.leave.startDate} – {selectedDetail.leave.endDate}
                  </p>
                </section>
              )}

              {selectedDetail.status === "holiday" && selectedDetail.holiday && (
                <section className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-600">Holiday</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {selectedDetail.holiday.name}
                  </p>
                </section>
              )}
            </div>
          ) : (
            <div className="px-6 py-8">
              <p className="text-center text-sm text-text-secondary">
                Select a date on the calendar to see details.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
