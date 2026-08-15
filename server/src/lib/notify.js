import { supa } from "./supabase.js";

// Sends an email and/or SMS and records every attempt in bursary.notifications.
// If provider keys are absent, it still logs (status 'queued') so nothing breaks
// in development.

// Africa's Talking (and most SMS gateways) require international format,
// e.g. +254712345678 — our forms collect the local 07... format, so convert.
function toE164Kenya(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("254")) return "+" + digits;
  if (digits.startsWith("0")) return "+254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "+254" + digits;
  return "+" + digits;
}

async function sendEmail(to, subject, body) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return { status: "queued" };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM_EMAIL || "bursary@wajirsouth.go.ke",
        to,
        subject,
        text: body,
      }),
    });
    if (r.ok) return { status: "sent" };
    const errText = await r.text().catch(() => "");
    console.error("Resend email failed:", r.status, errText);
    return { status: "failed", detail: errText.slice(0, 500) };
  } catch (err) {
    console.error("Resend email error:", err);
    return { status: "failed", detail: String(err).slice(0, 500) };
  }
}

async function sendSMS(to, body) {
  const key = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  if (!key || !username || !to) return { status: "queued" };
  try {
    const params = new URLSearchParams({
      username,
      to: toE164Kenya(to),
      message: body,
      ...(process.env.AT_SENDER_ID ? { from: process.env.AT_SENDER_ID } : {}),
    });
    const r = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey: key,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params,
    });
    const resText = await r.text().catch(() => "");
    if (r.ok) {
      // Africa's Talking returns 200 with a per-recipient status inside the body
      // even when the message itself was rejected (e.g. sandbox number not registered)
      let recipientFailed = false;
      try {
        const json = JSON.parse(resText);
        const recipients = json?.SMSMessageData?.Recipients || [];
        recipientFailed = recipients.length > 0 && !recipients.every((rr) => rr.status === "Success");
      } catch { /* not JSON, fall through */ }
      if (recipientFailed) {
        console.error("Africa's Talking rejected recipient:", resText);
        return { status: "failed", detail: resText.slice(0, 500) };
      }
      return { status: "sent" };
    }
    console.error("Africa's Talking failed:", r.status, resText);
    return { status: "failed", detail: resText.slice(0, 500) };
  } catch (err) {
    console.error("Africa's Talking error:", err);
    return { status: "failed", detail: String(err).slice(0, 500) };
  }
}

export async function notify({ appId, email, phone, subject, body }) {
  const rows = [];
  if (email) {
    const { status, detail } = await sendEmail(email, subject, body);
    rows.push({ app_id: appId, channel: "email", recipient: email, subject, body: detail ? `${body}\n\n[error: ${detail}]` : body, status });
  }
  if (phone) {
    const { status, detail } = await sendSMS(phone, body);
    rows.push({ app_id: appId, channel: "sms", recipient: phone, subject, body: detail ? `${body}\n\n[error: ${detail}]` : body, status });
  }
  if (rows.length) {
    await supa.from("notifications").insert(rows);
  }
}
