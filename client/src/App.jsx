import React, { useState, useEffect, useCallback } from "react";
import { getUser, clearSession, ROLE_LABEL } from "./lib/api.js";
import { Seal } from "./components/UI.jsx";
import Login from "./pages/Login.jsx";
import Applicant from "./pages/Applicant.jsx";
import Reviewer from "./pages/Reviewer.jsx";

export default function App() {
  const [user, setUser] = useState(getUser());
  const [toastMsg, setToastMsg] = useState(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  }, []);

  useEffect(() => { setUser(getUser()); }, []);

  function logout() { clearSession(); setUser(null); }

  if (!user) return <Login onAuth={setUser} />;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-5 py-3 bg-green text-sand border-b-[3px] border-gold">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-11 w-11 rounded-full bg-green-d border border-gold">
            <Seal size={30} />
          </div>
          <div>
            <div className="font-extrabold leading-tight">Wajir South Constituency</div>
            <div className="text-xs text-[#cde0d1]">NG-CDF Bursary System</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold">{user.full_name || user.name}</div>
            <div className="text-xs text-[#cde0d1]">{ROLE_LABEL[user.role]}</div>
          </div>
          <button onClick={logout} className="text-xs font-semibold border border-gold rounded-lg px-3 py-2 bg-green-d hover:bg-black/20">
            Sign out
          </button>
        </div>
      </header>

      <main className="px-4 py-6">
        {user.role === "applicant"
          ? <Applicant toast={toast} />
          : <Reviewer user={user} toast={toast} />}
      </main>

      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-green-d text-white px-5 py-3 rounded-xl font-semibold shadow-xl">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
