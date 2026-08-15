import React, { useState, useEffect } from "react";
import { api, setSession, ROLE_LABEL } from "../lib/api.js";
import { Seal, KenyaFlag } from "../components/UI.jsx";

export default function Login({ onAuth, initialMode = "login", onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", password: "", role: "applicant", ward: "",
  });
  const [wards, setWards] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.wards().then((d) => setWards(d.wards)).catch(() => {}); }, []);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    setErr(""); setBusy(true);
    try {
      const res = mode === "login"
        ? await api.login(form.email, form.password)
        : await api.register(form);
      setSession(res.token, res.user);
      onAuth(res.user);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-green text-sand p-10">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-12 w-12 rounded-full bg-green-d border border-gold transition-transform duration-300 hover:scale-105 hover:rotate-3">
            <Seal size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-extrabold text-lg leading-tight">Wajir South Constituency</div>
              <KenyaFlag width={24} />
            </div>
            <div className="text-xs text-[#cde0d1]">NG-CDF Bursary Programme</div>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight animate-fade-up">
            Education support,<br />tracked from<br />application to award.
          </h1>
          <p className="mt-4 max-w-sm text-[#cde0d1] text-sm leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Every application moves through the Area Chief, CDF Manager, Clerk, Chairman and the
            Member of Parliament — with a clear record at each step.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#9dc0a8]">
          <KenyaFlag width={16} />
          Powered by the NG-CDF · Republic of Kenya
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <Seal size={34} />
            <div className="font-extrabold text-green-d">Wajir South Bursary</div>
            <KenyaFlag width={20} />
          </div>

          {onBack && (
            <button onClick={onBack} className="text-sm text-gold-d font-bold hover:underline mb-4">
              ← Back to home
            </button>
          )}

          <div className="flex gap-1 bg-sand-2 border border-line rounded-xl p-1 mb-6">
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setErr(""); }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${mode === m ? "bg-paper text-green shadow-sm" : "text-ink-soft"}`}>
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div className="card space-y-3">
            {mode === "register" && (
              <div>
                <div className="label mb-1">Full name</div>
                <input className="field" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div>
              <div className="label mb-1">Email</div>
              <input className="field" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            </div>
            {mode === "register" && (
              <>
                <div>
                  <div className="label mb-1">Phone</div>
                  <input className="field" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="07XXXXXXXX" />
                </div>
                <div>
                  <div className="label mb-1">Ward</div>
                  <select className="field" value={form.ward} onChange={(e) => set("ward", e.target.value)}>
                    <option value="">—</option>
                    {wards.map((w) => <option key={w}>{w}</option>)}
                  </select>
                </div>
              </>
            )}
            <div>
              <div className="label mb-1">Password</div>
              <input className="field" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && submit()} />
            </div>

            {err && <div className="text-sm text-brick font-medium">{err}</div>}

            <button className="btn-primary w-full" onClick={submit} disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
            {mode === "register" && (
              <p className="text-xs text-ink-soft leading-relaxed">
                This creates an applicant account. Area Chief, CDF Manager, Clerk, Chairman,
                MP and Admin accounts are created by the constituency office in the Admin panel.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
