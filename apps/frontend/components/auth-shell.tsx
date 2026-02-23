import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "../app/login/actions";
import type { SessionUser } from "../lib/auth";
import { Button } from "../src/components/ui/button";

type MenuItem = { href: string; label: string };

const roleMenu = (role: SessionUser["role"]): MenuItem[] => {
  if (role === "ADMIN") {
    return [
      { href: "/admin", label: "Admin Console" },
      { href: "/hr", label: "HR Dashboard" },
      { href: "/manager", label: "Manager" },
      { href: "/employees", label: "Employees" }
    ];
  }

  if (role === "HR") {
    return [
      { href: "/hr", label: "HR Dashboard" },
      { href: "/manager", label: "Manager" },
      { href: "/employees", label: "Employees" }
    ];
  }

  if (role === "MANAGER") {
    return [
      { href: "/manager", label: "Manager Dashboard" },
      { href: "/employees", label: "Employees" }
    ];
  }

  return [{ href: "/employee", label: "Employee Dashboard" }];
};

export default function AuthShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const menu = roleMenu(user.role);

  return (
    <div className="grid min-h-screen bg-gray-100 lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-gray-200 bg-bg-sidebar p-6 lg:border-b-0 lg:border-r">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">SailsHR</h2>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Navigation</p>
        <nav className="mt-3 grid gap-2 md:grid-flow-col md:auto-cols-fr lg:grid-flow-row lg:auto-cols-auto">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="grid grid-rows-[auto_1fr]">
        <header className="flex items-center justify-between border-b border-gray-200 bg-bg-header px-6 py-4">
          <div>
            <p className="text-base font-semibold text-gray-900">{user.email}</p>
            <p className="mt-1 text-sm text-gray-500">Role: {user.role}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary">Logout</Button>
          </form>
        </header>
        <section className="px-6 py-6">{children}</section>
      </div>
    </div>
  );
}
