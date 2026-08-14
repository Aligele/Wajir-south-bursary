import React from "react";

const STAGES = [
  { key: "submitted", label: "Submitted" },
  { key: "chief", label: "Area Chief" },
  { key: "manager", label: "CDF Manager" },
  { key: "clerk", label: "Clerk" },
  { key: "chairman", label: "Chairman" },
  { key: "mp", label: "MP" },
  { key: "approved", label: "Approved" },
];
const ORDER = STAGES.map((s) => s.key);

export function Pipeline({ stage, status }) {
  const rejected = status === "rejected";
  const returned = status === "returned";
  const idx = ORDER.indexOf(stage);
  return (
    <div className="relative flex justify-between gap-1">
      <div className="absolute top-[7px] left-[6%] right-[6%] h-0.5 bg-line" />
      <div
        className="absolute top-[7px] left-[6%] h-0.5 bg-green transition-all duration-500 ease-out"
        style={{ width: `${Math.max(0, (idx / (STAGES.length - 1)) * 88)}%` }}
      />
      {STAGES.map((s, i) => {
        let dot = "bg-sand-2 border-line";
        let text = "text-ink-soft";
        let extra = "";
        if ((rejected || returned) && i === idx) {
          dot = rejected ? "bg-brick border-brick" : "bg-[#2f5a7a] border-[#2f5a7a]";
          text = rejected ? "text-brick" : "text-[#2f5a7a]";
        } else if (i < idx) { dot = "bg-green border-green"; text = "text-green-d"; }
        else if (i === idx) { dot = "bg-gold border-gold-d"; text = "text-gold-d font-extrabold"; extra = "pulse-ring"; }
        return (
          <div key={s.key} className="relative z-10 flex flex-1 flex-col items-center gap-1.5">
            <span className={`h-[15px] w-[15px] rounded-full border-2 transition-colors duration-300 ${dot} ${extra}`} />
            <span className={`text-[9px] font-semibold text-center leading-tight transition-colors duration-300 ${text}`}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const STATUS = {
  in_review: ["In review", "bg-[#fef2d8] text-gold-d"],
  approved: ["Approved & awarded", "bg-[#dff0e4] text-green-d"],
  rejected: ["Rejected", "bg-[#f6ddd6] text-brick"],
  returned: ["Returned for correction", "bg-[#dde8f1] text-[#2f5a7a]"],
};
export function StatusTag({ status }) {
  const [label, cls] = STATUS[status] || STATUS.in_review;
  return <span className={`tag ${cls}`}>{label}</span>;
}

export function Seal({ size = 34 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="none" stroke="#c98a1e" strokeWidth="2" />
      <path d="M24 8 L24 40 M12 16 L36 32 M36 16 L12 32" stroke="#1f5c3d" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="24" r="6" fill="#c98a1e" />
    </svg>
  );
}

export function KenyaFlag({ width = 28 }) {
  const h = width * 0.667;
  return (
    <svg viewBox="0 0 30 20" width={width} height={h} aria-label="Flag of Kenya" className="rounded-[2px] shadow-sm ring-1 ring-black/10">
      <rect width="30" height="20" fill="#fff" />
      <rect width="30" height="6.2" fill="#000" />
      <rect y="6.9" width="30" height="6.2" fill="#c8102e" />
      <rect y="13.8" width="30" height="6.2" fill="#006600" />
      <rect y="6.2" width="30" height="0.7" fill="#fff" />
      <rect y="13.1" width="30" height="0.7" fill="#fff" />
      <g transform="translate(15,10)">
        <polygon points="0,-7 2.6,-1 -2.6,-1" fill="#c8102e" stroke="#000" strokeWidth="0.3" />
        <polygon points="0,7 2.6,1 -2.6,1" fill="#c8102e" stroke="#000" strokeWidth="0.3" />
        <polygon points="-7,0 -1,2.6 -1,-2.6" fill="#c8102e" stroke="#000" strokeWidth="0.3" />
        <polygon points="7,0 1,2.6 1,-2.6" fill="#c8102e" stroke="#000" strokeWidth="0.3" />
        <circle r="2.3" fill="#fff" stroke="#000" strokeWidth="0.3" />
        <circle r="1.1" fill="#000" />
      </g>
    </svg>
  );
}

export function money(n) {
  return "KES " + (Number(n) || 0).toLocaleString("en-KE");
}
export function fmtDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

// One distinct colour per ward, used as a small dot/badge so wards are
// recognisable at a glance across queues, the committee view, and reports.
export const WARD_COLORS = {
  "Benane":           "#c9524d",
  "Burder":           "#3f7d5c",
  "Dadajabula":       "#2f5a7a",
  "Habaswein":        "#c98a1e",
  "Lagboghol South":  "#7a4f9e",
  "Ibrahim Ure":      "#1f8a8a",
  "Diif":             "#a3341f",
};
const FALLBACK_WARD_COLOR = "#6b5d49";

export function WardDot({ ward, size = 8 }) {
  const color = WARD_COLORS[ward] || FALLBACK_WARD_COLOR;
  return <span className="inline-block rounded-full flex-shrink-0" style={{ width: size, height: size, background: color }} aria-hidden />;
}
