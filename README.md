# Client Brief

A guided intake form for web development clients. Instead of a vague "tell me about your project" email, clients answer structured, project-specific questions, and I get a complete brief I can quote from.

**Live:** [client-brief-eta.vercel.app](https://client-brief-eta.vercel.app)

![Brief form](docs/screenshots/form.png)

## Why I built it

Most first messages from clients are one line long: *"I need a website, how much?"* Getting from there to a real quote takes several emails of back-and-forth, and some clients drop off along the way.

This form asks the right questions up front, adapted to what the client needs. Someone building an online store is asked about products, payments and shipping. Someone building a portfolio is asked what kind of work they want to show. Budget and timeline are picked from ranges, which filters out mismatched projects before any time is spent on them.

## Features

**For clients**
- 5-step form with progress indicator and a review step before sending
- Conditional questions that change based on the project type
- Validation on every step, with clear error messages
- Keyboard and screen reader friendly (fieldsets, labels, `aria-invalid`, focus management)
- Links pasted without `https://` are fixed automatically

**For me (admin dashboard)**
- Email notification for every new brief, with *Reply* going straight to the client
- Brief list with status filters (New, Reviewing, Accepted, Rejected) and counts
- Full brief view with readable answers and one-click reply
- Status updates

![Admin dashboard](docs/screenshots/admin.png)

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Cache Components), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui (customized brutalist design system) |
| Forms & validation | React Hook Form, Zod 4 (one schema shared by client and server) |
| Database & auth | Supabase (PostgreSQL, Row Level Security, Auth) |
| Email | Resend |
| Hosting | Vercel (with a daily cron job) |

## Security

The form is public, so the design assumes any request may come from someone other than the form itself.

- **Server-side validation.** Server Actions are public endpoints. Every action accepts `unknown`, validates with the same Zod schema as the client, and re-checks the conditional questions.
- **Row Level Security.** Visitors can only `INSERT` new briefs with status `new`. They cannot read, update or delete anything, including their own submission.
- **Admin access through a database table, not just login.** Sign-ups are disabled, and read/update policies only apply to users listed in an `admins` table. A logged-in user who isn't an admin sees an empty list.
- **Column-level permissions.** Logged-in users can only update the `status` column. Client data can't be changed from the app, even if the app code had a bug.
- **Database constraints.** `CHECK` constraints mirror the Zod schema (lengths, allowed values), so invalid data is rejected even if the app is bypassed.
- **Spam protection.**
  - A honeypot field that real users never see. Bots that fill it get a fake success response and nothing is saved.
  - Rate limiting in a Postgres trigger: 3 briefs per email per 24 hours, 30 briefs per hour overall. It lives in the database, so it applies regardless of how the table is reached.
- **No data leaks in errors.** Database errors are logged on the server. Clients only see a generic message.
- **Safe links.** Reference links are restricted to `http`/`https` before saving, and open with `rel="noopener noreferrer nofollow"`.

## How it works

```
Client fills the form (React Hook Form + Zod, step by step)
        │
        ▼
Server Action: validate again → honeypot check → clean answers
        │
        ▼
Supabase insert ── RLS + CHECK constraints + rate limit trigger
        │
        ▼
Response to the client (thank you screen)
        │
        ▼  after()  — runs after the response is sent
Email notification via Resend
```

The conditional questions are defined in one config file (`lib/brief-questions.ts`) and stored in a `jsonb` column. Adding or changing a question needs no database migration.

## Project structure

```
app/
├── brief/              # Public form page + submit Server Action
├── admin/
│   ├── login/          # Admin sign-in
│   ├── (dashboard)/    # Brief list and brief detail (shared layout)
│   └── actions.ts      # Login, logout, status update
└── api/keep-alive/     # Daily cron endpoint (protected by CRON_SECRET)
components/
├── brief/              # Form steps and form building blocks
├── admin/              # Dashboard components
└── ui/                 # shadcn/ui components, restyled
lib/
├── validations/brief.ts   # Zod schema and option labels
├── brief-questions.ts     # Conditional questions per project type
├── email/                 # Notification email
└── supabase/              # Server client and session proxy
supabase/schema.sql        # Full database schema, policies and triggers
proxy.ts                   # Redirects /admin to login when signed out
```

## Running locally

### 1. Install

```bash
git clone https://github.com/vannbo-93/client-brief.git
cd client-brief
npm install
```

### 2. Set up Supabase

1. Create a project on [supabase.com](https://supabase.com).
2. Open the SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Under **Authentication**, disable new user sign-ups.
4. Create your admin user (**Authentication → Users → Add user**, with *Auto Confirm*), then add it to the admins table:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill it in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API Keys |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same page, publishable key |
| `RESEND_API_KEY` | Resend → API Keys (sending access) |
| `NOTIFY_EMAIL` | Where new brief notifications go |
| `CRON_SECRET` | Any random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

Without a verified domain, Resend only sends to the email address of your Resend account, so `NOTIFY_EMAIL` must match it.

### 4. Run

```bash
npm run dev
```

- Form: [localhost:3000](http://localhost:3000)
- Admin: [localhost:3000/admin](http://localhost:3000/admin)

## Deploying to Vercel

1. Import the repository on Vercel.
2. Add the environment variables. Use type **Config** for the two `NEXT_PUBLIC_` variables (they are public by design) and **Secret** for `RESEND_API_KEY` and `CRON_SECRET`.
3. Deploy.

`vercel.json` registers a daily cron job that reads from the database. Supabase pauses free projects after a week without database activity, and an intake form can easily go a week without submissions.

## Decisions and trade-offs

- **Conditional questions are validated outside Zod.** Zod skips object-level refinements while other fields are still invalid, so step 3 couldn't be checked before step 4 was filled. A small `validateDetails()` function runs on both the client and the server instead.
- **Filtering happens in JavaScript.** The dashboard loads all briefs once and filters by status in memory. Simpler and fast for hundreds of briefs. It would move to SQL at a few thousand.
- **Plain text notification email.** It's an internal message. Plain text renders everywhere and needs no HTML escaping of client answers.

## Roadmap

Features I'll add if real clients need them:

- [ ] File uploads (logos, brand assets)
- [ ] Confirmation email to the client (needs a verified domain)
- [ ] PDF export of a brief
- [ ] Private links per client
- [ ] Arabic and French versions

## Author

**Mohamed El Aissaoui** ([VANNBO](https://github.com/vannbo-93)), web developer based in Kenitra, Morocco.