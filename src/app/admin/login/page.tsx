import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { adminConfigured, isAdmin } from "@/lib/server/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="a-login">
      <div className="a-login__card">
        <Logo className="a-login__logo" />
        <h1>Portfolio admin</h1>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="a-note a-note--warn">
            The admin is switched off. Set <code>ADMIN_PASSWORD</code> in <code>.env.local</code>, or in the
            host&rsquo;s environment variables, then restart the server.
          </p>
        )}
      </div>
    </main>
  );
}
