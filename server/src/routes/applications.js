import { Router } from "express";
import { supa, ROLE_STAGE, NEXT_STAGE } from "../lib/supabase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notify } from "../lib/notify.js";

const r = Router();

const genId = () =>
  "WSB-" + Date.now().toString(36).toUpperCase().slice(-6) +
  Math.floor(Math.random() * 90 + 10);

const STAGE_LABEL = {
  submitted: "Submitted", chief: "Area Chief", manager: "CDF Manager", clerk: "Clerk",
  chairman: "Chairman", mp: "MP", approved: "Approved",
};

// ---- Submit a new application (applicant) ----
r.post("/", requireAuth, async (req, res) => {
  const { data: settings } = await supa.from("settings").select("application_deadline").eq("id", 1).single();
  if (settings?.application_deadline && new Date() > new Date(settings.application_deadline)) {
    return res.status(403).json({
      error: `Applications closed on ${new Date(settings.application_deadline).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" })}. Contact the constituency office if you believe this is an error.`,
    });
  }

  const b = req.body || {};
  const required = ["student_name", "institution", "level", "ward", "guardian_name", "phone", "id_number",
    "amount_requested", "reason", "student_id_no", "permanent_address", "admin_location", "village"];
  for (const f of required)
    if (!b[f] && b[f] !== 0) return res.status(400).json({ error: `Missing field: ${f}` });

  // Fraud signal: same guardian ID number previously used with a DIFFERENT ward.
  // A resident's ID shouldn't reasonably move between wards across applications —
  // this catches ward-shopping without needing an external government ID database.
  const { data: priorSameId } = await supa
    .from("applications")
    .select("ward")
    .eq("id_number", b.id_number)
    .neq("ward", b.ward)
    .limit(1);
  const flagged = !!(priorSameId && priorSameId.length);
  const flag_reason = flagged
    ? `Guardian ID ${b.id_number} was previously used on an application from ${priorSameId[0].ward} ward — this one claims ${b.ward}.`
    : null;

  const id = genId();
  const { data, error } = await supa
    .from("applications")
    .insert({
      id,
      applicant_id: req.user.id,
      student_name: b.student_name,
      student_id_no: b.student_id_no,
      admission_no: b.admission_no || null,
      institution: b.institution,
      level: b.level,
      edu_category: b.edu_category || null,
      course_name: b.course_name || null,
      gender: b.gender || null,
      ward: b.ward,
      sub_county: b.sub_county || "Wajir South",
      admin_location: b.admin_location,
      sub_location: b.sub_location || null,
      village: b.village,
      permanent_address: b.permanent_address,
      guardian_name: b.guardian_name,
      phone: b.phone,
      id_number: b.id_number,
      amount_requested: b.amount_requested,
      annual_fees: b.annual_fees || 0,
      reason: b.reason,
      stage: "submitted",
      status: "in_review",
      flagged,
      flag_reason,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: "Could not submit the application.", debug: error.message });

  await supa.from("approvals").insert({
    app_id: id, stage: "submitted", actor_id: req.user.id,
    actor_role: req.user.role, action: "Submitted", note: "",
  });

  // advance immediately into the area chief's queue
  await supa.from("applications").update({ stage: "chief" }).eq("id", id);

  res.json({ application: { ...data, stage: "chief" } });
});

// ---- List applications (role-aware) ----
// applicant: own applications. reviewers: their current-stage queue.
// A chief with an assigned sub-location only sees applicants from that
// sub-location; a chief with none assigned sees the general pool.
// ?scope=all (reviewers) returns everything they can see for reporting.
r.get("/", requireAuth, async (req, res) => {
  const { role, id, sub_location } = req.user;
  let q = supa.from("applications").select("*").order("created_at", { ascending: false });

  if (role === "applicant") {
    q = q.eq("applicant_id", id);
  } else if (req.query.scope !== "all") {
    const stage = ROLE_STAGE[role];
    q = q.eq("stage", stage).eq("status", "in_review");
    if (role === "chief" && sub_location) q = q.eq("sub_location", sub_location);
  }

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: "Could not load applications." });
  res.json({ applications: data });
});

// ---- Single application with trail + documents ----
r.get("/:id", requireAuth, async (req, res) => {
  const { data: app, error } = await supa
    .from("applications").select("*").eq("id", req.params.id).single();
  if (error || !app) return res.status(404).json({ error: "Application not found." });

  if (req.user.role === "applicant" && app.applicant_id !== req.user.id)
    return res.status(403).json({ error: "You can only view your own applications." });

  const { data: trail } = await supa
    .from("approvals").select("*").eq("app_id", app.id).order("created_at", { ascending: true });
  const { data: docs } = await supa
    .from("documents").select("*").eq("app_id", app.id).order("uploaded_at", { ascending: true });

  res.json({ application: app, trail: trail || [], documents: docs || [] });
});

