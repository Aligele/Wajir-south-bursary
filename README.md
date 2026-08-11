# Wajir South Constituency — NG-CDF Bursary System

A full-stack bursary application and approval workflow. Applications flow through
five roles: **Applicant → CDF Manager → Clerk → Chairman → MP**. Each office
approves, returns, or rejects; the MP sets the final award amount.

## Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js (Express)
- **Database + Storage:** Supabase (PostgreSQL) — schema `bursary`
- **Auth:** JWT with role-based access
- **Features:** document uploads, MP award amount, email/SMS notifications, CSV & PDF reports

---

## 1. Database

The schema is already created in your Supabase project (schema `bursary`) with
tables: `users`, `wards`, `applications`, `approvals`, `documents`,
`notifications`, plus a private storage bucket `bursary-docs`.

If you ever need to recreate it, the two migrations are in
`db/` (exported for reference).

## 2. Backend

```bash
cd server
cp .env.example .env
# edit .env — set JWT_SECRET and SUPABASE_SERVICE_KEY (service_role key
# from Supabase dashboard → Project Settings → API)
npm install
npm run dev        # starts on http://localhost:4000
```

Optional notification providers (leave blank to just log to the DB):
- **Email:** set `RESEND_API_KEY` and `NOTIFY_FROM_EMAIL`
- **SMS:** set `AT_API_KEY`, `AT_USERNAME`, `AT_SENDER_ID` (Africa's Talking)

## 3. Frontend

```bash
cd client
npm install
npm run dev        # starts on http://localhost:5173
```

The dev server proxies `/api` to the backend automatically.

---

## Test accounts (password for all: `password123`)

| Role        | Email                        |
|-------------|------------------------------|
| Applicant   | applicant@wajirsouth.test    |
| CDF Manager | manager@wajirsouth.test      |
| Clerk       | clerk@wajirsouth.test        |
| Chairman    | chairman@wajirsouth.test     |
| MP          | mp@wajirsouth.test           |

**Try the full flow:** sign in as the applicant, submit an application, then sign
in as each reviewer in turn and approve — watch it advance stage by stage until
the MP awards it. Reviewers can also open the **Reports** tab to export CSV/PDF.

---

## How the workflow works

1. Applicant submits → application enters the **CDF Manager** queue.
2. Each reviewer sees only applications currently at their stage. Approving
   advances it to the next office; **Return** or **Reject** stops it and notifies
   the applicant.
3. The MP's approval marks it **Approved & awarded** with the final amount.
4. Every action is written to the approval trail with the officer's name, time,
   and any comment.

## Production notes

- Self-registration is open to all roles for demo convenience. In production,
  restrict `/api/auth/register` to `applicant` only and have the constituency
  office create reviewer accounts.
- Set a strong `JWT_SECRET` and keep the Supabase **service_role** key on the
  server only — never ship it to the browser.
- Row Level Security is not required because all DB access goes through the
  server using the service key; if you later expose Supabase directly to the
  client, add RLS policies first.
