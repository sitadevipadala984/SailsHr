import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "../app/login/actions";
import type { SessionUser } from "../lib/auth";

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
    <div className="app-shell">
      <aside className="app-sidebar">
        <h2 className="brand">SailsHR</h2>
        <p className="nav-caption">Navigation</p>
        <nav className="nav-list">
          {menu.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <strong>{user.email}</strong>
            <p className="role-text">Role: {user.role}</p>
          </div>
          <form action={logoutAction}>
            <button type="submit">Logout</button>
          </form>
        </header>
        <section className="content-wrap">{children}</section>
      </div>
    </div>
  );
}
