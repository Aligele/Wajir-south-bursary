import React, { useState } from "react";
import { api } from "../lib/api.js";
import { Seal, KenyaFlag } from "../components/UI.jsx";

export default function ResetPassword({ token, onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setErr("");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password !== confirm) return setErr("Passwords don't match.");
    setBusy(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-up">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <Seal size={34} />
          <div className="font-extrabold text-green-d">Wajir South Bursary</div>
          <KenyaFlag width={20} />
        </div>

        <div className="card space-y-3">
          {done ? (
            <>
              <div className="bg-[#dff0e4] text-green-d text-sm font-semibold rounded-lg px-3.5 py-3">
                Your password has been reset. You can now sign in with your new password.
              </div>
              <button className="btn-primary w-full" onClick={onDone}>Go to sign in</button>
            </>
          ) : (
            <>
              <div>
                <div className="font-bold text-ink text-lg">Set a new password</div>
                <p className="text-xs text-ink-soft mt-1">Choose a new password for your account.</p>
              </div>
              <div>
                <div className="label mb-1">New password</div>
                <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <div className="label mb-1">Confirm new password</div>
                <input className="field" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && submit()} />
              </div>
              {err && <div className="text-sm text-brick font-medium">{err}</div>}
              <button className="btn-primary w-full" onClick={submit} disabled={busy}>
                {busy ? "Saving…" : "Reset password"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
