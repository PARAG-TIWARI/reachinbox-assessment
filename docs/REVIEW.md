# ReachInbox Hiring Assignment ΓÇö Review Pack

This document has two parts:

1. **Part 1 ΓÇö the problem statement**, exactly as given.
2. **Part 2 ΓÇö what we built**: every requirement mapped to its implementation and status, then everything built beyond the brief, the verification results and the trade-offs.

---

# Part 1 ΓÇö Problem statement (as given)

Software Development Intern Assignment
Context:
[ReachInbox.ai](http://ReachInbox.ai) is a product of Outbox Labs focused on transforming cold email outreach with AI-driven workflows. Our all-in-one solution empowers businesses to effortlessly find, enrich, and engage high-intent leads through cold email. With just a single prompt, ReachInbox springs into action, prospecting and verifying leads, crafting personalized email sequences, and notifying businesses of positive leads. ReachInbox is more than a tool; it's your growth partner.
We are looking for passionate and innovative individuals to join our team and help us continue to redefine the future of lead generation and business growth.
≡ƒÜÇ ReachInbox Hiring Assignment ΓÇô Full-stack Email Job Scheduler
≡ƒÄ» Problem Statement
At ReachInbox, a huge part of our system is reliable scheduling and sending of emails at scale.
Your task is to build a production-grade email scheduler service + dashboard that:

* Accepts email send requests via APIs
* Schedules them to be sent at a specific time
* Uses BullMQ + Redis as a persistent job scheduler (no cron jobs)
* Sends emails using fake SMTP via Ethereal Email
* Survives server restarts without restarting from scratch or losing jobs
* Exposes a frontend dashboard to:
   * Schedule new emails
   * View scheduled emails
   * View sent emails

Think of it as a tiny slice of what ReachInbox does under the hood.
≡ƒº¬ Tech Requirements
You must use:
Backend

* Language: TypeScript
* Framework: Express.js
* Queue: BullMQ (backed by Redis)
* Database: MySQL or PostgreSQL (ORM or query builder is your choice)
* SMTP: Ethereal Email (fake SMTP for testing)

Frontend

* React.js or Next.js
* Tailwind CSS (or any modern CSS library)
* TypeScript strongly preferred

Infra

* Redis and DB can be run via Docker (recommended but not mandatory)

We care about how you structure a real backend, wire queues correctly, and build a clean frontend.
≡ƒûÑ Backend Requirements
1∩╕ÅΓâú Core Scheduler Behavior
Your backend must:

* Accept email scheduling requests via API
* Store them in a relational DB (MySQL/Postgres)
* Schedule them using BullMQ delayed jobs (or a custom Redis/DB-based scheduler) ΓÇô no cron
* Send emails from multiple senders via Ethereal Email (SMTP)
* Must have sent/scheduled emails **searchable via Elasticsearch (**Implement indexing to make emails searchable)
* Must Expose a live BullMQ dashboard for real-time queue visibility
* Persist state so that:
   * If the server restarts, future emails are still sent at the correct time
   * Emails are not duplicated or restarted from scratch

2∩╕ÅΓâú Throughput, Rate Limiting & Concurrency (Required)
Your scheduler should behave like a real-world email system under load.
You must support:
Γ£à Worker Concurrency

* Configure your BullMQ worker(s) with a configurable concurrency level .
* Implementation must be safe when multiple jobs run in parallel:

Γ£à Delay Between Each Email

* There must be a minimum delay between individual email sends (to mimic provider throttling).
* You can:
   * Use BullMQΓÇÖs limiter options, or
   * Add a custom delay in the worker logic.
* Document in the README what delay you chose (e.g. ΓÇ£min 2 seconds between sendsΓÇ¥).

Γ£à Emails Per Hour (Rate Limiting)

* Implement a rate limit on the number of emails sent per hour:
   * Either global (e.g. `MAX_EMAILS_PER_HOUR=200`), or
   * Per-sender / per-tenant (e.g. `MAX_EMAILS_PER_HOUR_PER_SENDER`), you will have to support multiple senders.
* The limit values must be configurable via env/config (no hardcoding).
* Rate-limiting logic must be safe across multiple workers / instances:
   * Use Redis or DB backed counters (e.g. keyed by `hour_window + sender`),
   * Do not rely only on in-memory counts.
* When the hourly limit is reached:
   * Do not drop or permanently fail jobs.
   * Jobs should be delayed / rescheduled into the next available hour window while preserving order as much as possible.
* Explain in the README how you enforce this:
   * e.g. BullMQ limiter, Redis counters, custom logic, trade-offs, etc.

Γ£à Slack Notification on Rate Limit Hit (Required)

* User clicks "Connect Slack" in the dashboard ΓåÆ real OAuth authorize flow ΓåÆ backend stores the token/webhook per user/tenant.
* You must actually send a message to their Slack the moment a sender's hourly limit is reached ΓÇö this has to be a live, verifiable call in your demo, not a log line.
* Handle disconnect/reconnect: if the user hasn't connected Slack, rate-limit hits should simply not notify (no crash); if they later connect, notifications should start working without a redeploy.

Γ£à Behavior Under Load
Your design should clearly define behavior when:

* 1000+ emails are scheduled for roughly the same time.
* The rate limit would be exceeded.

You donΓÇÖt need to actually send thousands via Ethereal, but your logic should handle it.
3∩╕ÅΓâú Hard Constraints (Important)
These are non-negotiable:

* Γ¥î Do NOT use cron jobs
   * No OS-level cron (`crontab`, etc.)
   * No Node cron libraries (`node-cron`, `agenda`, etc.)
* Γ£à Scheduling must be done using:
   * BullMQ delayed jobs, or
   * A custom scheduler that uses Redis/DB to track next run times ΓÇö but still not cron.
* Γ£à The system must be persistent:
   * After a restart:
      * Future scheduled emails still send at the right time
      * Emails are not re-sent or restarted from Day 1
* Γ¥î Same email queues should not be sent more than once. Maintain idempotency.

≡ƒÄ¿ Frontend Requirements
You will build a frontend that matches the provided [Figma](https://www.figma.com/design/kOTwGlESjijCYnMgtHfvfU/Outbox-Labs-Assignment?node-id=59-4050&p=f&m=dev) as closely as possible and talks to your backend APIs.
[Figma Link](https://www.figma.com/design/kOTwGlESjijCYnMgtHfvfU/Outbox-Labs-Assignment?node-id=59-4050&p=f&m=dev)
1∩╕ÅΓâú Google Login (Required)

* Implement real Google OAuth login (no mock).
* After login, redirect the user to the dashboard.
* Show in the top header:
   * UserΓÇÖs name
   * Email
   * Avatar
* Provide a simple Logout option.

2∩╕ÅΓâú Main Dashboard
After login, show the main UI with:

* Top header (user info + logout).
* Tabs/sections:
   * Scheduled Emails
   * Sent Emails
* A primary ΓÇ£Compose New EmailΓÇ¥ button.

Layout and styling should closely follow the Figma design.
3∩╕ÅΓâú Compose New Email
User must be able to:

* Enter:
   * Subject
   * Body
* Upload a CSV/text file of email leads.
   * Parse and show the number of email addresses detected.
* Set:
   * Start time (when scheduling begins)
   * Delay between emails
   * Hourly limit
* Click Schedule to send data to the backend schedule API.

This can be a modal or separate page, depending on the Figma.
4∩╕ÅΓâú Scheduled Emails
Show a clean table/list with:

* Email
* Subject
* Scheduled time
* Status

Include:

* Loading states
* Empty state when there are no scheduled emails

5∩╕ÅΓâú Sent Emails
Show a table/list with:

* Email
* Subject
* Sent time
* Status (`sent` / `failed`)

Include:

* Loading states
* Empty state when there are no sent emails

6∩╕ÅΓâú Frontend Code Quality
We expect:

* Clean folder structure
* Reusable UI components (buttons, inputs, tables, modals, etc.)
* DRY code (avoid duplication)
* Proper TypeScript usage:
   * Types/interfaces for API responses & props
* Good UX:
   * Loading indicators
   * Empty states
   * Error handling (basic messages/toasts)

≡ƒôª Submission Guidelines

1. Create a private GitHub repository (monorepo or separate folders for backend & frontend is fine).
2. Grant access to user: `Mitrajit and Yadav036`
3. Add a README that includes:
   * How to run backend (Express, Redis, DB, BullMQ worker)
   * How to run frontend
   * How to set up Ethereal Email and env variables
   * Architecture overview:
      * How scheduling works
      * How persistence on restart is handled
      * How rate limiting & concurrency are implemented
   * List of features implemented, mapped to:
      * Backend: scheduler, persistence, rate limiting, concurrency
      * Frontend: login, dashboard, compose, tables, etc.
4. Add a short demo video (max 5 minutes):
   * Show creating scheduled emails (from frontend or Postman)
   * Show the dashboard with Scheduled and Sent emails
   * Show a restart scenario:
      * Stop server ΓåÆ start again ΓåÆ future emails still send
   * (Bonus) Briefly demonstrate how rate limiting / delay behaves under load
5. Note any assumptions, shortcuts, or trade-offs you made.

---

# Part 2 ΓÇö What we built

**Repository:** `reachinbox-email-scheduler` (private, GitHub) ┬╖ **Stack:** TypeScript ┬╖ Express ┬╖ BullMQ + Redis ┬╖ PostgreSQL (Prisma) ┬╖ Elasticsearch ┬╖ React + Vite + Tailwind ┬╖ npm-workspaces monorepo (`apps/api`, `apps/web`, `packages/shared`).

## At a glance

| | |
|---|---|
| Required backend features | **All built.** Scheduling, persistence, idempotency, concurrency, delay, hourly limits, Elasticsearch, Bull Board ΓÇö verified on real Ethereal SMTP |
| Required frontend features | **All built.** Google login, header, Scheduled/Sent tabs, Compose (CSV count, start time, delay, hourly limit), loading/empty/error states |
| Built but not yet run live | **Slack OAuth + alert** (tested against a stand-in for Slack's API) and **Google login** (tested up to Google) ΓÇö both need the reviewer-side / owner credentials; setup steps are in the README |
| Not verifiable by us | **Pixel match with the Figma** ΓÇö the file could not be opened by our tooling; the UI follows the layout the brief describes |
| Still to do (owner) | Record the Γëñ 5-min demo video (script in `docs/DEMO_SCRIPT.md`); invite `Mitrajit` and `Yadav036` to the repo |
| Beyond the brief | **30+ additional features** (listed below) |
| Quality | **447 automated tests** (412 API against real Postgres/Redis/Elasticsearch + 35 web) ┬╖ strict TypeScript ┬╖ ESLint ┬╖ `npm audit`: 0 vulnerabilities ┬╖ WCAG 2.1 AA (axe): 0 violations on every page in both the light and dark themes ┬╖ CI ┬╖ no cron (enforced by a CI check) |

Evidence for every measured claim below is in `docs/VERIFICATION.md`.

---

## 2.1 Requirement-by-requirement

Status key: Γ£à built and verified ┬╖ ≡ƒƒ¿ built, live check pending (needs credentials / access) ┬╖ Γ¼£ owner action

### Problem statement

| Requirement | Status | How it's met |
|---|---|---|
| Accept email send requests via APIs | Γ£à | `POST /api/campaigns` (validated with a shared zod schema; supports an `Idempotency-Key` header) |
| Schedule for a specific time | Γ£à | Each email gets its own time (`startAt + i ├ù delay`) and becomes a BullMQ **delayed job** |
| BullMQ + Redis as persistent scheduler, no cron | Γ£à | Delayed jobs only; Redis runs with AOF persistence; `npm run check:no-cron` fails CI if any cron library/usage appears |
| Send via Ethereal fake SMTP | Γ£à | 3 real Ethereal accounts created by `npm run setup`; every sent email has an "Open in Ethereal" link |
| Survive restarts without restarting from scratch or losing jobs | Γ£à | Jobs persist in Redis (AOF); Postgres is the source of truth; a one-shot boot reconciler re-queues anything missing with the same job id and original time |
| Dashboard to schedule / view scheduled / view sent | Γ£à | Compose page, Scheduled tab, Sent tab |

### Tech requirements

| Requirement | Status | How it's met |
|---|---|---|
| TypeScript | Γ£à | Strict TypeScript across API, web and the shared package |
| Express.js | Γ£à | `apps/api/src/app.ts` |
| BullMQ backed by Redis | Γ£à | Queues: `email-send`, `notifications`, `search-index` |
| MySQL or PostgreSQL | Γ£à | PostgreSQL 16 via Prisma (migrations in `apps/api/prisma/migrations`) |
| Ethereal Email | Γ£à | nodemailer with a pooled transport per sender |
| React.js or Next.js | Γ£à | React 18 + Vite + React Router + TanStack Query |
| Tailwind CSS | Γ£à | Tailwind v4 with design tokens (light and dark themes) |
| Redis and DB via Docker | Γ£à | `docker-compose.yml` (Postgres, Redis with AOF, Elasticsearch) |

### Backend ΓÇö core scheduler behaviour

| Requirement | Status | How it's met |
|---|---|---|
| Accept scheduling requests via API | Γ£à | `POST /api/campaigns` |
| Store in a relational DB | Γ£à | `Campaign`, `Email`, `EmailEvent` tables (plus senders, Slack connections, do-not-contact list, audit log) |
| BullMQ delayed jobs, no cron | Γ£à | `jobId = emailId`, `delay = scheduledAt ΓêÆ now` |
| Send from multiple senders via Ethereal | Γ£à | Senders assigned round-robin (or one chosen sender) |
| Searchable via Elasticsearch (indexing) | Γ£à | Every status change re-indexes the email from Postgres; `GET /api/emails/search` with highlights; `npm run reindex` rebuilds the index |
| Live BullMQ dashboard | Γ£à | Bull Board at `/admin/queues` (sign-in required; can be limited to `ADMIN_EMAILS`) |
| After restart, future emails still send on time | Γ£à | Verified: worker `kill -9`, API `kill -9`, Redis container restart ΓÇö all pending emails sent at their times |
| No duplicates, no restart from scratch | Γ£à | Verified: **0 duplicate Message-IDs** across all drills and two competing workers |

### Throughput, rate limiting and concurrency

| Requirement | Status | How it's met |
|---|---|---|
| Configurable worker concurrency | Γ£à | `WORKER_CONCURRENCY`; safe in parallel because all shared state is in atomic Redis scripts and conditional DB updates |
| Minimum delay between sends | Γ£à | **Minimum 2 seconds between sends from the same sender** (`MIN_DELAY_BETWEEN_EMAILS_MS=2000`): an atomic slot reservation plus a check at the moment of sending. Measured minimum gap on Ethereal: **2,007 ms** (2,034 ms under a 1,000-email load) |
| Documented in README | Γ£à | README ΓåÆ "Rate limiting, delay & concurrency" |
| Emails per hour, global and per sender | Γ£à | `MAX_EMAILS_PER_HOUR` (global), `MAX_EMAILS_PER_HOUR_PER_SENDER`, plus a per-campaign hourly limit from the compose form |
| Configurable via env, no hard-coding | Γ£à | All limits are env settings, documented in `.env.example` |
| Safe across workers/instances (Redis counters keyed by hour window + sender) | Γ£à | One atomic Lua script checks and increments global, sender, campaign (and warm-up daily) counters together, all-or-none |
| At the limit: don't drop/fail; move to the next window, preserving order | Γ£à | Emails become `RATE_LIMITED` and are re-queued for the next window with an ordering rank. Verified: 1,000 emails due at once ΓåÆ **0 dropped**, exactly the configured number per sender per window, the rest in order |
| README explains enforcement and trade-offs | Γ£à | README ΓåÆ Architecture, and "Why not BullMQ's built-in limiter?" |
| Slack: "Connect Slack" ΓåÆ real OAuth ΓåÆ token stored per user | ≡ƒƒ¿ | Real Slack OAuth v2 flow; webhook and bot token stored encrypted (AES-256-GCM) per user. Tested with Slack's API stubbed (11 tests); needs a Slack app + HTTPS tunnel for the live run |
| Slack message the moment a sender's limit is hit | ≡ƒƒ¿ | One formatted message per sender per window, sent from its own queue with retries. Same live-run caveat |
| Not connected ΓåÆ no notification, no crash; connect later ΓåÆ works without redeploy | Γ£à | Tested: skipped cleanly when disconnected; reconnect takes effect immediately; a revoked webhook shows "Needs reconnect" |
| Behaviour with 1,000+ emails at the same time | Γ£à | Documented in README and demonstrated with `npm run demo -w @ri/api -- load` |

### Hard constraints

| Constraint | Status | How it's met |
|---|---|---|
| No cron (OS or Node libraries) | Γ£à | None used; CI check enforces it |
| Scheduling via BullMQ delayed jobs | Γ£à | Yes |
| Persistent: future emails still send after restart; nothing re-sent or restarted from day 1 | Γ£à | Verified in 4 restart/crash drills |
| Same email never sent more than once (idempotency) | Γ£à | Four layers: `jobId = emailId`; a conditional database claim only one worker can win; request `Idempotency-Key`; deterministic `Message-ID` per email. An email interrupted mid-send by a crash is marked failed rather than risk a duplicate |

### Frontend

| Requirement | Status | How it's met |
|---|---|---|
| Match the Figma | ≡ƒƒ¿ | Rebuilt from the owner's Figma screenshots (login, Scheduled, Sent, email view, Compose + Send Later). The Figma URL couldn't be opened by our tooling, so there has been no pixel-level overlay; the rich-text toolbar, attachments and archive icons in the frames are not built |
| Real Google OAuth, redirect to dashboard | ≡ƒƒ¿ | Passport Google strategy with CSRF state cookie; needs `GOOGLE_CLIENT_ID/SECRET` for a live login. Email + password sign-in also exists (Figma shows it) and lands on the dashboard too |
| Name, email, avatar; logout | Γ£à | The Figma account card at the top of the sidebar (avatar with initials fallback) with a Log out menu; a compact header on phones |
| Scheduled Emails and Sent Emails tabs; "Compose New Email" button | Γ£à | Yes |
| Compose: subject, body, CSV/text upload with count, start time, delay, hourly limit, Schedule | Γ£à | Yes ΓÇö plus a detailed upload report (valid / invalid / duplicates) |
| Scheduled table: email, subject, scheduled time, status; loading and empty states | Γ£à | Yes (skeleton rows, empty state with a call to action) |
| Sent table: email, subject, sent time, status (sent/failed); loading and empty states | Γ£à | Yes (failed rows show the error) |
| Clean structure, reusable components, DRY, typed API/props, loading/empty/error/toasts | Γ£à | One shared table component for both tabs; a shared zod schema package validates API responses at runtime; toasts for every action |

### Submission

| Item | Status |
|---|---|
| Private GitHub repository | Γ£à `anushkaanair/reachinbox-email-scheduler` |
| Access for `Mitrajit` and `Yadav036` | Γ¼£ Owner to send invites |
| README: run backend, run frontend, Ethereal + env setup, architecture (scheduling, persistence, rate limiting, concurrency), features mapped to backend/frontend | Γ£à |
| Demo video Γëñ 5 min (create, dashboard, restart, bonus load) | Γ¼£ Script ready in `docs/DEMO_SCRIPT.md` |
| Assumptions, shortcuts, trade-offs | Γ£à README section and 2.4 below |

---

## 2.2 Everything we built beyond the brief

### Live dashboard
1. **Live updates** ΓÇö rows change status and counters update without refreshing (Server-Sent Events over Redis pub/sub, per user).
2. **In-app limit alerts** ΓÇö a toast the moment a sender hits its limit, with the resume time.
3. **"Resumes at" badges** ΓÇö deferred emails show when they'll send; "Paused" when their campaign is paused.
4. **System health indicator** ΓÇö Postgres, Redis, Elasticsearch and live-connection status, with a link to Bull Board.

### Campaigns and emails
5. **Campaigns page** ΓÇö live progress bars per campaign; Pause, Resume and Cancel (pausing keeps each email's place in line).
6. **Email detail drawer** ΓÇö full email, Message-ID, Ethereal link and a status timeline (scheduled ΓåÆ deferred ΓåÆ sent).
7. **Retry failed** ΓÇö one email, or all failed emails in a campaign.
8. **Cancel one email.**
9. **CSV export** of any list (safe against spreadsheet formula injection).
10. **Search with highlights**, typo-tolerant fallback, `/` shortcut, and a database fallback when Elasticsearch is down.

### Composing
11. **Merge tags** ΓÇö `{{name}}`, `{{company}}` and any CSV column, click to insert.
12. **Upload report** ΓÇö valid, invalid and duplicate leads counted and shown before scheduling.
13. **Live preview + test send** ΓÇö the exact email each recipient gets, warnings when a merge tag would be blank for some leads, and one real test email to a sender inbox.
14. **Send forecast** ΓÇö a window-by-window chart of when the emails will actually go out under your limits, before scheduling.
15. **Do-not-contact list** ΓÇö addresses on it are always skipped; optional "skip anyone emailed in the last N days".
16. **Business-hours window** ΓÇö only send between chosen hours in a time zone, weekdays only if wanted.
17. **Spam check** ΓÇö a live 0ΓÇô100 content score with one-click plainer replacements.
18. **Spintax** ΓÇö `{Hi|Hello|Hey}` gives each recipient one variant; the same recipient always gets the same one.
19. **Send jitter** ΓÇö randomise the gaps between emails (┬▒10/25/50%) so the cadence looks human; the per-sender minimum still holds.

### Senders
20. **Sender health** ΓÇö a 0ΓÇô100 score per mailbox with the reasons (failures, bounces, repeated errors), plus usage this hour and today.
21. **Warm-up ramp** ΓÇö a per-sender daily cap that grows each day until full volume, enforced atomically in Redis.
22. **Automatic pause (circuit breaker)** ΓÇö after repeated failures, or immediately on a login error, a sender pauses; its emails wait instead of failing; a toast and a Slack message are sent. Verified against real Ethereal with a deliberately wrong password.
23. **Hard-bounce handling** ΓÇö permanent rejections fail at once (no wasted retries) and the address is added to the do-not-contact list.

### Analytics and assistant
24. **Analytics page** ΓÇö sent / failed / deferred / pending / delivery-rate tiles, an hourly chart (with a table view) and per-sender quota meters.
25. **Ask Inbox assistant** ΓÇö Cmd+K palette and a docked side panel. Answers questions from your own data ("how many failed today?", "which sender is closest to its limit?") and carries out commands ("pause the northwind campaign") **only after you press Confirm**. Works offline with no API key; every change is audited.

### Added after the Figma screenshots arrived
32. **Figma-faithful UI** ΓÇö login card, sidebar account card, flat email rows with time pill and star, full-page email view, Compose with Send Later.
33. **Email + password login** ΓÇö scrypt, throttled, one generic failure message; Google sign-in links the account and clears the password.
34. **Email accounts overhaul** ΓÇö connect Google/Microsoft/SMTP (login tested first), CSV import with mapping and per-row report, DNS check, per-account settings, bulk actions, reconnect/acknowledge.
35. **Onboarding, checklist and tour** ΓÇö opt-in; the checklist is computed from real data.
36. **Bounce protection** ΓÇö a campaign pauses itself past a bounce threshold; event-driven, no cron.
37. **Star and filters** on both email lists.

### Experience
26. **Light and dark themes** ΓÇö dark has a "space" backdrop; or follow the system setting.
27. **Accessible** ΓÇö WCAG 2.1 AA, 0 axe violations on every page in both themes; works on phones.

### Engineering and operations
28. **One-command setup** ΓÇö `npm run setup` (env with fresh secrets, Docker, migrations, senders, search index).
29. **Demo tools** ΓÇö `npm run dev:demo` (1-minute "hours"), `npm run demo -w @ri/api -- load | restart | verify | reset`.
30. **Security hardening** ΓÇö secrets encrypted at rest, OAuth codes and cookies kept out of logs, JWT algorithm pinned, request throttling on login/compose/assistant, admin-only queue dashboard option.
31. **CI** ΓÇö lint, typecheck, migrations, all tests against real Postgres/Redis/Elasticsearch, build, dependency audit, no-cron check.

---

## 2.3 Verification (measured on real Ethereal SMTP)

| Scenario | Result |
|---|---|
| Worker killed (`kill -9`) mid-send, then restarted | All pending emails sent on time; 0 duplicates; the 5 emails caught mid-send marked failed rather than risk a duplicate |
| API killed mid-send | Worker kept sending: 30/30, 0 duplicates |
| Redis container restarted mid-send | All delayed jobs survived (AOF); 60/60 sent, 0 duplicates |
| Two workers competing for the same queue | Work split 40/20; 0 duplicates; 500 ms minimum gap held across both |
| Graceful stop (SIGTERM) | In-flight sends finished; nothing left half-sent |
| 1,000 emails due at the same moment | 0 dropped; exactly 4 per sender per 60 s window (demo limits); rest deferred in order; min gap 2,034 ms |
| Warm-up ramp | Day 1 cap 2: 2 sent, 4 deferred to the next day; day 2 cap 4: remaining 4 sent |
| Auto-pause | Wrong SMTP password ΓåÆ Ethereal rejected the login (535) ΓåÆ sender paused immediately; its emails waited as Scheduled |

Details and commands: `docs/VERIFICATION.md`.

---

## 2.4 Assumptions, shortcuts and trade-offs

- **At-most-once on a crash mid-send.** If the worker dies after SMTP accepted a message but before the database recorded it, the email is marked failed (with the reason) rather than re-sent ΓÇö a missed email is safer than a duplicate for cold outreach. It can be retried with one click.
- **Fixed hourly windows** (clock-aligned), not sliding windows: simple and easy to explain ("resumes at 3:00"); a burst can straddle a boundary.
- **Tenant = signed-in user.** Senders are a shared pool; warm-up and resume are admin actions (`ADMIN_EMAILS`).
- **Search is eventually consistent** (~1 s); results always show current status because rows are read back from Postgres. Sending never depends on Elasticsearch.
- **The assistant is rule-based** ("offline mode"): it understands a tested set of phrasings, needs no API key and cannot invent numbers.
- **Heuristics:** sender health and the spam check are explainable heuristics, not provider reputation data or a real spam filter.
- **Forecast is an estimate** and does not model warm-up daily caps.
- **Demo mode** shrinks the hour to 60 s (and a warm-up "day" to 2 min) so limits are visible on video; the UI still says "hourly".
- **Local Slack needs an HTTPS tunnel** (cloudflared) because Slack only redirects to HTTPS.

---

## 2.5 How to review it

```bash
npm install
npm run setup      # env, Docker services, migrations, 3 Ethereal senders, search index
npm run dev        # API :4000 ┬╖ worker ┬╖ web :5173   (or: npm run dev:demo for 1-minute hours)
npm test           # 447 tests
```

- Queue dashboard: `http://localhost:4000/admin/queues`
- Restart scenario: `npm run demo -w @ri/api -- restart`, then stop and start `npm run dev`, then `npm run demo -w @ri/api -- verify <campaignId>`
- Load scenario: `npm run demo -w @ri/api -- load`
- Architecture, setup for Google/Slack, and every setting: `README.md`
