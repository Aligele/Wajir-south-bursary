import { supa } from "./supabase.js";

// Sends an email and/or SMS and records every attempt in bursary.notifications.
// If provider keys are absent, it still logs (status 'queued') so nothing breaks
// in development.

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
    return { status: r.ok ? "sent" : "failed" };
  } catch {
    return { status: "failed" };
  }
}

async function sendSMS(to, body) {
  const key = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  if (!key || !username || !to) return { status: "queued" };
  try {
    const params = new URLSearchParams({
      username,
      to,
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
    return { status: r.ok ? "sent" : "failed" };
  } catch {
    return { status: "failed" };
  }
}

export async function notify({ appId, email, phone, subject, body }) {
  const rows = [];
  if (email) {
    const { status } = await sendEmail(email, subject, body);
    rows.push({ app_id: appId, channel: "email", recipient: email, subject, body, status });
  }
  if (phone) {
    const { status } = await sendSMS(phone, body);
    rows.push({ app_id: appId, channel: "sms", recipient: phone, subject, body, status });
  }
  if (rows.length) {
    await supa.from("notifications").insert(rows);
  }
}
