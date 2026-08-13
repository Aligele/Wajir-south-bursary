import { Router } from "express";
import bcrypt from "bcryptjs";
import { supa } from "../lib/supabase.js";
import { sign, requireAuth } from "../middleware/auth.js";

const r = Router();
r.post("/register", async (req, res) => {
  const { full_name, email, phone, password } = req.body || {};
  if (!full_name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required." });

  // Public self-registration is applicant-only. Staff accounts (Area Chief,
  // CDF Manager, Clerk, Chairman, MP, Admin) must be created by an admin
  // via the Admin panel — never through this open endpoint.
  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supa
    .from("users")
    .insert({ full_name, email: email.toLowerCase(), phone, password_hash: hash, role: "applicant" })
    .select("id, full_name, email, role, phone, ward")
    .single();

  if (error) {
    console.error("Register error:", error);
    if (error.code === "23505")
      return res.status(409).json({ error: "That email is already registered." });
    return res.status(500).json({ error: "Could not create the account.", debug: error.message || String(error) });
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
    role: user.role, phone: user.phone, ward: user.ward, sub_location: user.sub_location,
  };
  res.json({ token: sign(safe), user: safe });
});

r.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

export default r;
