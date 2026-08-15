import React, { useState, useEffect, useCallback } from "react";
import { getUser, clearSession, ROLE_LABEL } from "./lib/api.js";
import { Seal, KenyaFlag } from "./components/UI.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Applicant from "./pages/Applicant.jsx";
import Reviewer from "./pages/Reviewer.jsx";
import Admin from "./pages/Admin.jsx";
import History from "./pages/History.jsx";

export default function App() {
  const [user, setUser] = useState(getUser());
  const [toastMsg, setToastMsg] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [publicView, setPublicView] = useState("landing"); // landing | login | register

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  }, []);

  useEffect(() => { setUser(getUser()); }, []);

  function logout() { clearSession(); setUser(null); setPublicView("landing"); }

  if (!user) {
    if (publicView === "landing") {
      return (
        <>
          <Landing
            onApply={() => setPublicView("register")}
            onSignIn={() => setPublicView("login")}
            onHistory={() => setShowHistory(true)}
          />
          {showHistory && <History onClose={() => setShowHistory(false)} />}
        </>
      );
    }
    return (
      <Login onAuth={setUser} initialMode={publicView} onBack={() => setPublicView("landing")} />
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-5 py-3 bg-green text-sand border-b-[3px] border-gold">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-11 w-11 rounded-full bg-green-d border border-gold transition-transform duration-200 hover:scale-105">
            <Seal size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-extrabold leading-tight">Wajir South Constituency</div>
              <KenyaFlag width={22} />
            </div>
            <div className="text-xs text-[#cde0d1]">NG-CDF Bursary System</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory(true)}
            className="text-xs font-semibold border border-gold/60 rounded-lg px-3 py-2 transition-all duration-150 hover:bg-black/20 hover:-translate-y-px active:scale-95 hidden sm:block">
            History
          </button>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold">{user.full_name || user.name}</div>
            <div className="text-xs text-[#cde0d1]">{ROLE_LABEL[user.role]}</div>
          </div>
          <button onClick={logout} className="text-xs font-semibold border border-gold rounded-lg px-3 py-2 bg-green-d transition-all duration-150 hover:bg-black/20 hover:-translate-y-px active:scale-95">
            Sign out
          </button>
        </div>
      </header>

      <button onClick={() => setShowHistory(true)}
        className="sm:hidden mx-4 mt-4 text-xs font-semibold text-gold-d border border-gold/40 rounded-lg px-3 py-2 bg-paper w-fit">
        📖 Read the history of Wajir South
      </button>

      <main key={user.role} className="px-4 py-6 animate-fade-up">
        {user.role === "applicant"
          ? <Applicant toast={toast} />
          : user.role === "admin"
          ? <Admin toast={toast} />
          : <Reviewer user={user} toast={toast} />}
      </main>

      {showHistory && <History onClose={() => setShowHistory(false)} />}

      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 z-50 bg-green-d text-white px-5 py-3 rounded-xl font-semibold shadow-xl animate-toast">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
