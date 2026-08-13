import { Router } from "express";
import bcrypt from "bcryptjs";
import { supa } from "../lib/supabase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const r = Router();
const VALID_ROLES = ["applicant", "cdf_manager", "clerk", "chairman", "mp", "admin"];

// All routes here require admin
r.use(requireAuth, requireRole("admin"));

// GET /api/admin/users — list everyone
r.get("/users", async (_req, res) => {
  const { data, error } = await supa
    .from("users")
    .select("id, full_name, email, phone, role, ward, created_at")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: "Could not load users." });
  res.json({ users: data });
});

// POST /api/admin/users — create a staff or applicant account
r.post("/users", async (req, res) => {
  const { full_name, email, phone, password, role, ward } = req.body || {};
  if (!full_name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required." });
  if (!VALID_ROLES.includes(role))
    return res.status(400).json({ error: "Invalid role." });

  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supa
    .from("users")
    .insert({ full_name, email: email.toLowerCase(), phone, password_hash: hash, role, ward })
    .select("id, full_name, email, role, phone, ward, created_at")
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
  const { full_name, phone, role, ward, password } = req.body || {};
  const update = {};
  if (full_name !== undefined) update.full_name = full_name;
  if (phone !== undefined) update.phone = phone;
  if (ward !== undefined) update.ward = ward;
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
    .select("id, full_name, email, role, phone, ward")
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

export default r;
