import { Button, Card, Input } from "../../components/ui";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-semibold text-text-primary">SailsHR Login</h1>
        <p className="subtitle">Use one of the seeded users (employee/manager/hr/admin @sailshr.local, password: Pass@123)</p>
        <Card className="mt-6 max-w-lg p-6">
          <form action={loginAction} className="form-col">
            <label htmlFor="email">Email</label>
            <Input id="email" name="email" type="email" required />
            <label htmlFor="password">Password</label>
            <Input id="password" name="password" type="password" required />
            <Button type="submit" variant="primary">Sign in</Button>
          </form>
          {params.error ? <p className="error-text">{params.error}</p> : null}
        </Card>
      </div>
    </main>
  );
}
