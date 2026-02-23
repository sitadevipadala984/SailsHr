import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main>
      <h1>SailsHR Login</h1>
      <p className="subtitle">Use one of the seeded users (employee/manager/hr/admin @sailshr.local, password: Pass@123)</p>
      <section className="card mt-4 max-w-lg">
        <form action={loginAction} className="form-col">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
          <button type="submit">Sign in</button>
        </form>
        {params.error ? <p className="error-text">{params.error}</p> : null}
      </section>
    </main>
  );
}
