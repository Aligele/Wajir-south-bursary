import React, { useState, useEffect } from "react";
import { api, getToken, ROLE_LABEL } from "../lib/api.js";
import { Pipeline, StatusTag, money, fmtDate, WardDot } from "../components/UI.jsx";

const STAGE_LABEL = { submitted: "Submitted", chief: "Area Chief", manager: "CDF Manager", clerk: "Clerk", chairman: "Chairman", mp: "MP", approved: "Approved" };

const CAT_TABS = [
  { key: "all",                 label: "All" },
  { key: "high_school",         label: "🏫 High School" },
  { key: "diploma_certificate", label: "📜 Diploma & Certificate" },
  { key: "bachelor",            label: "🎓 Bachelor's Degree" },
];

export default function Reviewer({ user, toast }) {
  const [view, setView] = useState("queue"); // queue | all | committee | analytics | reports
  const [catFilter, setCatFilter] = useState("all");
  const [apps, setApps] = useState([]);
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  async function refresh() {
    setLoading(true);
    try {
      const d = await api.listApps(view === "all" || view === "reports" || view === "committee" ? "all" : undefined);
      setApps(d.applications);
      if (view === "reports") setSummary(await api.summary());
      if (view === "analytics") setAnalytics(await api.analytics());
    } catch (e) { toast(e.message); }
    setLoading(false);
  }
  useEffect(() => { refresh(); }, [view]);

  const filteredApps = catFilter === "all" ? apps
    : apps.filter((a) => a.edu_category === catFilter);

  const tabs = [["queue", "My review queue"], ["all", "All applications"], ["committee", "Committee view"], ["analytics", "Analytics"], ["reports", "Reports"]];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="inline-flex flex-wrap gap-1 bg-sand-2 border border-line rounded-xl p-1">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${view === k ? "bg-paper text-green shadow-sm" : "text-ink-soft"}`}>{l}</button>
        ))}
      </div>

      {view === "reports" ? (
        <Reports summary={summary} />
      ) : view === "analytics" ? (
        <Analytics data={analytics} loading={loading} />
      ) : view === "committee" ? (
        <CommitteeView apps={filteredApps} loading={loading} catFilter={catFilter} setCatFilter={setCatFilter} />
      ) : (
        <>
          <Kpis apps={apps} view={view} role={user.role} />

          {user.role === "mp" && view === "queue" && (
            <BulkAward apps={apps} toast={toast} onDone={refresh} />
          )}

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CAT_TABS.map((t) => {
              const count = t.key === "all" ? apps.length : apps.filter((a) => a.edu_category === t.key).length;
              return (
                <button key={t.key} onClick={() => setCatFilter(t.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border transition
                    ${catFilter === t.key ? "bg-green text-white border-green" : "bg-paper border-line text-ink-soft hover:border-gold"}`}>
                  {t.label}
                  <span className={`text-[11px] rounded-full px-1.5 py-0.5 font-bold ${catFilter === t.key ? "bg-white/20" : "bg-sand-2"}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-green-d">
              {ROLE_LABEL[user.role]} · {view === "queue" ? "awaiting your review" : "all applications"}
              {catFilter !== "all" && <span className="text-gold-d"> · {CAT_TABS.find(t=>t.key===catFilter)?.label}</span>}
            </h2>
            <p className="text-sm text-ink-soft mt-0.5">
              {view === "queue"
                ? "Applications reach you after the previous office approves."
                : "A full view of every application in the system."}
            </p>
          </div>
          <QueueList apps={filteredApps} loading={loading} onOpen={setOpenId} view={view} />
        </>
      )}

      {openId && (
        <Drawer id={openId} user={user} onClose={() => setOpenId(null)}
          onDone={() => { setOpenId(null); refresh(); }} toast={toast} />
      )}
    </div>
  );
}

function Kpis({ apps, view, role }) {
  const awaiting = view === "queue" ? apps.length : apps.filter((a) => a.stage === {chief:"chief",cdf_manager:"manager",clerk:"clerk",chairman:"chairman",mp:"mp"}[role] && a.status === "in_review").length;
  const approved = apps.filter((a) => a.status === "approved").length;
  return (
    <div className="grid grid-cols-3 gap-3">
      {[[awaiting, "Awaiting review"], [approved, "Approved"], [apps.length, view === "queue" ? "In your queue" : "Total"]].map(([n, l]) => (
        <div key={l} className="card py-4">
          <div className="text-3xl font-extrabold text-green-d leading-none">{n}</div>
          <div className="text-xs text-ink-soft font-semibold mt-1">{l}</div>
        </div>
      ))}
    </div>
  );
}

function BulkAward({ apps, toast, onDone }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("high_school");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const matching = apps.filter((a) => a.edu_category === category);
  const flaggedCount = matching.filter((a) => a.flagged).length;

  async function apply() {
    if (!(Number(amount) > 0)) return toast("Enter a valid amount.");
    const label = CAT_TABS.find((t) => t.key === category)?.label || category;
    if (!confirm(`Award ${money(amount)} to all ${matching.length - flaggedCount} eligible ${label} applicant(s) in your queue right now?`)) return;
    setBusy(true);
    try {
      const r = await api.bulkAward({ edu_category: category, amount: Number(amount) });
      toast(`Awarded ${r.awarded} application(s).` + (r.skipped ? ` ${r.skipped} skipped (flagged).` : ""));
      setOpen(false); setAmount("");
      onDone();
    } catch (e) { toast(e.message); }
    setBusy(false);
  }

  return (
    <div className="card">
      <button className="w-full flex items-center justify-between text-left" onClick={() => setOpen((o) => !o)}>
        <div>
          <div className="font-bold text-ink">Give one amount to a whole category</div>
          <div className="text-xs text-ink-soft mt-0.5">Award every applicant in a category the same amount at once, instead of one by one.</div>
        </div>
        <span className="text-gold-d text-lg">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-3 pt-4 border-t border-line">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="label mb-1">Category</div>
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CAT_TABS.filter((t) => t.key !== "all").map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <div className="label mb-1">Amount per applicant (KES)</div>
              <input className="field" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 15000" />
            </div>
          </div>
          <div className="text-sm text-ink-soft">
            {matching.length} applicant(s) waiting in this category
            {flaggedCount > 0 && <span className="text-brick font-semibold"> · {flaggedCount} flagged (will be skipped until cleared)</span>}
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" onClick={apply} disabled={busy || !matching.length}>
              {busy ? "Awarding…" : "Award all now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QueueList({ apps, loading, onOpen, view }) {
  if (loading) return <div className="card text-ink-soft">Loading…</div>;
  if (!apps.length) return (
    <div className="card">
      <div className="font-bold text-ink">{view === "queue" ? "Your queue is clear." : "Nothing here yet."}</div>
      <div className="text-sm text-ink-soft mt-1">No applications to show right now.</div>
    </div>
  );
  return (
    <div className="space-y-4">
      {apps.map((a) => (
        <button key={a.id} onClick={() => onOpen(a.id)}
          className="card w-full text-left space-y-3.5 hover:border-gold hover:shadow-lg hover:-translate-y-1 transition-all duration-200 active:translate-y-0 active:shadow-sm animate-fade-up">
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-ink">{a.student_name}</div>
                {a.flagged && <span className="tag bg-[#f6ddd6] text-brick">⚠ Flagged</span>}
              </div>
              <div className="text-xs text-ink-soft mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{a.id} · {a.institution}</span>
                {a.course_name && <span>· <span className="font-semibold text-green-d">{a.course_name}</span></span>}
                <span className="inline-flex items-center gap-1"><WardDot ward={a.ward} /> {a.ward} ward{a.sub_location ? ` (${a.sub_location})` : ""}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="font-extrabold text-green-d text-sm">{money(a.amount_requested)}</div>
              {view === "queue"
                ? <span className="text-xs font-bold text-gold-d">Review →</span>
                : <StatusTag status={a.status} />}
            </div>
          </div>
          <Pipeline stage={a.stage} status={a.status} />
        </button>
      ))}
    </div>
  );
}

function Drawer({ id, user, onClose, onDone, toast }) {
  const [data, setData] = useState(null);
  const [note, setNote] = useState("");
  const [award, setAward] = useState("");
  const [busy, setBusy] = useState(false);
  const [ackBusy, setAckBusy] = useState(false);

  useEffect(() => { api.getApp(id).then((d) => { setData(d); setAward(d.application.amount_requested); }); }, [id]);

  const myStage = { chief: "chief", cdf_manager: "manager", clerk: "clerk", chairman: "chairman", mp: "mp" }[user.role];
  const app = data?.application;
  const canAct = app && app.stage === myStage && app.status === "in_review" && !app.flagged;

  async function acknowledgeFlag() {
    setAckBusy(true);
    try {
      await api.acknowledgeFlag(id);
      const fresh = await api.getApp(id);
      setData(fresh);
      toast("Flag cleared — you can now review normally.");
    } catch (e) { toast(e.message); }
    setAckBusy(false);
  }

  async function act(action) {
    setBusy(true);
    try {
      const payload = { action, note };
      if (user.role === "mp" && action === "approve") payload.award_amount = Number(award) || app.amount_requested;
      await api.decide(id, payload);
      toast(action === "approve" ? "Approved." : action === "return" ? "Returned." : "Rejected.");
      onDone();
    } catch (e) { toast(e.message); setBusy(false); }
  }

  async function openDoc(docId) {
    try { const { url } = await api.docLink(docId); window.open(url, "_blank"); }
    catch (e) { toast(e.message); }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={onClose}>
      <aside className="w-full max-w-md h-full overflow-y-auto bg-sand shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {!data ? <div className="p-6 text-ink-soft">Loading…</div> : (
          <>
            <div className="sticky top-0 z-10 flex justify-between items-center bg-green text-sand px-5 py-4">
              <div>
                <div className="font-extrabold text-lg">{app.student_name}</div>
                <div className="text-xs text-[#cde0d1]">{app.id}</div>
              </div>
              <button onClick={onClose} className="text-2xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-4">
              <StatusTag status={app.status} />
              <Pipeline stage={app.stage} status={app.status} />

              {app.flagged && (
                <div className="card !bg-[#f6ddd6] !border-brick space-y-2.5">
                  <div className="flex items-center gap-2 text-brick font-extrabold">
                    <span className="text-lg">⚠</span> Needs confirmation before review
                  </div>
                  <p className="text-sm text-ink">{app.flag_reason}</p>
                  <button className="btn-primary !bg-brick" onClick={acknowledgeFlag} disabled={ackBusy}>
                    {ackBusy ? "Clearing…" : "I've checked this — allow review"}
                  </button>
                </div>
              )}


              <div className="card grid grid-cols-2 gap-x-4 gap-y-3">
                {[["Institution", app.institution], ["Level", app.level], ["Ward", app.ward],
                  ["Location", app.admin_location || "—"], ["Sub-location", app.sub_location || "—"], ["Village", app.village || "—"],
                  ["Permanent address", app.permanent_address || "—"],
                  ["Gender", app.gender ? (app.gender === "male" ? "Male" : "Female") : "—"],
                  ["Student ID/Birth Cert.", app.student_id_no || "—"],
                  ["Admission no.", app.admission_no || "—"], ["Guardian", app.guardian_name],
                  ["Phone", app.phone], ["Guardian ID", app.id_number], ["Applied", fmtDate(app.created_at)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft">{k}</div>
                    <div className="text-sm text-ink">{v}</div>
                  </div>
                ))}
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft">Requested</div>
                  <div className="text-sm font-extrabold text-green-d">{money(app.amount_requested)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft">Annual fees</div>
                  <div className="text-sm text-ink">{app.annual_fees ? money(app.annual_fees) : "—"}</div>
                </div>
                {app.award_amount != null && (
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft">Awarded</div>
                    <div className="text-sm font-extrabold text-green-d">{money(app.award_amount)}</div>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-1">Reason for request</div>
                <p className="text-sm text-ink leading-relaxed">{app.reason}</p>
              </div>

              {data.documents.length > 0 && (
                <div className="card">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-2">Supporting documents</div>
                  <div className="space-y-1.5">
                    {data.documents.map((d) => (
                      <button key={d.id} onClick={() => openDoc(d.id)}
                        className="block text-sm text-[#2f5a7a] font-semibold hover:underline">
                        📎 {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="card">
                <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-2">Approval trail</div>
                <ol className="space-y-3">
                  {data.trail.map((h) => (
                    <li key={h.id} className="pl-3 border-l-2 border-line">
                      <div className={`text-sm font-bold ${h.action === "Approved" ? "text-green-d" : h.action === "Rejected" ? "text-brick" : h.action === "Returned" ? "text-[#2f5a7a]" : "text-ink"}`}>{h.action}</div>
                      <div className="text-xs text-ink-soft">{ROLE_LABEL[h.actor_role]} · {fmtDate(h.created_at)}</div>
                      {h.note && <div className="text-xs italic text-ink mt-0.5">"{h.note}"</div>}
                    </li>
                  ))}
                </ol>
              </div>

              {canAct ? (
                <div className="card space-y-3">
                  {user.role === "mp" && (
                    <div>
                      <div className="label mb-1">Award amount (KES)</div>
                      <input className="field" type="number" value={award} onChange={(e) => setAward(e.target.value)} />
                      <div className="text-xs text-ink-soft mt-1">Requested: {money(app.amount_requested)}. Adjust the final award if needed.</div>
                    </div>
                  )}
                  <div>
                    <div className="label mb-1">Comment (optional)</div>
                    <textarea className="field" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the record or next office." />
                  </div>
                  <div className="flex gap-2 justify-end flex-wrap">
                    <button className="btn-reject" onClick={() => act("reject")} disabled={busy}>Reject</button>
                    <button className="btn-return" onClick={() => act("return")} disabled={busy}>Return</button>
                    <button className="btn-primary" onClick={() => act("approve")} disabled={busy}>
                      {user.role === "mp" ? "Approve & award" : "Approve & forward"}
                    </button>
                  </div>
                </div>
              ) : app.flagged ? null : (
                <div className="card text-sm text-ink-soft">
                  This application is at the <strong className="text-ink">{STAGE_LABEL[app.stage]}</strong> stage — not yours to action.
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Reports({ summary }) {
  const token = getToken();
  async function download(kind) {
    const res = await fetch(api.reportUrl(kind), { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bursary-report.${kind === "csv" ? "csv" : "pdf"}`;
    a.click(); URL.revokeObjectURL(url);
  }
  return (
    <div className="space-y-5">
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[["Total", summary.total], ["In review", summary.in_review], ["Approved", summary.approved],
            ["Total awarded", money(summary.total_awarded)]].map(([l, v]) => (
            <div key={l} className="card py-4">
              <div className="text-2xl font-extrabold text-green-d leading-none">{v}</div>
              <div className="text-xs text-ink-soft font-semibold mt-1">{l}</div>
            </div>
          ))}
        </div>
      )}
      {summary?.by_ward && (
        <div className="card">
          <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-3">Applications by ward</div>
          <div className="space-y-2">
            {Object.entries(summary.by_ward).sort((a, b) => b[1] - a[1]).map(([ward, n]) => (
              <div key={ward} className="flex items-center gap-3">
                <div className="w-28 text-sm text-ink">{ward}</div>
                <div className="flex-1 h-2.5 rounded-full bg-sand-2 overflow-hidden">
                  <div className="h-full bg-green transition-all duration-700 ease-out" style={{ width: `${(n / summary.total) * 100}%` }} />
                </div>
                <div className="w-8 text-right text-sm font-bold text-green-d">{n}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="card flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[180px]">
          <div className="font-bold text-ink">Export the register</div>
          <div className="text-sm text-ink-soft">Download all applications for records or committee meetings.</div>
        </div>
        <button className="btn-ghost" onClick={() => download("csv")}>Download CSV</button>
        <button className="btn-primary" onClick={() => download("pdf")}>Download PDF</button>
      </div>
    </div>
  );
}

function Bar({ label, n, total, color = "bg-green" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 sm:w-40 text-sm text-ink truncate flex-shrink-0">{label}</div>
      <div className="flex-1 h-2.5 rounded-full bg-sand-2 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-700 ease-out`} style={{ width: `${total ? (n / total) * 100 : 0}%` }} />
      </div>
      <div className="w-8 text-right text-sm font-bold text-green-d flex-shrink-0">{n}</div>
    </div>
  );
}

function Analytics({ data, loading }) {
  if (loading && !data) return <div className="card text-ink-soft">Loading…</div>;
  if (!data) return null;

  const wardEntries = Object.entries(data.by_ward).sort((a, b) => b[1] - a[1]);
  const catEntries = Object.entries(data.by_category).sort((a, b) => b[1] - a[1]);
  const demo = data.demographics;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Total applications", data.total], ["University (Bachelor's)", data.university_total],
          ["Flagged", data.flagged_count], ["Wards represented", wardEntries.length]].map(([l, v]) => (
          <div key={l} className="card py-4">
            <div className="text-2xl font-extrabold text-green-d leading-none">{v}</div>
            <div className="text-xs text-ink-soft font-semibold mt-1">{l}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-3">Applications by ward</div>
        <div className="space-y-2">
          {wardEntries.map(([ward, n]) => <Bar key={ward} label={ward} n={n} total={data.total} />)}
        </div>
      </div>

      <div className="card">
        <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-3">Applications by education category</div>
        <div className="space-y-2">
          {catEntries.map(([cat, n]) => <Bar key={cat} label={cat} n={n} total={data.total} color="bg-gold" />)}
        </div>
      </div>

      <div className="card">
        <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-3">Students by gender &amp; level</div>
        <div className="grid grid-cols-2 gap-3">
          {[["Boys (school-age)", demo.boys], ["Girls (school-age)", demo.girls],
            ["Men (tertiary)", demo.men], ["Ladies (tertiary)", demo.ladies]].map(([l, v]) => (
            <div key={l} className="bg-sand-2 rounded-lg px-3 py-2.5">
              <div className="text-xl font-extrabold text-green-d">{v}</div>
              <div className="text-xs text-ink-soft font-semibold">{l}</div>
            </div>
          ))}
        </div>
        {demo.unspecified > 0 && (
          <div className="text-xs text-ink-soft mt-2">{demo.unspecified} application(s) didn't record gender.</div>
        )}
      </div>

      {data.top_institutions.length > 0 && (
        <div className="card">
          <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-3">
            University applicants by institution
          </div>
          <div className="space-y-2">
            {data.top_institutions.map((inst) => (
              <Bar key={inst.name} label={inst.name} n={inst.count} total={data.university_total} color="bg-[#2f5a7a]" />
            ))}
          </div>
        </div>
      )}

      {data.top_courses?.length > 0 && (
        <div className="card">
          <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-1">
            Applicants by course / programme
          </div>
          <p className="text-xs text-ink-soft mb-3">Diploma, Certificate and Bachelor's applicants only — High School students are grouped simply as High School above, since they don't have a specific course.</p>
          <div className="space-y-2">
            {data.top_courses.map((c) => (
              <Bar key={c.name} label={c.name} n={c.count} total={data.top_courses.reduce((s, x) => s + x.count, 0)} color="bg-[#7a4f9e]" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Committee meeting view: every application's full details laid out inline,
// no clicking into each one — built for a group looking at one screen together.
function CommitteeView({ apps, loading, catFilter, setCatFilter }) {
  const [docsById, setDocsById] = useState({});

  useEffect(() => {
    apps.forEach((a) => {
      if (docsById[a.id] !== undefined) return;
      api.getApp(a.id).then((d) => setDocsById((prev) => ({ ...prev, [a.id]: d.documents }))).catch(() => {});
    });
  }, [apps]);

  async function openDoc(docId) {
    try { const { url } = await api.docLink(docId); window.open(url, "_blank"); }
    catch { /* ignore */ }
  }

  if (loading) return <div className="card text-ink-soft">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="card !py-3.5">
        <div className="font-bold text-ink">Committee meeting view</div>
        <div className="text-sm text-ink-soft mt-0.5">
          Every application's full details, laid out for the committee to review together —
          no need to open each one individually.
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CAT_TABS.map((t) => {
          const count = t.key === "all" ? apps.length : apps.filter((a) => a.edu_category === t.key).length;
          return (
            <button key={t.key} onClick={() => setCatFilter(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border transition
                ${catFilter === t.key ? "bg-green text-white border-green" : "bg-paper border-line text-ink-soft hover:border-gold"}`}>
              {t.label}
              <span className={`text-[11px] rounded-full px-1.5 py-0.5 font-bold ${catFilter === t.key ? "bg-white/20" : "bg-sand-2"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {!apps.length ? (
        <div className="card text-ink-soft">Nothing to show for this filter.</div>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <div key={a.id} className="card space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-extrabold text-lg text-ink">{a.student_name}</div>
                    {a.flagged && <span className="tag bg-[#f6ddd6] text-brick">⚠ Flagged</span>}
                  </div>
                  <div className="text-xs text-ink-soft mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>{a.id}</span>
                    <span className="inline-flex items-center gap-1"><WardDot ward={a.ward} /> {a.ward}{a.sub_location ? ` · ${a.sub_location}` : ""}</span>
                    <span>· {a.gender === "male" ? "Male" : a.gender === "female" ? "Female" : "—"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="font-extrabold text-green-d">{money(a.status === "approved" ? a.award_amount : a.amount_requested)}</div>
                  <StatusTag status={a.status} />
                </div>
              </div>

              <Pipeline stage={a.stage} status={a.status} />

              <div className="grid sm:grid-cols-3 gap-x-4 gap-y-2 bg-sand-2 rounded-lg p-3">
                {[["Category", a.level], ["Course", a.course_name || "—"], ["Institution", a.institution],
                  ["Location", a.admin_location || "—"], ["Village", a.village || "—"], ["Student ID/Birth Cert.", a.student_id_no || "—"],
                  ["Guardian", a.guardian_name], ["Phone", a.phone], ["Guardian ID", a.id_number],
                  ["Applied", fmtDate(a.created_at)], ["Annual fees", a.annual_fees ? money(a.annual_fees) : "—"], ["Permanent address", a.permanent_address || "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft">{k}</div>
                    <div className="text-sm text-ink truncate">{v}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wide font-bold text-ink-soft mb-1">Reason</div>
                <p className="text-sm text-ink">{a.reason}</p>
              </div>

              {a.flagged && (
                <div className="text-sm text-brick bg-[#f6ddd6] rounded-lg px-3 py-2">⚠ {a.flag_reason}</div>
              )}

              <div className="flex flex-wrap gap-2">
                {(docsById[a.id] || []).map((d) => (
                  <button key={d.id} onClick={() => openDoc(d.id)}
                    className="text-xs font-semibold text-[#2f5a7a] bg-[#dde8f1] rounded-full px-3 py-1 hover:underline">
                    📎 {d.label}
                  </button>
                ))}
                {docsById[a.id]?.length === 0 && <span className="text-xs text-ink-soft italic">No documents attached</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
