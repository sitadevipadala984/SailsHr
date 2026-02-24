"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { logoutAction } from "../app/login/actions";
import type { SessionUser } from "../lib/auth";
import { Button } from "../src/components/ui/button";

type NavItem = { href: string; label: string };
type NavSection = { id: string; label: string; items: NavItem[] };

const sectionsByRole = (role: SessionUser["role"]): NavSection[] => {
  const homeItems = [{ href: role === "EMPLOYEE" ? "/employee" : `/${role.toLowerCase()}`, label: "Dashboard" }];

  const worklifeItems: NavItem[] = [];
  if (role === "ADMIN" || role === "HR" || role === "MANAGER") {
    worklifeItems.push({ href: "/employees", label: "Employees" });
  }
  if (role === "ADMIN") {
    worklifeItems.push({ href: "/admin", label: "Admin Console" });
  }
  if (role === "HR") {
    worklifeItems.push({ href: "/hr", label: "HR Dashboard" });
  }
  if (role === "MANAGER") {
    worklifeItems.push({ href: "/manager", label: "Manager Dashboard" });
  }

  return [
    { id: "home", label: "Home", items: homeItems },
    { id: "my-worklife", label: "My Worklife", items: worklifeItems },
    { id: "leave", label: "Leave", items: [{ href: "/leave", label: "Leave Center" }] },
    { id: "attendance", label: "Attendance", items: [{ href: "/attendance", label: "Attendance Logs" }] },
    { id: "salary", label: "Salary", items: [{ href: "/employee", label: "Compensation" }] },
    { id: "requests", label: "Requests", items: [{ href: "/employees/new", label: "New Request" }] }
  ];
};

const iconClass = "h-5 w-5 shrink-0 text-slate-500";

function SectionIcon({ sectionId }: { sectionId: string }) {
  const baseProps = { className: iconClass, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8" };

  if (sectionId === "home") {
    return (
      <svg {...baseProps}>
        <path d="M3 11.2 12 4l9 7.2" />
        <path d="M5.5 9.8V20h13V9.8" />
      </svg>
    );
  }

  if (sectionId === "my-worklife") {
    return (
      <svg {...baseProps}>
        <rect x="3.5" y="5" width="17" height="15" rx="2" />
        <path d="M8 5V3.5M16 5V3.5M3.5 9.5h17" />
      </svg>
    );
  }

  if (sectionId === "leave") {
    return (
      <svg {...baseProps}>
        <path d="M6 12.5c0-4.2 2.5-7 6-7s6 2.8 6 7-2.5 7-6 7-6-2.8-6-7Z" />
        <path d="M6.5 16.5C9.2 14.2 14.5 11 18 10" />
      </svg>
    );
  }

  if (sectionId === "attendance") {
    return (
      <svg {...baseProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v5l3 1.8" />
      </svg>
    );
  }

  if (sectionId === "salary") {
    return (
      <svg {...baseProps}>
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M8.5 12h7M8.5 9.5h2.5M8.5 14.5h2.5" />
      </svg>
    );
  }

  return (
    <svg {...baseProps}>
      <path d="M4.5 8.5h15M4.5 12h15M4.5 15.5h9" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </svg>
  );
}

export default function AuthShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const sections = useMemo(() => sectionsByRole(user.role), [user.role]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    sections.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const notificationCount = useMemo(() => {
    const base = user.role === "EMPLOYEE" ? 2 : 4;
    return base + (pathname.includes("employees") ? 1 : 0);
  }, [pathname, user.role]);

  return (
    <div className="grid min-h-screen bg-slate-100 lg:grid-cols-[240px_1fr]">
      <aside className="flex h-screen flex-col border-r border-slate-200 bg-[#F7F9FC]">
        <div className="px-5 pb-4 pt-6">
          <h2 className="text-2xl font-semibold text-slate-900">SailsHR</h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Workspace</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {sections.map((section) => {
            const isOpen = openSections[section.id];
            const isSectionActive = section.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <div key={section.id} className="rounded-xl bg-white/40 p-1">
                <button
                  type="button"
                  onClick={() => setOpenSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition hover:bg-slate-100"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <SectionIcon sectionId={section.id} />
                    {section.label}
                  </span>
                  <svg
                    className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path d="M3 6.5 8 11l5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-1 pb-1 pl-2 pr-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block rounded-md border-l-2 px-3 py-2 text-sm transition ${
                            isActive
                              ? "border-l-blue-600 bg-blue-50 font-medium text-blue-700"
                              : "border-l-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                    {!section.items.length && (
                      <p className="px-3 py-2 text-xs text-slate-500">No items available for your role.</p>
                    )}
                  </div>
                </div>

                {isSectionActive && !isOpen && <span className="mt-1 block h-1 rounded-full bg-blue-200" />}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="grid min-h-screen grid-rows-[auto_1fr]">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <p className="text-base font-semibold text-slate-900">Welcome back</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>

          <div className="flex items-center gap-3" ref={profileMenuRef}>
            <button
              type="button"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
              aria-label="Quick actions"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 8h12M6 12h12M6 16h12" />
              </svg>
            </button>

            <button
              type="button"
              className="relative rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M7.5 9.5a4.5 4.5 0 1 1 9 0v3.2l1.5 2.3H6l1.5-2.3V9.5Z" />
                <path d="M10 18a2 2 0 0 0 4 0" />
              </svg>
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {notificationCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 transition hover:bg-slate-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {user.email.slice(0, 2).toUpperCase()}
              </span>
              <span className="hidden text-left text-sm sm:block">
                <span className="block font-medium text-slate-800">{user.role}</span>
                <span className="block text-xs text-slate-500">Profile</span>
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-6 top-14 z-20 min-w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <p className="px-2 py-1 text-xs uppercase tracking-wide text-slate-500">Signed in as {user.role}</p>
                <form action={logoutAction} className="mt-1">
                  <Button type="submit" variant="secondary" className="w-full justify-center">
                    Logout
                  </Button>
                </form>
              </div>
            )}
          </div>
        </header>

        <section className="px-6 py-6">{children}</section>
      </div>
    </div>
  );
}
