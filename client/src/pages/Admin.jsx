import React, { useState, useEffect } from "react";
import { api, ROLE_LABEL } from "../lib/api.js";

const ROLES = ["applicant", "chief", "cdf_manager", "clerk", "chairman", "mp", "admin"];

export default function Admin({ toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  async function refresh() {
    setLoading(true);
    try { const d = await api.adminListUsers(); setUsers(d.users); }
    catch (e) { toast(e.message); }
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function handleDelete(u) {
    if (!confirm(`Delete ${u.full_name}'s account? This can't be undone.`)) return;
    try { await api.adminDeleteUser(u.id); toast("Account deleted."); refresh(); }
    catch (e) { toast(e.message); }
  }

  const grouped = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r) }), {});

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-green-d">Manage accounts</h2>
          <p className="text-sm text-ink-soft mt-0.5">{users.length} account{users.length === 1 ? "" : "s"} total</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingUser(null); setShowForm(true); }}>
          + New account
        </button>
      </div>

      {loading ? (
        <div className="card text-ink-soft">Loading…</div>
      ) : (
        <div className="space-y-6">
          {ROLES.map((role) => grouped[role].length > 0 && (
            <div key={role}>
              <div className="text-sm font-bold text-green-d mb-2 uppercase tracking-wide">
                {ROLE_LABEL[role]} <span className="text-ink-soft font-semibold">({grouped[role].length})</span>
              </div>
              <div className="space-y-2">
                {grouped[role].map((u) => (
                  <div key={u.id} className="card flex items-center justify-between gap-3 py-3.5">
                    <div className="min-w-0">
                      <div className="font-bold text-ink truncate">{u.full_name}</div>
                      <div className="text-xs text-ink-soft truncate">{u.email}{u.phone ? " · " + u.phone : ""}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => { setEditingUser(u); setShowForm(true); }}>Edit</button>
                      <button className="btn-reject !px-3 !py-1.5 text-xs" onClick={() => handleDelete(u)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); refresh(); }}
          toast={toast}
        />
      )}
    </div>
  );
}

function UserForm({ user, onClose, onSaved, toast }) {
  const isEdit = !!user;
  const [f, setF] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "cdf_manager",
    ward: user?.ward || "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  async function submit() {
    if (!f.full_name.trim()) return toast("Enter a name.");
    if (!isEdit && (!f.email.trim() || !f.password)) return toast("Email and password are required.");
    setBusy(true);
    try {
      if (isEdit) {
        const payload = { full_name: f.full_name, phone: f.phone, role: f.role, ward: f.ward || null };
        if (f.password) payload.password = f.password;
        await api.adminUpdateUser(user.id, payload);
        toast("Account updated.");
      } else {
        await api.adminCreateUser(f);
        toast("Account created.");
      }
      onSaved();
    } catch (e) { toast(e.message); }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-sand rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-green text-sand px-5 py-4 flex justify-between items-center">
          <div className="font-extrabold text-lg">{isEdit ? "Edit account" : "New account"}</div>
          <button onClick={onClose} className="text-2xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-3.5">
          <div>
            <div className="label mb-1">Full name</div>
            <input className="field" value={f.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </div>
          {!isEdit && (
            <div>
              <div className="label mb-1">Email</div>
              <input className="field" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="name@wajirsouth.go.ke" />
            </div>
          )}
          <div>
            <div className="label mb-1">Phone</div>
            <input className="field" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="07XXXXXXXX" />
          </div>
          <div>
            <div className="label mb-1">Role</div>
            <select className="field" value={f.role} onChange={(e) => set("role", e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          <div>
            <div className="label mb-1">{isEdit ? "New password (leave blank to keep current)" : "Password"}</div>
            <input className="field" type="text" value={f.password} onChange={(e) => set("password", e.target.value)} placeholder={isEdit ? "••••••••" : "Set a starting password"} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={busy}>
              {busy ? "Saving…" : isEdit ? "Save changes" : "Create account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
