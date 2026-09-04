# Recruitly

Recruitly is a lightweight Applicant Tracking System (ATS) built as a coding-test project. It lets a company track jobs and candidates through a recruitment pipeline, with a compact Kanban board, role-based access (admin/customer), and Supabase-backed authentication and data storage.

## Overview

A recruiting team (a "company" in Recruitly) can create jobs, add candidates against those jobs, and move candidates through recruitment stages on a Kanban board. Platform admins can create both admin and customer accounts and manage any company's data on their behalf. All data is scoped per company and protected with Supabase Row Level Security (RLS), so one company can never see another's data — even by tampering with frontend requests.

## Features

- Email/password authentication via Supabase Auth
- Two roles: **admin** (platform-wide access) and **customer** (scoped to their own company)
- Admins can create new admin or customer accounts (via a secure Edge Function)
- Admins can act "on behalf of" any company (a company switcher appears on relevant pages)
- Customers can create and edit jobs
- Customers can add, view, and edit candidates (name, email, phone, LinkedIn URL, job, stage, notes)
- Compact Kanban board of candidates across 6 stages: Applied → Screening → Interview → Offer → Hired / Rejected
- Kanban board filterable by job and searchable by candidate name (combinable)
- Candidate stage can be changed via a dropdown on each card, or by dragging cards between columns
- Simple dashboard with key stats (active jobs, total candidates, interviews, offers, hired)
- AI CV Evaluation prototype page, with a documented production architecture (see below)
- Loading states, empty states, and inline error messages throughout

## Tech Stack

- React 19 + Vite
- React Router (client-side routing, protected routes)
- Supabase (PostgreSQL database, Auth, Edge Functions)
- Plain CSS (no UI framework) — a small custom design system in `src/styles/app.css`

## Architecture

```
src/
  context/       AuthContext (session/role), CompanyScopeContext (admin "acting as" a company)
  components/    layout (shell, protected routes), jobs, candidates, kanban, admin, shared UI
  hooks/         Supabase data hooks (useJobs, useCandidates, useProfiles, useCompanies)
  pages/         Login, Dashboard, Jobs, Candidates (Kanban), Users (admin), CV Evaluation
supabase/
  schema.sql               Database schema + Row Level Security policies
  functions/create-user/   Edge Function for privileged account creation
```

Data fetching goes directly from React components/hooks to Supabase using the anon key; authorization is enforced by RLS policies in Postgres, not by hiding UI elements.

## Authentication & Roles

- **customer**: belongs to one company. Can log in and manage that company's jobs and candidates.
- **admin**: platform-wide. Not tied to a single company. Can create other accounts and can view/manage any company's jobs and candidates by selecting that company in the "Acting on behalf of" switcher shown on the Jobs, Candidates, and Dashboard pages.

Every table's Row Level Security policy checks the caller's role and company via helper SQL functions (`recruitly_current_role()`, `recruitly_current_company_id()`) that read the caller's own `profiles` row — so access control is enforced at the database level, independent of the frontend.

## Database Structure

- **companies** (`id` bigint, `name`) — a recruiting tenant
- **profiles** (`id` uuid = Supabase Auth user id, `company_id`, `role`, `full_name`, `email`) — one row per user
- **jobs** (`id` bigint, `company_id`, `title`, `description`, `location`, `status`) — belongs to a company
- **candidates** (`id` bigint, `company_id`, `job_id`, `full_name`, `email`, `phone`, `linkedin_url`, `status`, `notes`) — belongs to a company and optionally a job

The frontend refers to a candidate's `full_name`/`status` columns as `name`/`stage` for readability; that translation lives in one place, `src/hooks/useCandidates.js`, so the rest of the app can stay simple.

Full schema and RLS policies: [`supabase/schema.sql`](supabase/schema.sql) (written as an additive migration against the project's pre-existing tables — see [`supabase/inspection.sql`](supabase/inspection.sql) for the read-only query used to confirm the existing structure before writing it).

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase project values (Project Settings → API):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Only the anon/public key is used in the frontend. The `service_role` key is never used in React — it is only referenced inside the `create-user` Edge Function, which runs on Supabase's servers.

## Running Locally

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run lint     # lint the codebase
```

Before running the app, apply `supabase/schema.sql` in your Supabase project's SQL Editor, and deploy the `create-user` Edge Function (`supabase functions deploy create-user`) if you want in-app account creation to work.

## Security

- `.env` is git-ignored; only `.env.example` (with empty placeholders) is committed.
- The Supabase `service_role` key is never sent to the browser — account creation happens inside a Supabase Edge Function.
- Row Level Security is enabled on every table. Customers can only read/write rows belonging to their own `company_id`; this is enforced in Postgres, not just hidden in the UI.
- Protected routes redirect unauthenticated users to `/login`; admin-only routes redirect non-admins away — but the real security boundary is the database RLS policy, not the route guard.

## Assumptions

- Each customer belongs to exactly one company; each company can have multiple customer users.
- Jobs and candidates belong to a company; a candidate is optionally linked to one job.
- Candidate stages use a fixed pipeline: Applied, Screening, Interview, Offer, Hired, Rejected.
- Admin accounts are platform-wide and are not associated with a single company.
- Accounts are created by an admin (through the in-app form) rather than public self-signup, matching the "admin creates accounts" requirement.

## AI-assisted Development

This project was built with AI-assisted development (Claude Code) as encouraged by the coding-test instructions, to move quickly from an empty Vite/React scaffold to a working ATS. Architecture, database design, and security decisions were reviewed and directed throughout.

## AI CV Evaluation / Future Approach

The "AI CV Evaluation" page is a working **prototype**, not a live AI integration — it computes a keyword-overlap score locally so the flow can be demonstrated end-to-end, and is clearly labeled as such in the UI.

A production implementation would:

1. Upload the candidate's CV to Supabase Storage.
2. Extract text from the file in a Supabase Edge Function.
3. Retrieve the relevant job description from the database.
4. Send the CV text + job description to an AI provider **from the Edge Function** (never from the browser, so the API key is never exposed).
5. Request structured JSON output (score, strengths, gaps, recommendation) and validate it against a schema.
6. Store the result in an `evaluations` table and display it on the candidate's profile.

## Known Limitations

- No password reset / "forgot password" flow.
- No pagination — fine for a coding-test dataset size, not for large-scale production data.
- AI CV Evaluation uses a local heuristic, not a real AI model call.
- No automated test suite.

## Future Improvements

- Real AI CV evaluation via a secure Edge Function.
- Candidate/job pagination and server-side filtering for larger datasets.
- Activity log per candidate (stage history, who changed what and when).
- Interview scheduling and notes per stage.
