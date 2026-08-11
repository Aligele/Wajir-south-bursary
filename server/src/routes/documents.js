import { Router } from "express";
import multer from "multer";
import { supa, supaStorage, DOCS_BUCKET } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

// Upload a supporting document to an application
r.post("/:appId", requireAuth, upload.single("file"), async (req, res) => {
  const { appId } = req.params;
  const label = req.body.label || "Document";
  if (!req.file) return res.status(400).json({ error: "Attach a file to upload." });

  const { data: app } = await supa
    .from("applications").select("id, applicant_id").eq("id", appId).single();
  if (!app) return res.status(404).json({ error: "Application not found." });
  if (req.user.role === "applicant" && app.applicant_id !== req.user.id)
    return res.status(403).json({ error: "You can only attach files to your own application." });

  const safeName = req.file.originalname.replace(/[^\w.\-]/g, "_");
  const path = `${appId}/${Date.now()}_${safeName}`;

  const { error: upErr } = await supaStorage.storage
    .from(DOCS_BUCKET)
    .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
  if (upErr) return res.status(500).json({ error: "Upload failed. Try again." });

  const { data, error } = await supa
    .from("documents")
    .insert({
      app_id: appId, label, file_path: path,
      mime_type: req.file.mimetype, size_bytes: req.file.size,
    })
    .select("*").single();
  if (error) return res.status(500).json({ error: "Could not record the document." });

  res.json({ document: data });
});

// Get a temporary signed URL to view/download a document
r.get("/:docId/link", requireAuth, async (req, res) => {
  const { data: doc } = await supa
    .from("documents").select("*").eq("id", req.params.docId).single();
  if (!doc) return res.status(404).json({ error: "Document not found." });

  const { data, error } = await supaStorage.storage
    .from(DOCS_BUCKET)
    .createSignedUrl(doc.file_path, 300); // 5 minutes
  if (error) return res.status(500).json({ error: "Could not generate the link." });
  res.json({ url: data.signedUrl });
});

export default r;
