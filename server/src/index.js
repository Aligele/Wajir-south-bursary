import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import appRoutes from "./routes/applications.js";
import docRoutes from "./routes/documents.js";
import reportRoutes from "./routes/reports.js";
import categoryRoutes from "./routes/categories.js";
import adminRoutes from "./routes/admin.js";
import { supa } from "./lib/supabase.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "wajir-bursary" }));

app.get("/api/wards", async (_req, res) => {
  const { data } = await supa.from("wards").select("name").order("name");
  res.json({ wards: (data || []).map((w) => w.name) });
});

app.get("/api/sublocations", async (req, res) => {
  let q = supa.from("sub_locations").select("id, ward, name").order("ward").order("name");
  if (req.query.ward) q = q.eq("ward", req.query.ward);
  const { data } = await q;
  res.json({ subLocations: data || [] });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/applications", appRoutes);
app.use("/api/documents", docRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found." }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Bursary API running on :${port}`));
