import React, { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import { Pipeline, StatusTag, money } from "../components/UI.jsx";

const CATEGORY_ICONS = {
  high_school:         "🏫",
  diploma_certificate: "📜",
  bachelor:            "🎓",
};

function Field({ k, label, type = "text", ph, f, errors, set }) {
  return (
    <div>
      <div className="label mb-1">{label}</div>
      <input className="field" type={type} value={f[k]}
        onChange={(e) => set(k, e.target.value)} placeholder={ph} />
      {errors[k] && <div className="text-xs text-brick mt-1">{errors[k]}</div>}
    </div>
  );
}

export default function Applicant({ toast }) {
  const [tab, setTab] = useState("apply");
  const [wards, setWards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.wards().then((d) => setWards(d.wards)).catch(() => {});
    api.categories().then((d) => setCategories(d.categories)).catch(() => {});
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try { const d = await api.listApps(); setApps(d.applications); } catch {}
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="inline-flex gap-1 bg-sand-2 border border-line rounded-xl p-1">
        <button onClick={() => setTab("apply")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "apply" ? "bg-paper text-green shadow-sm" : "text-ink-soft"}`}>
          New application
        </button>
        <button onClick={() => { setTab("track"); refresh(); }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === "track" ? "bg-paper text-green shadow-sm" : "text-ink-soft"}`}>
          Track {apps.length ? `(${apps.length})` : ""}
        </button>
      </div>

      {tab === "apply"
        ? <CategoryPicker categories={categories} wards={wards}
            onDone={() => { toast("Application submitted successfully."); setTab("track"); refresh(); }} />
        : <TrackList apps={apps} loading={loading} onChange={refresh} toast={toast} />}
    </div>
  );
}

