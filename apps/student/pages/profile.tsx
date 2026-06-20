import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/auth";
import { AppShell, DataState } from "@learn-easy/ui";

interface StudentProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  level: string;
  autismSupportLevel: number;
  readingLevel: string;
  visualSupport: boolean;
  audioSupport: boolean;
  sensorySensitivity: boolean;
  attentionSpan: string;
  onboardedAt: string | null;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ProfilePage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<StudentProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    fetch(`${API_URL}/students/${payload.sub}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        setProfile(json.data || json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const startEdit = () => {
    if (!profile) return;
    setEditData({ ...profile });
    setEditing(true);
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditData({});
    setError("");
  };

  const handleSave = async () => {
    if (!profile || !token) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const res = await fetch(`${API_URL}/students/${payload.sub}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update profile");

      setProfile(json.data || json);
      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) return <AppShell variant="student"><DataState status="loading" /></AppShell>;

  if (!profile) return <AppShell variant="student"><DataState status="error" onRetry={() => router.reload()} /></AppShell>;

  return (
    <AppShell variant="student">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-text">My Profile</h1>
          <div className="flex gap-3">
            {!editing ? (
              <button onClick={startEdit}
                className="min-h-[56px] rounded-xl bg-soft-blue px-6 py-3 text-sm font-semibold text-white hover:bg-soft-blue/90 focus:outline-none focus:ring-2 focus:ring-soft-blue motion-safe:transition-colors">
                Edit Profile
              </button>
            ) : (
              <button onClick={cancelEdit}
                className="min-h-[56px] rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-text hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 motion-safe:transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-lg bg-soft-coral/20 px-4 py-3 text-sm text-soft-coral" aria-live="polite">{error}</div>
        )}
        {success && (
          <div role="status" className="mb-4 rounded-lg bg-muted-green/20 px-4 py-3 text-sm text-muted-green" aria-live="polite">{success}</div>
        )}

        {/* Basic Info */}
        <Section title="Basic Info">
          <Field label="Name" value={profile.name} editing={editing}
            renderEdit={() => <TextInput value={editData.name || ""} onChange={(v) => setEditData((d) => ({ ...d, name: v }))} />} />
          <Field label="Email" value={profile.email} />
          <Field label="Age" value={String(profile.age)} editing={editing}
            renderEdit={() => <NumberInput value={editData.age ?? profile.age} onChange={(v) => setEditData((d) => ({ ...d, age: v }))} />} />
        </Section>

        {/* Learning Profile */}
        <Section title="Learning Profile">
          <Field label="NIOS Level" value={profile.level} editing={editing}
            renderEdit={() => (
              <Select value={editData.level || profile.level} options={["A", "B", "C"]} onChange={(v) => setEditData((d) => ({ ...d, level: v }))} />
            )} />
          <Field label="Reading Level" value={profile.readingLevel} editing={editing}
            renderEdit={() => (
              <Select value={editData.readingLevel || profile.readingLevel} options={["low", "medium", "high"]} onChange={(v) => setEditData((d) => ({ ...d, readingLevel: v }))} />
            )} />
          <Field label="Support Level" value={`Level ${profile.autismSupportLevel}`} editing={editing}
            renderEdit={() => (
              <Select value={String(editData.autismSupportLevel ?? profile.autismSupportLevel)} options={["1", "2", "3"]}
                labels={["Level 1 (Low)", "Level 2 (Moderate)", "Level 3 (High)"]}
                onChange={(v) => setEditData((d) => ({ ...d, autismSupportLevel: parseInt(v, 10) }))} />
            )} />
          <Field label="Attention Span" value={profile.attentionSpan} editing={editing}
            renderEdit={() => (
              <Select value={editData.attentionSpan || profile.attentionSpan} options={["short", "medium", "long"]} onChange={(v) => setEditData((d) => ({ ...d, attentionSpan: v }))} />
            )} />
        </Section>

        {/* Sensory Preferences */}
        <Section title="Sensory Preferences">
          <Field label="Visual Support" value={profile.visualSupport ? "Yes" : "No"} editing={editing}
            renderEdit={() => (
              <Toggle checked={editData.visualSupport ?? profile.visualSupport} onChange={(v) => setEditData((d) => ({ ...d, visualSupport: v }))} />
            )} />
          <Field label="Audio Support" value={profile.audioSupport ? "Yes" : "No"} editing={editing}
            renderEdit={() => (
              <Toggle checked={editData.audioSupport ?? profile.audioSupport} onChange={(v) => setEditData((d) => ({ ...d, audioSupport: v }))} />
            )} />
          <Field label="Sensory Sensitivity" value={profile.sensorySensitivity ? "Yes" : "No"} editing={editing}
            renderEdit={() => (
              <Toggle checked={editData.sensorySensitivity ?? profile.sensorySensitivity} onChange={(v) => setEditData((d) => ({ ...d, sensorySensitivity: v }))} />
            )} />
        </Section>

        {/* Account */}
        <Section title="Account">
          <Field label="Member since" value={new Date(profile.createdAt).toLocaleDateString()} />
        </Section>

        {editing && (
          <button onClick={handleSave} disabled={saving}
            className="mt-6 min-h-[56px] w-full rounded-xl bg-muted-green px-8 py-3 text-base font-semibold text-white hover:bg-muted-green/90 focus:outline-none focus:ring-2 focus:ring-muted-green focus:ring-offset-2 disabled:opacity-50 motion-safe:transition-colors">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}

        <div className="mt-8 border-t border-slate-200 pt-6">
          <button onClick={handleLogout}
            className="min-h-[56px] w-full rounded-xl border border-soft-coral bg-white px-8 py-3 text-base font-semibold text-soft-coral hover:bg-soft-coral/5 focus:outline-none focus:ring-2 focus:ring-soft-coral focus:ring-offset-2 motion-safe:transition-colors">
            Log Out
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-xl border border-outline-variant bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-text">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, value, editing, renderEdit }: { label: string; value: string; editing?: boolean; renderEdit?: () => React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-on-surface-variant">{label}</span>
      {editing && renderEdit ? renderEdit() : <span className="text-sm text-slate-text">{value}</span>}
    </div>
  );
}

function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
      className="min-h-[56px] w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-text focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue" />
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input type="number" min={3} max={99} value={value} onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
      className="min-h-[56px] w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-text focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue" />
  );
}

function Select({ value, options, labels, onChange }: { value: string; options: string[]; labels?: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="min-h-[56px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-text focus:border-soft-blue focus:outline-none focus:ring-2 focus:ring-soft-blue">
      {options.map((opt, i) => (
        <option key={opt} value={opt}>{labels ? labels[i] : opt}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-soft-blue ${checked ? "bg-soft-blue" : "bg-slate-300"}`}>
      <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform motion-safe:duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}
