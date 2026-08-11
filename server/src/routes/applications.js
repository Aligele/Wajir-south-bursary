import { Router } from "express";
import { supa, ROLE_STAGE, NEXT_STAGE } from "../lib/supabase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notify } from "../lib/notify.js";

const r = Router();

const genId = () =>
  "WSB-" + Date.now().toString(36).toUpperCase().slice(-6) +
  Math.floor(Math.random() * 90 + 10);

const STAGE_LABEL = {
  submitted: "Submitted", manager: "CDF Manager", clerk: "Clerk",
  chairman: "Chairman", mp: "MP", approved: "Approved",
};

// ---- Submit a new application (applicant) ----
r.post("/", requireAuth, async (req, res) => {
  const b = req.body || {};
  const required = ["student_name", "institution", "level", "ward", "guardian_name", "phone", "id_number", "amount_requested", "reason"];
  for (const f of required)
    if (!b[f] && b[f] !== 0) return res.status(400).json({ error: `Missing field: ${f}` });

  const id = genId();
  const { data, error } = await supa
    .from("applications")
    .insert({
      id,
      applicant_id: req.user.id,
      student_name: b.student_name,
      admission_no: b.admission_no || null,
      institution: b.institution,
      level: b.level,
      ward: b.ward,
      guardian_name: b.guardian_name,
      phone: b.phone,
      id_number: b.id_number,
      amount_requested: b.amount_requested,
      annual_fees: b.annual_fees || 0,
      reason: b.reason,
      stage: "submitted",
      status: "in_review",
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: "Could not submit the application." });

  await supa.from("approvals").insert({
    app_id: id, stage: "submitted", actor_id: req.user.id,
    actor_role: req.user.role, action: "Submitted", note: "",
  });

  // advance immediately into the manager queue
  await supa.from("applications").update({ stage: "manager" }).eq("id", id);

  res.json({ application: { ...data, stage: "manager" } });
});

// ---- List applications (role-aware) ----
// applicant: own applications. reviewers: their current-stage queue.
// ?scope=all (reviewers) returns everything they can see for reporting.
r.get("/", requireAuth, async (req, res) => {
  const { role, id } = req.user;
  let q = supa.from("applications").select("*").order("created_at", { ascending: false });

  if (role === "applicant") {
    q = q.eq("applicant_id", id);
  } else if (req.query.scope !== "all") {
    const stage = ROLE_STAGE[role];
    q = q.eq("stage", stage).eq("status", "in_review");
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
r.post("/:id/decision", requireAuth, requireRole("cdf_manager", "clerk", "chairman", "mp"),
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

export default r;
