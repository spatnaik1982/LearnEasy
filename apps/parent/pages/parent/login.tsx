import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/auth";
import Link from "next/link";

export default function ParentLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-off-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-2 text-center">
          <h1 className="text-2xl font-bold text-slate-text">Parent Portal</h1>
          <p className="text-sm text-muted-teal">Arin Learn — Parent Login</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div role="alert" className="rounded-lg bg-soft-coral/20 px-4 py-3 text-sm text-soft-coral" aria-live="polite">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-text">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-text placeholder-slate-400 focus:border-muted-teal focus:outline-none focus:ring-2 focus:ring-muted-teal"
              placeholder="your@email.com" autoComplete="email" />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-text">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-text placeholder-slate-400 focus:border-muted-teal focus:outline-none focus:ring-2 focus:ring-muted-teal"
              placeholder="Enter your password" autoComplete="current-password" />
          </div>

          <button type="submit" disabled={submitting}
            className="min-h-[56px] w-full rounded-xl bg-muted-teal px-8 py-3 text-base font-semibold text-white hover:bg-muted-teal/90 focus:outline-none focus:ring-2 focus:ring-muted-teal focus:ring-offset-2 disabled:opacity-50 motion-safe:transition-colors motion-safe:duration-200">
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link href="/parent/signup" className="font-medium text-muted-teal underline hover:text-muted-teal/80">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
