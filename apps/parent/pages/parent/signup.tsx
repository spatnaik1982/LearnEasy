import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/auth";
import Link from "next/link";

export default function ParentSignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-off-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-2 text-center">
          <h1 className="text-2xl font-bold text-slate-text">Create Parent Account</h1>
          <p className="text-sm text-muted-teal">Arin Learn — Parent Sign Up</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div role="alert" className="rounded-lg bg-soft-coral/20 px-4 py-3 text-sm text-soft-coral" aria-live="polite">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-text">Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-muted-teal focus:outline-none focus:ring-2 focus:ring-muted-teal" />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-text">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-muted-teal focus:outline-none focus:ring-2 focus:ring-muted-teal" />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-text">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-muted-teal focus:outline-none focus:ring-2 focus:ring-muted-teal" />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-text">Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-muted-teal focus:outline-none focus:ring-2 focus:ring-muted-teal" />
          </div>

          <button type="submit" disabled={submitting}
            className="min-h-[56px] w-full rounded-xl bg-muted-teal px-8 py-3 text-base font-semibold text-white hover:bg-muted-teal/90 focus:outline-none focus:ring-2 focus:ring-muted-teal focus:ring-offset-2 disabled:opacity-50 motion-safe:transition-colors motion-safe:duration-200">
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/parent/login" className="font-medium text-muted-teal underline hover:text-muted-teal/80">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
