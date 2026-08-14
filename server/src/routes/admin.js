import { Router } from "express";
import bcrypt from "bcryptjs";
import { supa } from "../lib/supabase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const r = Router();
const VALID_ROLES = ["applicant", "chief", "cdf_manager", "clerk", "chairman", "mp", "admin"];

// All routes here require admin
r.use(requireAuth, requireRole("admin"));

// GET /api/admin/users — list everyone
r.get("/users", async (_req, res) => {
  const { data, error } = await supa
    .from("users")
    .select("id, full_name, email, phone, role, ward, sub_location, created_at")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: "Could not load users." });
  res.json({ users: data });
});

// POST /api/admin/users — create a staff or applicant account
r.post("/users", async (req, res) => {
  const { full_name, email, phone, password, role, ward, sub_location } = req.body || {};
  if (!full_name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required." });
  if (!VALID_ROLES.includes(role))
    return res.status(400).json({ error: "Invalid role." });

  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supa
    .from("users")
    .insert({ full_name, email: email.toLowerCase(), phone, password_hash: hash, role, ward, sub_location: sub_location || null })
    .select("id, full_name, email, role, phone, ward, sub_location, created_at")
    .single();

  if (error) {
    if (error.code === "23505")
      return res.status(409).json({ error: "That email is already registered." });
    console.error("Admin create user error:", error);
    return res.status(500).json({ error: "Could not create the account.", debug: error.message });
  }
  res.json({ user: data });
});

// PATCH /api/admin/users/:id — update role, name, phone, ward, or reset password
r.patch("/users/:id", async (req, res) => {
  const { full_name, phone, role, ward, sub_location, password } = req.body || {};
  const update = {};
  if (full_name !== undefined) update.full_name = full_name;
  if (phone !== undefined) update.phone = phone;
  if (ward !== undefined) update.ward = ward;
  if (sub_location !== undefined) update.sub_location = sub_location || null;
  if (role !== undefined) {
    if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: "Invalid role." });
    update.role = role;
  }
  if (password) update.password_hash = await bcrypt.hash(password, 10);

  if (Object.keys(update).length === 0)
    return res.status(400).json({ error: "Nothing to update." });

  const { data, error } = await supa
    .from("users")
    .update(update)
    .eq("id", req.params.id)
    .select("id, full_name, email, role, phone, ward, sub_location")
    .single();

  if (error) return res.status(500).json({ error: "Could not update the account." });
  res.json({ user: data });
});

// DELETE /api/admin/users/:id — remove an account
r.delete("/users/:id", async (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: "You can't delete your own account." });
  const { error } = await supa.from("users").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: "Could not delete the account." });
  res.json({ ok: true });
});

// ---- Sub-locations: real chief-coverage areas within each ward ----
r.get("/sublocations", async (_req, res) => {
  const { data, error } = await supa
    .from("sub_locations").select("id, ward, name").order("ward").order("name");
  if (error) return res.status(500).json({ error: "Could not load sub-locations." });
  res.json({ subLocations: data });
});

r.post("/sublocations", async (req, res) => {
  const { ward, name } = req.body || {};
  if (!ward || !name?.trim())
    return res.status(400).json({ error: "Ward and sub-location name are required." });
  const { data, error } = await supa
    .from("sub_locations").insert({ ward, name: name.trim() }).select("*").single();
  if (error) {
    if (error.code === "23505") return res.status(409).json({ error: "That sub-location already exists for this ward." });
    return res.status(500).json({ error: "Could not add the sub-location." });
  }
  res.json({ subLocation: data });
});

r.delete("/sublocations/:id", async (req, res) => {
  const { error } = await supa.from("sub_locations").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: "Could not delete the sub-location." });
  res.json({ ok: true });
});

// ---- Constituency-wide settings: deadlines ----
r.get("/settings", async (_req, res) => {
  const { data } = await supa.from("settings").select("*").eq("id", 1).single();
  res.json({ settings: data || {} });
});

r.patch("/settings", async (req, res) => {
  const { application_deadline, approval_deadline } = req.body || {};
  const update = { updated_at: new Date().toISOString() };
  if (application_deadline !== undefined) update.application_deadline = application_deadline || null;
  if (approval_deadline !== undefined) update.approval_deadline = approval_deadline || null;

  const { data, error } = await supa
    .from("settings").update(update).eq("id", 1).select("*").single();
  if (error) return res.status(500).json({ error: "Could not update settings." });
  res.json({ settings: data });
});

export default r;
