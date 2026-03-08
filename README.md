# TIC Admin Dashboard

Internal admin dashboard for **The Incite Crew** — built to manage membership applications, send email communications, and control application statuses.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via [Supabase](https://supabase.com) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| API | [tRPC](https://trpc.io) |
| Auth | Supabase Auth (email/password) |
| Email | Nodemailer (Gmail SMTP) |
| Theming | `next-themes` (dark / light) |
| Icons | [Lucide React](https://lucide.dev) |

---

## Features

### Applications Management
- View all membership applications in a sortable table (desktop) or card list (mobile)
- Filter by **status** (Pending / Reviewed / Approved / Rejected)
- Filter by **tier** (Trailblazer / Visionary / Explorer) — combinable with status filter
- Debounced full-text search across name, startup, and email
- Click any application to open a dedicated detail page (`/applications/[id]`)

### Application Detail Page
- Hero banner with tier-coloured accent strip and applicant avatar
- Startup facts grid, Primary Goal, and Founder's Overview
- **Email Actions panel:**
  - Send "Under Review" notification
  - Send Acceptance email (with optional Calendly link)
  - Send Rejection email
  - **Custom Email** — compose any subject + body using the TIC branded template
- **Status Controls** — update status without sending an email
- Fully responsive (single-column on mobile → 2-column grid on desktop)

### Authentication
- Email/password login via Supabase Auth
- Middleware guards every route — unauthenticated users are redirected to `/login`
- `/auth/callback` route handles Supabase invite and recovery tokens
- Logout button in sidebar

### Settings
- Change password from `/settings` (with show/hide toggles and confirmation field)

### Performance
- `loading.tsx` skeleton files for instant perceived navigation
- 250 ms debounced search
- 500-row safety cap on the `getAll` DB query
- `staleTime: 30s` on all tRPC queries

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/              # All protected dashboard routes
│   │   ├── layout.tsx            # Sidebar + mobile top bar + logout
│   │   ├── loading.tsx           # Applications list skeleton
│   │   ├── page.tsx              # Applications list page
│   │   ├── applications/
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Application detail page
│   │   │       └── loading.tsx   # Detail page skeleton
│   │   └── settings/
│   │       └── page.tsx          # Change password
│   ├── actions/
│   │   ├── auth.ts               # login / logout server actions
│   │   └── settings.ts           # updatePassword server action
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # Supabase token exchange (invite / reset)
│   ├── login/
│   │   └── page.tsx              # Login page
│   └── layout.tsx                # Root layout (fonts, theme, tRPC)
├── lib/
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       └── server.ts             # Server Supabase client (cookie-based)
├── middleware.ts                  # Route protection (cookie-based session check)
├── server/
│   ├── api/
│   │   └── routers/
│   │       └── application.ts    # tRPC router (getAll, getById, updateStatus, emails)
│   ├── db/
│   │   └── schema.ts             # Drizzle schema (applications table)
│   └── mail.ts                   # Nodemailer email functions
├── components/
│   └── ThemeToggle.tsx           # Dark / light mode toggle
├── trpc/
│   └── query-client.ts           # React Query config (staleTime etc.)
└── env.js                        # Type-safe env validation
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# PostgreSQL (Supabase)
POSTGRES_URL="postgres://..."

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# Email (Gmail SMTP via App Password)
SMTP_USER="noreply@yourdomain.com"
GOOGLE_APP_KEY_SMTP="xxxx xxxx xxxx xxxx"

# Team notification emails (comma-separated)
TEAM_EMAILS="admin1@example.com, admin2@example.com"
```

> **`GOOGLE_APP_KEY_SMTP`** — generate a Gmail App Password at  
> [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)  
> (requires 2FA enabled on the Gmail account)

---

## Getting Started

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# fill in .env with your values
```

### 3. Push the database schema
```bash
pnpm db:push
```

### 4. Create an admin user in Supabase
- Go to Supabase Dashboard → **Authentication → Users**
- Click **Add user → Create new user**
- Enter an email + password
- Share the credentials with the admin

### 5. Run the dev server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

## Email Templates

All emails use a dark-branded HTML template and are sent via Nodemailer. The following automated emails are available from the application detail page:

| Action | Template | Status change |
|---|---|---|
| Under Review | `sendReviewEmail` | → `reviewed` |
| Acceptance | `sendDecisionEmail` (approved) | → `approved` |
| Rejection | `sendDecisionEmail` (rejected) | → `rejected` |
| Custom | `sendCustomEmail` | none |

Acceptance emails include an optional Calendly scheduling link.

---

## Database Schema

The `applications` table is shared with the main TIC project (same Supabase instance):

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `name` | text | Founder name |
| `email` | text | |
| `mobileNumber` | text | |
| `startupName` | text | |
| `tier` | text | Trailblazer / Visionary / Explorer |
| `founderStage` | text | |
| `monthlyRevenue` | text | nullable |
| `primaryGoal` | text | |
| `overview` | text | |
| `website` | text | nullable |
| `pitchDeck` | text | nullable |
| `status` | text | pending / reviewed / approved / rejected |
| `createdAt` | timestamp | |

---

## Supabase Setup Notes

- **Site URL:** Set to your production URL in Authentication → URL Configuration
- **Redirect URLs:** Add `http://localhost:3000/auth/callback` (dev) and your production callback URL
- **Email provider:** Email/password is enabled by default — no extra config needed

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server (Turbopack) |
| `pnpm build` | Build for production |
| `pnpm check` | Run ESLint + TypeScript type check |
| `pnpm db:push` | Push Drizzle schema to database |
| `pnpm db:studio` | Open Drizzle Studio |

---

## Roadmap

- [ ] User management page
- [ ] Pagination for applications list (currently capped at 500)
- [ ] Analytics / overview charts
- [ ] Email open tracking
