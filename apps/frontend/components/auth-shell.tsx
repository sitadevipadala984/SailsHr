"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { logoutAction } from "../app/login/actions";
import type { SessionUser } from "../lib/auth";

type NavItem = {
  href: string;
  label: string;
  section?: "leave" | "attendance" | "salary" | "requests";
};

type NavGroup = {
  id: string;
  label: string;
  icon: ReactNode;
  items: NavItem[];
};

const commonGroups = (role: SessionUser["role"]): NavGroup[] => {
  const dashboardRoute = role === "EMPLOYEE" ? "/employee" : `/${role.toLowerCase()}`;

  return [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 11.2 12 4l9 7.2" />
          <path d="M5.5 9.5V20h13V9.5" />
        </svg>
      ),
      items: [{ href: dashboardRoute, label: "Home" }]
    },
    {
      id: "my-worklife",
      label: "My Worklife",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 9.5h17" />
        </svg>
      ),
      items:
        role === "EMPLOYEE"
          ? [{ href: "/employee", label: "My Worklife" }]
          : [
              { href: "/employees", label: "Employees" },
              ...(role === "ADMIN" ? [{ href: "/admin", label: "Admin Console" }] : []),
              ...(role === "HR" ? [{ href: "/hr", label: "HR Dashboard" }] : []),
              ...(role === "MANAGER" ? [{ href: "/manager", label: "Manager Dashboard" }] : [])
            ]
    },
    {
      id: "leave",
      label: "Leave",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M8 3.5V7M16 3.5V7" />
        </svg>
      ),
      items: [{ href: "/leave", label: "Leave Apply", section: "leave" }]
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 12.5 9.5 18 20 7" />
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
        </svg>
      ),
      items: [{ href: "/attendance", label: "Attendance Info", section: "attendance" }]
    },
    {
      id: "salary",
      label: "Salary",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 13c3 0 3-3 6-3s3 3 6 3 3-3 6-3" />
          <path d="M4 16c3 0 3 3 6 3s3-3 6-3 3 3 6 3" />
        </svg>
      ),
      items: [{ href: "/employee", label: "Payslip", section: "salary" }]
    },
    {
      id: "requests",
      label: "Request Hub",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4.5 8.5h15M4.5 12h15M4.5 15.5h10" />
          <rect x="3" y="4" width="18" height="16" rx="2" />
        </svg>
      ),
      items: [{ href: "/employees/new", label: "Requests", section: "requests" }]
    }
  ];
};

export default function AuthShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const groups = useMemo(() => commonGroups(user.role), [user.role]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    groups.reduce((acc, group) => ({ ...acc, [group.id]: true }), {})
  );
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const quickLinksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (quickLinksRef.current && !quickLinksRef.current.contains(event.target as Node)) {
        setQuickLinksOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  const title = groups
    .flatMap((group) => group.items)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label;

  return (
    <div className="grid min-h-screen bg-[#f5f7fb] lg:grid-cols-[240px_1fr]">
      <aside className="flex h-screen flex-col border-r border-slate-200 bg-[#f7f9fc]">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="text-4xl font-black italic leading-none text-sky-600">SAILS</div>
          <p className="mt-1 text-xs font-semibold tracking-wide text-slate-500">Software</p>
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-3xl leading-none">👤</p>
            <p className="mt-2 text-2xl font-medium text-slate-800">Hi {user.email.split("@")[0]}</p>
            <p className="text-xs font-medium text-blue-600">View My Info</p>
          </div>
          <button type="button" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
              <path d="M3.5 12h2M18.5 12h2M12 3.5v2M12 18.5v2M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M5.8 18.2l1.5-1.5M16.7 7.3l1.5-1.5" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {groups.map((group) => {
            const isOpen = openGroups[group.id];
            const hasActive = group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <div key={group.id}>
                <button
                  type="button"
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-slate-600 transition hover:bg-slate-100"
                >
                  <span className="flex items-center gap-3 text-[32px] font-normal">
                    <span className="text-slate-400">{group.icon}</span>
                    <span className="text-[18px] text-slate-600">{group.label}</span>
                  </span>
                  <svg
                    viewBox="0 0 16 16"
                    className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                  >
                    <path d="M3 6.5 8 11l5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden pl-9 transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`my-1 block rounded-sm border-l-2 px-3 py-2 text-[17px] transition ${
                          isActive
                            ? "border-l-blue-600 bg-[#e9eef8] text-[#4163d8]"
                            : "border-l-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                {hasActive && !isOpen && <div className="ml-9 mt-1 h-1 w-12 rounded-full bg-blue-200" />}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="grid min-h-screen grid-rows-[80px_1fr]">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-7">
          <div className="flex items-center gap-3 text-slate-800">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#7aa0ff]" fill="currentColor">
              <path d="M5 4h8l6 7-6 9H5z" />
            </svg>
            <h1 className="text-[40px] font-normal">{title ?? "Home"}</h1>
          </div>

          <div className="relative flex items-center gap-5" ref={quickLinksRef}>
            <button
              type="button"
              onClick={() => setQuickLinksOpen((prev) => !prev)}
              className="flex items-center gap-1 text-[36px] text-slate-600 hover:text-slate-800"
            >
              Quick Links
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
                <path d="M3 6.5 8 11l5-4.5z" />
              </svg>
            </button>

            {quickLinksOpen && (
              <div className="absolute right-20 top-10 z-30 w-48 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
                <Link className="block rounded px-2 py-2 text-sm text-slate-600 hover:bg-slate-100" href="/employees">
                  Employee Directory
                </Link>
                <Link className="block rounded px-2 py-2 text-sm text-slate-600 hover:bg-slate-100" href="/leave">
                  Leave Center
                </Link>
                <Link className="block rounded px-2 py-2 text-sm text-slate-600 hover:bg-slate-100" href="/attendance">
                  Attendance Info
                </Link>
              </div>
            )}

            <button type="button" className="relative text-slate-500 hover:text-slate-700" aria-label="Notifications">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M7.5 9.5a4.5 4.5 0 1 1 9 0v3.2l1.5 2.3H6l1.5-2.3V9.5Z" />
                <path d="M10 18a2 2 0 0 0 4 0" />
              </svg>
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500" />
            </button>

            <form action={logoutAction}>
              <button type="submit" className="text-slate-500 transition hover:text-slate-700" aria-label="Logout">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3v9" />
                  <path d="M7.8 5.8A8 8 0 1 0 16.2 5.8" />
                </svg>
              </button>
            </form>
          </div>
        </header>

        <main className="px-7 py-5">{children}</main>
      </div>
    </div>
  );
}
