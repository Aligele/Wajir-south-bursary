import { Router } from "express";
import { supa } from "../lib/supabase.js";

const r = Router();

// GET /api/categories — returns all categories with their courses nested
r.get("/", async (_req, res) => {
  const { data: cats, error } = await supa
    .from("education_categories")
    .select("id, slug, label, description, sort_order")
    .order("sort_order");
  if (error) return res.status(500).json({ error: "Could not load categories." });

  const { data: courses } = await supa
    .from("courses")
    .select("id, category_id, name, sort_order")
    .order("sort_order");

  const result = cats.map((cat) => ({
    ...cat,
    courses: (courses || []).filter((c) => c.category_id === cat.id),
  }));
  res.json({ categories: result });
});

export default r;
