import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supa } from "../lib/supabase.js";
import { sign, requireAuth } from "../middleware/auth.js";
import { notify } from "../lib/notify.js";

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

// ---- Forgot password: request a reset link ----
// Always responds with the same generic message, whether or not the email
// exists, so this endpoint can't be used to check which emails are registered.
r.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  const generic = { message: "If that email is registered, a reset link has been sent." };
  if (!email) return res.json(generic);

  const { data: user } = await supa
    .from("users").select("id, full_name, email, phone").eq("email", email.toLowerCase()).single();
  if (!user) return res.json(generic);

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  await supa.from("users").update({ reset_token: token, reset_token_expires: expires }).eq("id", user.id);

  const resetUrl = `${process.env.CLIENT_ORIGIN || ""}/?reset=${token}`;
  await notify({
    email: user.email,
    phone: user.phone,
    subject: "Reset your Wajir South Bursary password",
    body: `Hi ${user.full_name}, reset your password using this link (valid for 1 hour): ${resetUrl}`,
  });

  res.json(generic);
});

// ---- Reset password: complete with a valid token ----
r.post("/reset-password", async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: "Missing token or new password." });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

  const { data: user } = await supa
    .from("users").select("id, reset_token_expires").eq("reset_token", token).single();
  if (!user || !user.reset_token_expires || new Date(user.reset_token_expires) < new Date())
    return res.status(400).json({ error: "This reset link is invalid or has expired. Request a new one." });

  const hash = await bcrypt.hash(password, 10);
  await supa.from("users")
    .update({ password_hash: hash, reset_token: null, reset_token_expires: null })
    .eq("id", user.id);

  res.json({ ok: true });
});

export default r;
