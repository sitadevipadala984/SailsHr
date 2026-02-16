import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AuthShell from "../../components/auth-shell";
import { getSessionUser } from "../../lib/auth";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <AuthShell user={user}>{children}</AuthShell>;
}
