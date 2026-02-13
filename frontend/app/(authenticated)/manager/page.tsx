import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../../lib/auth";

export default async function ManagerPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "MANAGER" && user.role !== "HR" && user.role !== "ADMIN") redirect("/");

  const token = (await cookies()).get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const response = await fetch(`${baseUrl}/api/v1/leaves`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });
  const leaves = await response.json();

  return (
    <main>
      <h1>Manager Dashboard</h1>
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Team Leave Approvals</h2>
        <pre>{JSON.stringify(leaves, null, 2)}</pre>
      </section>
    </main>
  );
}
