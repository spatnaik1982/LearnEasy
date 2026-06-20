import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/auth";
import { DataState } from "@learn-easy/ui";
import DashboardLayout from "../../lib/dashboard-layout";

interface ParentProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  children: { id: string; name: string; age: number; level: string }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ParentProfilePage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    fetch(`${API_URL}/parents/${payload.sub}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        const p = json.data || json;
        setProfile(p);
        setEditName(p.name);
        setEditEmail(p.email);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    if (!profile || !token) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const res = await fetch(`${API_URL}/parents/${payload.sub}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, email: editEmail }),
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
    router.push("/parent/login");
  };

  if (loading) return <DashboardLayout title="Profile"><DataState status="loading" /></DashboardLayout>;

  if (!profile) return <DashboardLayout title="Profile"><DataState status="error" onRetry={() => router.reload()} /></DashboardLayout>;

  return (
    <DashboardLayout title="My Profile">
      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-soft-coral/20 px-4 py-3 text-sm text-soft-coral" aria-live="polite">{error}</div>
      )}
      {success && (
        <div role="status" className="mb-4 rounded-lg bg-muted-green/20 px-4 py-3 text-sm text-muted-green" aria-live="polite">{success}</div>
      )}

      <div className="space-y-8">
        {/* Account Info */}
        <section className="rounded-xl border border-outline-variant bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-text">Account Info</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="min-h-[56px] rounded-lg bg-muted-teal px-6 py-3 text-sm font-semibold text-white hover:bg-muted-teal/90 focus:outline-none focus:ring-2 focus:ring-muted-teal motion-safe:transition-colors">
                Edit
              </button>
            ) : (
              <button onClick={() => { setEditing(false); setEditName(profile.name); setEditEmail(profile.email); }}
                className="min-h-[56px] rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-text hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 motion-safe:transition-colors">
                Cancel
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-slate-text">Name</label>
                <input id="edit-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="min-h-[56px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base focus:border-muted-teal focus:outline-none focus:ring-2 focus:ring-muted-teal" />
              </div>
              <div>
                <label htmlFor="edit-email" className="mb-1 block text-sm font-medium text-slate-text">Email</label>
                <input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                  className="min-h-[56px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base focus:border-muted-teal focus:outline-none focus:ring-2 focus:ring-muted-teal" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="min-h-[56px] w-full rounded-lg bg-muted-green px-6 py-3 text-sm font-semibold text-white hover:bg-muted-green/90 focus:outline-none focus:ring-2 focus:ring-muted-green disabled:opacity-50 motion-safe:transition-colors">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Name</span><span className="text-sm font-medium text-slate-text">{profile.name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Email</span><span className="text-sm font-medium text-slate-text">{profile.email}</span></div>
              <div className="flex justify-between"><span className="text-sm text-on-surface-variant">Member since</span><span className="text-sm font-medium text-slate-text">{new Date(profile.createdAt).toLocaleDateString()}</span></div>
            </div>
          )}
        </section>

        {/* Linked Children */}
        <section className="rounded-xl border border-outline-variant bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-text">Linked Children</h2>
          {profile.children.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No children linked yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {profile.children.map((child) => (
                <li key={child.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-text">{child.name}</p>
                    <p className="text-xs text-on-surface-variant">Age {child.age} &middot; Level {child.level}</p>
                  </div>
                  <span className="rounded-full bg-muted-teal/10 px-3 py-1 text-xs font-medium text-muted-teal">Linked</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Logout */}
        <div className="border-t border-slate-200 pt-6">
          <button onClick={handleLogout}
            className="min-h-[56px] w-full rounded-xl border border-soft-coral bg-white px-8 py-3 text-base font-semibold text-soft-coral hover:bg-soft-coral/5 focus:outline-none focus:ring-2 focus:ring-soft-coral focus:ring-offset-2 motion-safe:transition-colors">
            Log Out
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
