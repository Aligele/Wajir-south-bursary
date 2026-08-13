import { Router } from "express";
import PDFDocument from "pdfkit";
import { supa } from "../lib/supabase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const r = Router();

const STATUS_LABEL = {
  in_review: "In review", approved: "Approved & awarded",
  rejected: "Rejected", returned: "Returned",
};
const STAGE_LABEL = {
  submitted: "Submitted", manager: "CDF Manager", clerk: "Clerk",
  chairman: "Chairman", mp: "MP", approved: "Approved",
};

async function fetchAll(filters = {}) {
  let q = supa.from("applications").select("*").order("created_at", { ascending: false });
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.ward) q = q.eq("ward", filters.ward);
  const { data } = await q;
  return data || [];
}

// Summary KPIs for a dashboard
r.get("/summary", requireAuth, requireRole("cdf_manager", "clerk", "chairman", "mp"), async (_req, res) => {
  const rows = await fetchAll();
  const total = rows.length;
  const approved = rows.filter((a) => a.status === "approved");
  const totalAwarded = approved.reduce((s, a) => s + Number(a.award_amount || 0), 0);
  const byWard = {};
  for (const a of rows) byWard[a.ward] = (byWard[a.ward] || 0) + 1;
  res.json({
    total,
    in_review: rows.filter((a) => a.status === "in_review").length,
    approved: approved.length,
    rejected: rows.filter((a) => a.status === "rejected").length,
    total_awarded: totalAwarded,
    by_ward: byWard,
  });
});

// Detailed analytics: by ward, by category, by ward+category, by gender/age
// bracket, top institutions, and flagged count.
r.get("/analytics", requireAuth, requireRole("cdf_manager", "clerk", "chairman", "mp", "admin"), async (_req, res) => {
  const rows = await fetchAll();

  const byWard = {};
  const byCategory = {};
  const byWardCategory = {}; // "ward|category" -> count
  const byInstitution = {};
  const demo = { boys: 0, girls: 0, men: 0, ladies: 0, unspecified: 0 };
  let university = 0;
  let flagged = 0;

  const CAT_LABEL = { high_school: "High School", diploma_certificate: "Diploma & Certificate", bachelor: "Bachelor's Degree" };

  for (const a of rows) {
    byWard[a.ward] = (byWard[a.ward] || 0) + 1;

    const cat = CAT_LABEL[a.edu_category] || "Uncategorised";
    byCategory[cat] = (byCategory[cat] || 0) + 1;

    const wcKey = `${a.ward}|${cat}`;
    byWardCategory[wcKey] = (byWardCategory[wcKey] || 0) + 1;

    if (a.edu_category === "bachelor") {
      university++;
      const inst = (a.institution || "Unspecified").trim();
      byInstitution[inst] = (byInstitution[inst] || 0) + 1;
    }

    if (a.flagged) flagged++;

    const isAdult = a.edu_category === "diploma_certificate" || a.edu_category === "bachelor";
    if (a.gender === "male") demo[isAdult ? "men" : "boys"]++;
    else if (a.gender === "female") demo[isAdult ? "ladies" : "girls"]++;
    else demo.unspecified++;
  }

  const topInstitutions = Object.entries(byInstitution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({ name, count }));

  res.json({
    total: rows.length,
    by_ward: byWard,
    by_category: byCategory,
    by_ward_category: byWardCategory,
    demographics: demo,
    university_total: university,
    top_institutions: topInstitutions,
    flagged_count: flagged,
  });
});


r.get("/csv", requireAuth, requireRole("cdf_manager", "clerk", "chairman", "mp"), async (req, res) => {
  const rows = await fetchAll({ status: req.query.status, ward: req.query.ward });
  const headers = [
    "ID", "Student", "Institution", "Level", "Ward", "Guardian", "Phone",
    "ID Number", "Amount Requested", "Award Amount", "Stage", "Status", "Submitted",
  ];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const a of rows) {
    lines.push([
      a.id, a.student_name, a.institution, a.level, a.ward, a.guardian_name,
      a.phone, a.id_number, a.amount_requested, a.award_amount ?? "",
      STAGE_LABEL[a.stage], STATUS_LABEL[a.status],
      new Date(a.created_at).toISOString().slice(0, 10),
    ].map(esc).join(","));
  }
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="bursary-report.csv"');
  res.send(lines.join("\n"));
});

// PDF export
r.get("/pdf", requireAuth, requireRole("cdf_manager", "clerk", "chairman", "mp"), async (req, res) => {
  const rows = await fetchAll({ status: req.query.status, ward: req.query.ward });
  const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="bursary-report.pdf"');
  doc.pipe(res);

  doc.fillColor("#1f5c3d").fontSize(18).text("Wajir South Constituency", { continued: false });
  doc.fillColor("#a06f14").fontSize(12).text("NG-CDF Bursary — Applications Report");
  doc.moveDown(0.3);
  doc.fillColor("#555").fontSize(9)
    .text(`Generated ${new Date().toLocaleString("en-KE")}  ·  ${rows.length} record(s)`);
  doc.moveDown(0.8);

  const cols = [
    ["ID", 70], ["Student", 110], ["Institution", 120], ["Ward", 70],
    ["Requested", 70], ["Award", 70], ["Stage", 70], ["Status", 90],
  ];
  let x = 40;
  const top = doc.y;
  doc.fontSize(9).fillColor("#fff");
  doc.rect(40, top - 2, 762, 16).fill("#1f5c3d");
  x = 44;
  doc.fillColor("#fff");
  for (const [label, w] of cols) { doc.text(label, x, top + 1, { width: w }); x += w; }
  doc.moveDown(1.2);

  let money = 0;
  rows.forEach((a, i) => {
    if (doc.y > 520) { doc.addPage({ layout: "landscape", size: "A4", margin: 40 }); }
    const y = doc.y;
    if (i % 2 === 0) doc.rect(40, y - 2, 762, 15).fill("#f3ead9");
    x = 44;
    doc.fillColor("#2a2016").fontSize(8.5);
    const vals = [
      a.id, a.student_name, a.institution, a.ward,
      Number(a.amount_requested).toLocaleString(),
      a.award_amount ? Number(a.award_amount).toLocaleString() : "-",
      STAGE_LABEL[a.stage], STATUS_LABEL[a.status],
    ];
    vals.forEach((v, ci) => { doc.text(String(v), x, y, { width: cols[ci][1], ellipsis: true }); x += cols[ci][1]; });
    doc.moveDown(0.9);
    if (a.status === "approved") money += Number(a.award_amount || 0);
  });

  doc.moveDown(1);
  doc.fillColor("#1f5c3d").fontSize(11)
    .text(`Total awarded (approved): KES ${money.toLocaleString()}`, 40);
  doc.end();
});

export default r;
