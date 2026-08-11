import { Router } from "express";
import bcrypt from "bcryptjs";
import { supa } from "../lib/supabase.js";
import { sign, requireAuth } from "../middleware/auth.js";

const r = Router();
const VALID_ROLES = ["applicant", "cdf_manager", "clerk", "chairman", "mp"];

r.post("/register", async (req, res) => {
  const { full_name, email, phone, password, role, ward } = req.body || {};
  if (!full_name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required." });

  const wantRole = VALID_ROLES.includes(role) ? role : "applicant";
  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supa
    .from("users")
    .insert({ full_name, email: email.toLowerCase(), phone, password_hash: hash, role: wantRole, ward })
    .select("id, full_name, email, role, phone, ward")
    .single();

  if (error) {
    if (error.code === "23505")
      return res.status(409).json({ error: "That email is already registered." });
    return res.status(500).json({ error: "Could not create the account." });
  }
  res.json({ token: sign(data), user: data });
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Enter your email and password." });

  const { data: user } = await supa
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: "Email or password is incorrect." });

  const safe = {
    id: user.id, full_name: user.full_name, email: user.email,
    role: user.role, phone: user.phone, ward: user.ward,
  };
  res.json({ token: sign(safe), user: safe });
});

r.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

export default r;