/* ── Step 1: pick a category ── */
function CategoryPicker({ categories, wards, onDone }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const cat = categories.find((c) => c.slug === selected);
    return <ApplyForm category={cat} wards={wards} onDone={onDone}
      onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-xl font-extrabold text-green-d">Apply for a bursary</h2>
        <p className="text-sm text-ink-soft mt-1">
          Select your education level to begin. Each category has its own courses and requirements.
        </p>
      </div>

      <div className="grid gap-4">
        {categories.map((cat) => (
          <button key={cat.slug} onClick={() => setSelected(cat.slug)}
            className="card text-left flex items-start gap-5 hover:border-gold hover:shadow-md transition group active:translate-y-px">
            <span className="text-4xl mt-0.5 select-none">{CATEGORY_ICONS[cat.slug]}</span>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-lg text-green-d group-hover:text-gold-d transition">
                {cat.label}
              </div>
              <div className="text-sm text-ink-soft mt-0.5">{cat.description}</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cat.courses.slice(0, 5).map((c) => (
                  <span key={c.id} className="text-[11px] font-semibold bg-sand-2 border border-line rounded-full px-2.5 py-0.5 text-ink-soft">
                    {c.name}
                  </span>
                ))}
                {cat.courses.length > 5 && (
                  <span className="text-[11px] font-semibold bg-green/10 text-green-d border border-green/20 rounded-full px-2.5 py-0.5">
                    +{cat.courses.length - 5} more
                  </span>
                )}
              </div>
            </div>
            <span className="text-gold-d text-xl self-center">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step 2: fill the application form ── */
function ApplyForm({ category, wards, onDone, onBack }) {
  const blank = {
    student_name: "", gender: "", admission_no: "", institution: "",
    course_name: category.courses[0]?.name || "",
    ward: wards[0] || "", sub_location: "", guardian_name: "", phone: "",
    id_number: "", amount_requested: "", annual_fees: "", reason: "",
  };
  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState([]);
  const [declared, setDeclared] = useState(false);
  const [subLocs, setSubLocs] = useState([]);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (wards.length && !f.ward) set("ward", wards[0]);
  }, [wards]);

  useEffect(() => {
    if (!f.ward) return;
    api.subLocations(f.ward).then((d) => {
      setSubLocs(d.subLocations);
      // reset the pick if it no longer belongs to the newly selected ward
      set("sub_location", "");
    }).catch(() => setSubLocs([]));
  }, [f.ward]);

  function addFiles(e) {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  }
  function removeFile(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function validate() {
    const e = {};
    if (!f.student_name.trim()) e.student_name = "Required";
    if (!f.gender) e.gender = "Select gender";
    if (!f.institution.trim()) e.institution = "Required";
    if (!f.course_name) e.course_name = "Select a course";
    if (!f.guardian_name.trim()) e.guardian_name = "Required";
    if (!/^0\d{9}$/.test(f.phone)) e.phone = "e.g. 0712345678";
    if (!/^\d{6,9}$/.test(f.id_number)) e.id_number = "Valid ID number";
    if (!(Number(f.amount_requested) > 0)) e.amount_requested = "Enter amount";
    if (!f.reason.trim()) e.reason = "Required";
    if (!declared) e.declared = "You must confirm residency to submit";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function submit() {
    if (!validate()) return;
    setBusy(true);
    try {
      const { application } = await api.submitApp({
        ...f,
        level: category.label,
        edu_category: category.slug,
        amount_requested: Number(f.amount_requested),
        annual_fees: Number(f.annual_fees) || 0,
      });
      // upload any attached documents against the newly created application
      for (const file of files) {
        try { await api.uploadDoc(application.id, file, file.name); }
        catch { /* one failed upload shouldn't block the rest */ }
      }
      onDone();
    } catch (e) { alert(e.message); }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      {/* category breadcrumb */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-gold-d font-bold hover:underline">← Back</button>
        <div className="flex items-center gap-2 bg-green/10 border border-green/20 rounded-lg px-3 py-1.5">
          <span>{CATEGORY_ICONS[category.slug]}</span>
          <span className="text-sm font-bold text-green-d">{category.label}</span>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-extrabold text-green-d">
          {CATEGORY_ICONS[category.slug]} {category.label} — Bursary Application
        </h2>

        {/* Course selector — prominent, matches the category */}
        <div className="bg-sand-2 border border-line rounded-xl p-4">
          <div className="label mb-2">
            {category.slug === "high_school" ? "Subject stream / type" : "Course / programme"}
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {category.courses.map((c) => (
              <label key={c.id}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition text-sm
                  ${f.course_name === c.name
                    ? "border-green bg-green text-white font-semibold"
                    : "border-line bg-paper text-ink hover:border-gold"}`}>
                <input type="radio" className="hidden" value={c.name}
                  checked={f.course_name === c.name}
                  onChange={() => set("course_name", c.name)} />
                <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${f.course_name === c.name ? "border-white bg-white" : "border-line"}`} />
                {c.name}
              </label>
            ))}
          </div>
          {errors.course_name && <div className="text-xs text-brick mt-1">{errors.course_name}</div>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field k="student_name" f={f} errors={errors} set={set} label="Student full name" ph="e.g. Amina Hassan Abdi" />
          <div>
            <div className="label mb-1">Gender</div>
            <select className="field" value={f.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <div className="text-xs text-brick mt-1">{errors.gender}</div>}
          </div>
          <Field k="admission_no" f={f} errors={errors} set={set} label="Admission / registration no." ph="Optional" />
          <div className="sm:col-span-2">
            <Field k="institution" f={f} errors={errors} set={set} label="Institution name" ph="School / College / University" />
          </div>
          <div>
            <div className="label mb-1">Ward</div>
            <select className="field" value={f.ward} onChange={(e) => set("ward", e.target.value)}>
              {wards.map((w) => <option key={w}>{w}</option>)}
            </select>
            <div className="text-[11px] text-ink-soft mt-1">
              Bursaries are only for residents of Wajir South's seven wards. A parent/guardian may
              register and submit on behalf of a student relative — that's expected.
            </div>
          </div>
          <div>
            <div className="label mb-1">Sub-location</div>
            {subLocs.length > 0 ? (
              <select className="field" value={f.sub_location} onChange={(e) => set("sub_location", e.target.value)}>
                <option value="">Select…</option>
                {subLocs.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            ) : (
              <input className="field" value={f.sub_location} onChange={(e) => set("sub_location", e.target.value)}
                placeholder="Type your sub-location" />
            )}
            <div className="text-[11px] text-ink-soft mt-1">Used to route your application to the Area Chief covering your sub-location.</div>
          </div>
          <Field k="guardian_name" f={f} errors={errors} set={set} label="Parent / guardian name" ph="Full name" />
          <Field k="phone" f={f} errors={errors} set={set} label="Phone number" ph="07XXXXXXXX" />
          <Field k="id_number" f={f} errors={errors} set={set} label="Guardian national ID" ph="e.g. 12345678" />
          <Field k="amount_requested" f={f} errors={errors} set={set} label="Amount requested (KES)" type="number" ph="e.g. 20000" />
          <Field k="annual_fees" f={f} errors={errors} set={set} label="Total annual fees (KES)" type="number" ph="Optional" />
        </div>

        <div>
          <div className="label mb-1">Reason for request</div>
          <textarea className="field" rows={3} value={f.reason}
            onChange={(e) => set("reason", e.target.value)}
            placeholder="Briefly explain the need (e.g. orphaned, low household income, fee arrears)." />
          {errors.reason && <div className="text-xs text-brick mt-1">{errors.reason}</div>}
        </div>

        <div className="bg-sand-2 border border-line rounded-xl p-4">
          <div className="label mb-1">Supporting documents</div>
          <p className="text-xs text-ink-soft mb-3">
            Attach a fee structure, guardian ID copy, or result slip. You can also add these later
            from the Track tab.
          </p>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gold-d cursor-pointer">
            <input type="file" multiple className="hidden" onChange={addFiles} />
            <span className="border border-line rounded-lg px-3 py-2 bg-paper hover:border-gold">
              + Choose files
            </span>
          </label>
          {files.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {files.map((file, i) => (
                <li key={i} className="flex items-center justify-between text-sm bg-paper border border-line rounded-lg px-3 py-1.5">
                  <span className="truncate">📎 {file.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-brick font-bold text-xs ml-2 flex-shrink-0">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" className="mt-1" checked={declared} onChange={(e) => setDeclared(e.target.checked)} />
          <span className="text-sm text-ink">
            I confirm the student named above is a resident of <strong>{f.ward}</strong> ward,
            within Wajir South Constituency.
          </span>
        </label>
        {errors.declared && <div className="text-xs text-brick -mt-2">{errors.declared}</div>}

        <div className="flex justify-between items-center pt-1">
          <button onClick={onBack} className="btn-ghost">← Change category</button>
          <button className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? "Submitting…" : "Submit application"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Track list ── */
function TrackList({ apps, loading, onChange, toast }) {
  if (loading) return <div className="card text-ink-soft">Loading…</div>;
  if (!apps.length) return (
    <div className="card">
      <div className="font-bold text-ink">No applications yet.</div>
      <div className="text-sm text-ink-soft mt-1">Submit your first from the New application tab.</div>
    </div>
  );

  // group by category
  const groups = {
    high_school: { label: "High School 🏫", apps: [] },
    diploma_certificate: { label: "Diploma & Certificate 📜", apps: [] },
    bachelor: { label: "Bachelor's Degree 🎓", apps: [] },
    other: { label: "Other", apps: [] },
  };
  apps.forEach((a) => {
    const key = a.edu_category || "other";
    (groups[key] || groups.other).apps.push(a);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groups).filter(([, g]) => g.apps.length > 0).map(([key, g]) => (
        <div key={key}>
          <div className="text-sm font-bold text-green-d mb-2 uppercase tracking-wide">{g.label}</div>
          <div className="space-y-3">
            {g.apps.map((a) => <TrackCard key={a.id} app={a} onChange={onChange} toast={toast} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrackCard({ app, onChange, toast }) {
  const [uploading, setUploading] = useState(false);
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { await api.uploadDoc(app.id, file, file.name); toast("Document attached."); onChange(); }
    catch (err) { alert(err.message); }
    setUploading(false);
    e.target.value = "";
  }
  return (
    <div className="card space-y-3.5">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-bold text-ink">{app.student_name}</div>
          <div className="text-xs text-ink-soft mt-0.5">
            {app.id} · {app.institution}
            {app.course_name && <> · <span className="text-green-d font-semibold">{app.course_name}</span></>}
            {" "}· {app.ward} ward
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="font-extrabold text-green-d text-sm">
            {money(app.status === "approved" ? app.award_amount : app.amount_requested)}
          </div>
          <StatusTag status={app.status} />
        </div>
      </div>
      <Pipeline stage={app.stage} status={app.status} />
      {(app.status === "in_review" || app.status === "returned") && (
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-gold-d cursor-pointer">
          <input type="file" className="hidden" onChange={upload} disabled={uploading} />
          <span className="border border-line rounded-lg px-3 py-1.5 bg-sand hover:border-gold">
            {uploading ? "Uploading…" : "+ Attach document (fee slip, ID copy)"}
          </span>
        </label>
      )}
    </div>
  );
}
