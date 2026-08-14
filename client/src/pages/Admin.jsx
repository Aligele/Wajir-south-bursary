import React, { useState, useEffect } from "react";
import { api, ROLE_LABEL } from "../lib/api.js";

const ROLES = ["applicant", "chief", "cdf_manager", "clerk", "chairman", "mp", "admin"];

export default function Admin({ toast }) {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  async function refresh() {
    setLoading(true);
    try {
      const [u, w] = await Promise.all([api.adminListUsers(), api.wards()]);
      setUsers(u.users); setWards(w.wards);
    } catch (e) { toast(e.message); }
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
      <div className="inline-flex gap-1 bg-sand-2 border border-line rounded-xl p-1">
        {[["users", "Accounts"], ["sublocations", "Wards & Sub-locations"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${tab === k ? "bg-paper text-green shadow-sm" : "text-ink-soft"}`}>{l}</button>
        ))}
      </div>

      {tab === "sublocations" ? (
        <SubLocations wards={wards} toast={toast} />
      ) : (
        <>
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
                          <div className="text-xs text-ink-soft truncate">
                            {u.email}{u.phone ? " · " + u.phone : ""}
                            {u.role === "chief" && (
                              <> · {u.sub_location ? <span className="text-green-d font-semibold">{u.sub_location}</span> : <span className="italic">general pool (no sub-location assigned)</span>}</>
                            )}
                          </div>
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
        </>
      )}

      {showForm && (
        <UserForm
          user={editingUser}
          wards={wards}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); refresh(); }}
          toast={toast}
        />
      )}
    </div>
  );
}

function UserForm({ user, wards, onClose, onSaved, toast }) {
  const isEdit = !!user;
  const [f, setF] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "cdf_manager",
    ward: user?.ward || "",
    sub_location: user?.sub_location || "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [subLocs, setSubLocs] = useState([]);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (f.role !== "chief" || !f.ward) { setSubLocs([]); return; }
    api.subLocations(f.ward).then((d) => setSubLocs(d.subLocations)).catch(() => setSubLocs([]));
  }, [f.role, f.ward]);

  async function submit() {
    if (!f.full_name.trim()) return toast("Enter a name.");
    if (!isEdit && (!f.email.trim() || !f.password)) return toast("Email and password are required.");
    setBusy(true);
    try {
      const payload = { full_name: f.full_name, phone: f.phone, role: f.role, ward: f.ward || null, sub_location: f.role === "chief" ? (f.sub_location || null) : null };
      if (isEdit) {
        if (f.password) payload.password = f.password;
        await api.adminUpdateUser(user.id, payload);
        toast("Account updated.");
      } else {
        await api.adminCreateUser({ ...payload, email: f.email, password: f.password });
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
          {f.role === "chief" && (
            <>
              <div>
                <div className="label mb-1">Ward</div>
                <select className="field" value={f.ward} onChange={(e) => set("ward", e.target.value)}>
                  <option value="">Select…</option>
                  {wards.map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <div className="label mb-1">Sub-location covered</div>
                {subLocs.length > 0 ? (
                  <select className="field" value={f.sub_location} onChange={(e) => set("sub_location", e.target.value)}>
                    <option value="">General pool (sees all in this ward)</option>
                    {subLocs.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                ) : (
                  <div className="text-xs text-ink-soft">
                    {f.ward ? "No sub-locations added for this ward yet — add them under Wards & Sub-locations first." : "Select a ward first."}
                  </div>
                )}
              </div>
            </>
          )}
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

function SubLocations({ wards, toast }) {
  const [subLocs, setSubLocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ward, setWard] = useState(wards[0] || "");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    try { const d = await api.adminListSubLocations(); setSubLocs(d.subLocations); }
    catch (e) { toast(e.message); }
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (wards.length && !ward) setWard(wards[0]); }, [wards]);

  async function add() {
    if (!ward || !name.trim()) return toast("Choose a ward and enter a sub-location name.");
    setBusy(true);
    try {
      await api.adminAddSubLocation({ ward, name: name.trim() });
      setName("");
      toast("Sub-location added.");
      refresh();
    } catch (e) { toast(e.message); }
    setBusy(false);
  }

  async function remove(s) {
    if (!confirm(`Remove "${s.name}" from ${s.ward}?`)) return;
    try { await api.adminDeleteSubLocation(s.id); toast("Removed."); refresh(); }
    catch (e) { toast(e.message); }
  }

  const byWard = wards.reduce((acc, w) => ({ ...acc, [w]: subLocs.filter((s) => s.ward === w) }), {});

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="text-lg font-extrabold text-green-d">Wards &amp; sub-locations</h2>
        <p className="text-sm text-ink-soft mt-1">
          Add each real sub-location as you confirm its Area Chief. Applicants pick their
          sub-location on the form, and it routes to the chief assigned to it.
        </p>
        <div className="grid sm:grid-cols-[1fr,1fr,auto] gap-3 mt-4">
          <select className="field" value={ward} onChange={(e) => setWard(e.target.value)}>
            {wards.map((w) => <option key={w}>{w}</option>)}
          </select>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sub-location name" />
          <button className="btn-primary" onClick={add} disabled={busy}>Add</button>
        </div>
      </div>

      {loading ? (
        <div className="card text-ink-soft">Loading…</div>
      ) : (
        wards.map((w) => byWard[w]?.length > 0 && (
          <div key={w} className="card">
            <div className="text-sm font-bold text-green-d mb-2 uppercase tracking-wide">{w}</div>
            <div className="space-y-1.5">
              {byWard[w].map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-sand-2 rounded-lg px-3 py-2">
                  <span className="text-sm text-ink">{s.name}</span>
                  <button className="text-brick text-xs font-bold" onClick={() => remove(s)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
