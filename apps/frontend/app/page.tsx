import { env } from "@/lib/env";

export default function HomePage() {
  return (
    <main>
      <h1>SailsHR Frontend</h1>
      <p>API URL: {env.NEXT_PUBLIC_API_URL}</p>
    </main>
  );
}
