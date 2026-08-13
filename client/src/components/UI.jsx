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
      {STAGES.map((s, i) => {
        let dot = "bg-sand-2 border-line";
        let text = "text-ink-soft";
        if ((rejected || returned) && i === idx) {
          dot = rejected ? "bg-brick border-brick" : "bg-[#2f5a7a] border-[#2f5a7a]";
          text = rejected ? "text-brick" : "text-[#2f5a7a]";
        } else if (i < idx) { dot = "bg-green border-green"; text = "text-green-d"; }
        else if (i === idx) { dot = "bg-gold border-gold-d ring-4 ring-gold/20"; text = "text-gold-d font-extrabold"; }
        return (
          <div key={s.key} className="relative z-10 flex flex-1 flex-col items-center gap-1.5">
            <span className={`h-[15px] w-[15px] rounded-full border-2 ${dot}`} />
            <span className={`text-[9px] font-semibold text-center leading-tight ${text}`}>{s.label}</span>
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

export function money(n) {
  return "KES " + (Number(n) || 0).toLocaleString("en-KE");
}
export function fmtDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}