// ---- Decision: approve / return / reject ----
r.post("/:id/decision", requireAuth, requireRole("chief", "cdf_manager", "clerk", "chairman", "mp"),
  async (req, res) => {
    const { action, note, award_amount } = req.body || {};
    if (!["approve", "return", "reject"].includes(action))
      return res.status(400).json({ error: "Invalid action." });

    const { data: app } = await supa
      .from("applications").select("*").eq("id", req.params.id).single();
    if (!app) return res.status(404).json({ error: "Application not found." });

    const myStage = ROLE_STAGE[req.user.role];
    if (app.stage !== myStage || app.status !== "in_review")
      return res.status(409).json({ error: "This application is not at your stage." });
    if (req.user.role === "chief" && req.user.sub_location && app.sub_location !== req.user.sub_location)
      return res.status(403).json({ error: "This application is outside your assigned sub-location." });

    let update = {};
    let actionLabel = "Approved";

    if (action === "reject") {
      update = { status: "rejected" };
      actionLabel = "Rejected";
    } else if (action === "return") {
      update = { status: "returned" };
      actionLabel = "Returned";
    } else {
      const next = NEXT_STAGE[app.stage];
      const isFinal = next === "approved";
      update = { stage: next, status: isFinal ? "approved" : "in_review" };
      if (isFinal) {
        // MP sets the final award amount (falls back to requested)
        update.award_amount = award_amount != null ? award_amount : app.amount_requested;
      }
    }

    await supa.from("applications").update(update).eq("id", app.id);
    await supa.from("approvals").insert({
      app_id: app.id, stage: app.stage, actor_id: req.user.id,
      actor_role: req.user.role, action: actionLabel, note: note || "",
    });

    // notify the applicant
    const { data: applicant } = await supa
      .from("users").select("email, phone").eq("id", app.applicant_id).single();
    const stageName = STAGE_LABEL[req.user.role === "mp" ? "mp" : myStage];
    let msg;
    if (actionLabel === "Approved" && update.status === "approved")
      msg = `Good news. Bursary ${app.id} for ${app.student_name} has been APPROVED and awarded ${Number(update.award_amount).toLocaleString()} KES.`;
    else if (actionLabel === "Approved")
      msg = `Bursary ${app.id} for ${app.student_name} passed the ${stageName} stage and moved forward.`;
    else if (actionLabel === "Returned")
      msg = `Bursary ${app.id} was returned for correction at the ${stageName} stage. ${note ? "Note: " + note : ""}`;
    else
      msg = `Bursary ${app.id} was not successful at the ${stageName} stage. ${note ? "Note: " + note : ""}`;

    await notify({
      appId: app.id,
      email: applicant?.email,
      phone: applicant?.phone || app.phone,
      subject: `Wajir South Bursary — ${app.id}`,
      body: msg,
    });

    res.json({ ok: true });
  });

// ---- Acknowledge a red-flagged application (any reviewer) so it can proceed ----
r.post("/:id/acknowledge-flag", requireAuth, requireRole("chief", "cdf_manager", "clerk", "chairman", "mp"),
  async (req, res) => {
    const { data: app } = await supa
      .from("applications").select("id, flagged, flag_reason").eq("id", req.params.id).single();
    if (!app) return res.status(404).json({ error: "Application not found." });
    if (!app.flagged) return res.json({ ok: true });

    await supa.from("applications").update({ flagged: false }).eq("id", app.id);
    await supa.from("approvals").insert({
      app_id: app.id, stage: ROLE_STAGE[req.user.role], actor_id: req.user.id,
      actor_role: req.user.role, action: "Flag acknowledged",
      note: app.flag_reason || "",
    });
    res.json({ ok: true });
  });

// ---- MP bulk award: give every application currently at the MP stage within
// one education category the same award amount, approving them all at once ----
r.post("/bulk-award", requireAuth, requireRole("mp"), async (req, res) => {
  const { edu_category, amount, note } = req.body || {};
  if (!edu_category) return res.status(400).json({ error: "Choose a category." });
  if (!(Number(amount) > 0)) return res.status(400).json({ error: "Enter a valid amount." });

  const { data: batch, error } = await supa
    .from("applications")
    .select("id, applicant_id, student_name, phone, flagged")
    .eq("stage", "mp").eq("status", "in_review").eq("edu_category", edu_category);
  if (error) return res.status(500).json({ error: "Could not load applications." });

  const eligible = (batch || []).filter((a) => !a.flagged);
  const skipped = (batch || []).length - eligible.length;
  if (!eligible.length)
    return res.status(400).json({ error: skipped ? "All matching applications are flagged and need review first." : "No applications are waiting at your stage in this category." });

  for (const app of eligible) {
    await supa.from("applications")
      .update({ stage: "approved", status: "approved", award_amount: amount })
      .eq("id", app.id);
    await supa.from("approvals").insert({
      app_id: app.id, stage: "mp", actor_id: req.user.id, actor_role: "mp",
      action: "Approved", note: note || `Bulk award — ${edu_category}`,
    });
    const { data: applicant } = await supa
      .from("users").select("email, phone").eq("id", app.applicant_id).single();
    await notify({
      appId: app.id,
      email: applicant?.email,
      phone: applicant?.phone || app.phone,
      subject: `Wajir South Bursary — ${app.id}`,
      body: `Good news. Bursary ${app.id} for ${app.student_name} has been APPROVED and awarded ${Number(amount).toLocaleString()} KES.`,
    });
  }

  res.json({ ok: true, awarded: eligible.length, skipped });
});

export default r;
