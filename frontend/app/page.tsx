import { redirect } from "next/navigation";
import { getSessionUser, roleHome } from "../lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  redirect(roleHome(user.role));
}
