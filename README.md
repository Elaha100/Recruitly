# Recruitly

Recruitly is a mini Applicant Tracking System (ATS) built as a coding-test project. It lets a recruiting team log in, manage open jobs, add candidates, and track them through a recruitment pipeline on a Kanban board — with role-based access so customers only manage their own company's data, while admins can manage accounts and act on behalf of any company.

## Features

- Admin can create both admin and customer accounts
- Customer authentication / login
- Create and manage jobs
- Add and manage candidates
- Candidate profile information, including LinkedIn URL, email, phone and notes
- Compact Kanban candidate pipeline
- Recruitment stages: Applied, Screening, Interview, Offer, Hired, Rejected
- Move candidates between stages (dropdown, or drag-and-drop between columns)
- Filter/search candidates by job and by candidate name, combinable
- Admin can act on behalf of customer companies
- AI CV Evaluation prototype

## AI CV Evaluation

The AI CV Evaluation page is a working **prototype**, not a live AI integration. It scores a candidate against a job description using a simple local keyword-matching method, and this is clearly labeled in the app itself so it is never mistaken for a real AI result.

A production version would work like this:

CV → uploaded and processed securely on the server → combined with the job description → sent to an AI model from a secure server-side function → returned as a structured evaluation (match score, strengths, gaps, and a recommendation).

No real AI provider is connected in the current build — this is intentional, and disclosed rather than simulated as if it were real.

## Tech Stack

- React
- Vite
- Supabase
- Supabase Authentication
- Supabase Database
- Supabase Edge Functions
- JavaScript / CSS

## User Roles

**Admin** — platform-wide access. Can create both admin and customer accounts, and can act on behalf of any customer company to manage that company's jobs and candidates.

**Customer** — belongs to one company. Can log in and manage only that company's own jobs and candidates. This boundary is enforced by the database itself (Row Level Security), not only by the interface.

## Running Locally

1. Clone the repository
2. `npm install`
3. Create a `.env` file based on `.env.example`
4. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. `npm run dev`

## Project Structure

```
src/
  context/     Session/role state, and the admin "acting on behalf of a company" state
  hooks/       Supabase data hooks (jobs, candidates, profiles, companies)
  components/  Reusable UI, layout, and feature components
  pages/       Login, Dashboard, Jobs, Candidate Pipeline, Users, AI CV Evaluation
supabase/
  schema.sql               Database schema and Row Level Security policies
  functions/create-user/   Edge Function for secure, admin-only account creation
```

## Security

Environment variables and secrets are excluded from Git — `.env` is git-ignored, and only `.env.example` (with empty placeholders) is committed. Authentication and data access are handled through Supabase, with Row Level Security enforcing that a customer can only read or write their own company's data at the database level, not just in the UI.

## Demo

- Live application: _TBD — link will be added after deployment_
- Loom walkthrough: _TBD — link will be added after recording_

## Coding Test Focus

This project prioritizes getting a usable, working first version of the core ATS workflow into a customer's hands quickly, while keeping the architecture simple and understandable rather than over-engineered — so it stays easy to review, explain, and build on.
