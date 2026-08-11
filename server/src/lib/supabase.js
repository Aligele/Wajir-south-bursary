import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.warn(
    "[warn] SUPABASE_URL or SUPABASE_SERVICE_KEY missing. Set them in server/.env"
  );
}

// Service-role client — bypasses RLS. Server-side only.
export const supa = createClient(url, key, {
  auth: { persistSession: false },
  db: { schema: "bursary" },
});

// separate client bound to the storage API (default schema)
export const supaStorage = createClient(url, key, {
  auth: { persistSession: false },
});

export const DOCS_BUCKET = process.env.SUPABASE_DOCS_BUCKET || "bursary-docs";

// ---- Workflow definition ----
export const ROLE_STAGE = {
  cdf_manager: "manager",
  clerk: "clerk",
  chairman: "chairman",
  mp: "mp",
};

export const NEXT_STAGE = {
  submitted: "manager",
  manager: "clerk",
  clerk: "chairman",
  chairman: "mp",
  mp: "approved",
};
