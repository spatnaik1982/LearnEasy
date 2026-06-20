import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/auth";
import { AppShell } from "@learn-easy/ui";
import Link from "next/link";

interface FormData {
  email: string;
  name: string;
  password: string;
  age: string;
  level: string;
  autismSupportLevel: string;
  readingLevel: string;
  visualSupport: boolean;
  audioSupport: boolean;
  sensorySensitivity: boolean;
  attentionSpan: string;
}

const INITIAL: FormData = {
  email: "",
  name: "",
  password: "",
  age: "",
  level: "A",
  autismSupportLevel: "2",
  readingLevel: "medium",
  visualSupport: true,
  audioSupport: false,
  sensorySensitivity: false,
  attentionSpan: "medium",
};

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof FormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) { setError("Please enter an email."); return; }
    if (!form.name.trim()) { setError("Please enter a name."); return; }
    if (!form.password || form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    const age = parseInt(form.age, 10);
    if (isNaN(age) || age < 3 || age > 99) { setError("Age must be between 3 and 99."); return; }

    setSubmitting(true);
    try {
      await signup({
        email: form.email.trim(),
        name: form.name.trim(),
        password: form.password,
        age,
        level: form.level,
        autismSupportLevel: parseInt(form.autismSupportLevel, 10),
        readingLevel: form.readingLevel,
        visualSupport: form.visualSupport,
        audioSupport: form.audioSupport,
        sensorySensitivity: form.sensorySensitivity,
        attentionSpan: form.attentionSpan,
      });
      router.push("/onboarding/welcome");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell variant="student" footer={null}>
      <div className="mx-auto min-h-[80vh] max-w-lg px-4 py-8">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-text">
          Create Account
        </h1>
        <p className="mb-8 text-center text-sm text-on-surface-variant">
          Set up your learning profile
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-soft-coral/20 px-4 py-3 text-sm text-soft-coral"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {/* Basic Info */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-text">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-text">Full Name</label>
                <input id="name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                  className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue" />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-text">Email</label>
                <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                  className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue" />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-text">Password</label>
                <input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
                  className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue" />
              </div>
              <div>
                <label htmlFor="age" className="mb-1 block text-sm font-medium text-slate-text">Age</label>
                <input id="age" type="number" min={3} max={99} value={form.age} onChange={(e) => update("age", e.target.value)}
                  className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue" />
              </div>
            </div>
          </section>

          {/* Learning Profile */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-text">Learning Profile</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="level" className="mb-1 block text-sm font-medium text-slate-text">NIOS Level</label>
                <select id="level" value={form.level} onChange={(e) => update("level", e.target.value)}
                  className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue">
                  <option value="A">Level A</option>
                  <option value="B">Level B</option>
                  <option value="C">Level C</option>
                </select>
              </div>
              <div>
                <label htmlFor="readingLevel" className="mb-1 block text-sm font-medium text-slate-text">Reading Level</label>
                <select id="readingLevel" value={form.readingLevel} onChange={(e) => update("readingLevel", e.target.value)}
                  className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label htmlFor="attentionSpan" className="mb-1 block text-sm font-medium text-slate-text">Attention Span</label>
                <select id="attentionSpan" value={form.attentionSpan} onChange={(e) => update("attentionSpan", e.target.value)}
                  className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue">
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label htmlFor="autismSupportLevel" className="mb-1 block text-sm font-medium text-slate-text">Support Level</label>
                <select id="autismSupportLevel" value={form.autismSupportLevel} onChange={(e) => update("autismSupportLevel", e.target.value)}
                  className="min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue">
                  <option value="1">Level 1 (Low Support)</option>
                  <option value="2">Level 2 (Moderate Support)</option>
                  <option value="3">Level 3 (High Support)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Sensory Preferences */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-text">Sensory Preferences</h2>
            <div className="space-y-4">
              <Toggle label="Visual Support" checked={form.visualSupport} onChange={(v) => update("visualSupport", v)} />
              <Toggle label="Audio Support" checked={form.audioSupport} onChange={(v) => update("audioSupport", v)} />
              <Toggle label="Sensory Sensitivity" checked={form.sensorySensitivity} onChange={(v) => update("sensorySensitivity", v)} />
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[56px] w-full rounded-xl bg-soft-blue px-8 py-3 text-base font-semibold text-white hover:bg-soft-blue/90 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 disabled:opacity-50 motion-safe:transition-colors motion-safe:duration-200"
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-soft-blue underline hover:text-soft-blue/80">
            Log In
          </Link>
        </p>
      </div>
    </AppShell>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-[56px] items-center justify-between rounded-xl border border-slate-300 bg-white px-4">
      <span className="text-sm font-medium text-slate-text">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-soft-blue focus:ring-offset-2 ${checked ? "bg-soft-blue" : "bg-slate-300"}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform motion-safe:duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </label>
  );
}
