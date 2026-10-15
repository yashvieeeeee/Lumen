# Local development

The application has a product landing page at `/`, account access and writing/history/privacy at `/workspace`, and direct sign-in at `/workspace?mode=signin`. Local engineering checks use synthetic data. Accounts, ownership, consent, journal/chat receipts and shared draft entry checks are implemented; language input labels and rule results are not clinical qualification. Providers, supportive generation, reviewer sharing and participant studies remain pending in the [task audit](PLAN_AUDIT.md).

## Verified toolchain

Windows / PowerShell 7, Node 22.16.0, npm 10.9.2, Python 3.13.14, Next.js 16.4.0, React 19.3.0 and TypeScript 5.9.3. Exact transitive JavaScript and Python dependencies are in `apps/web/package-lock.json` and `services/api/uv.lock`. Python API dependencies require a project virtual environment; the Phase 1 evaluator remains standard-library-only.

This machine has PostgreSQL **18.3** binaries at `C:\Program Files\PostgreSQL\18\bin`. A separate Lumen cluster runs at `127.0.0.1:55432`, with files under the ignored `.tools/pg-data` directory. The existing PostgreSQL service and its databases are untouched. Docker Desktop could not start because of its inference socket error, so it is not required for this local setup. Update the PostgreSQL installation to a current supported patch before any hosted or personal-data use; the [PostgreSQL version policy](https://www.postgresql.org/support/versioning/) and [Windows downloads](https://www.postgresql.org/download/windows/) identify supported distributions.

## First setup

From `D:\Cooking stuff\Lumen` in PowerShell 7:

```powershell
uv python install 3.13.14 --install-dir .tools/python --no-bin --no-registry
pwsh -NoProfile -File scripts/setup-local.ps1
```

Setup generates random local database passwords and a keyed receipt digest secret in `.env.local`; it never prints them. It restricts credentials, database files, local logs and tool files to the current Windows account. It initializes SCRAM authentication, a dedicated `lumen` database and a `lumen_test` database. `lumen_admin` owns migrations; `lumen_app` has table CRUD, no DDL, no superuser and no RLS-bypass privilege. Setup does not reset existing databases. Use it only for this project-owned cluster.

Then install and build the web application:

```powershell
Set-Location 'D:\Cooking stuff\Lumen\apps\web'
npm ci
npm run build
Set-Location 'D:\Cooking stuff\Lumen'
pwsh -NoProfile -File scripts/start-local.ps1
```

Open [the landing page](http://localhost:3180), then [the workspace](http://localhost:3180/workspace). Use **localhost**, matching the configured browser origin. For checks, create a synthetic account with an example.com email and a password of at least12 characters. Adult eligibility and the processing/saving notice are required. Email verification and password recovery are intentionally not exposed until an actual delivery service is configured. Avoid personal content and passwords reused elsewhere.

The **Sign in** screen also offers **Explore demo**, using randomly generated credentials displayed below the form. Adult/privacy confirmation is required before the existing registration and cookie-login endpoints run. No account is created by visiting the page. Each account starts with saving off and a sample draft; sample text is not submitted automatically. Credentials live only in page memory, so a reload generates new demo details without changing an existing signed-in session. Demo accounts use the same privacy/export/deletion controls as other accounts and persist until deleted; they do not expire automatically. Registration and login failures can be retried with the displayed credentials. `tests/demo.spec.ts` intercepts API calls to check confirmation, retry, unique credentials and motion preferences across browsers; the real demo journey in `tests/workspace.spec.ts` checks the database-backed flow and deletes its test account.

Motion uses GSAP 3.15 with ScrollTrigger for landing-page reveals and bounded decorative parallax. Workspace entrances, card sequences, mood feedback, theme controls, notifications, disclosures and pointer/keyboard feedback share the browser's reduced-motion preference, including changes during an animation. Animations never delay session invalidation or privacy actions; focusing an editor settles its panel immediately. Native scrolling remains in control. `tests/motion.spec.ts` checks computed animation frames, interruption, cleanup, keyboard focus, mobile navigation and reduced motion with synthetic API responses.

Start uses hidden processes; their IDs are recorded in `.tools/processes.json`. It refuses to replace occupied ports. For interactive development, use two terminals instead:

```powershell
# Terminal 1, services/api
uv run python -m uvicorn lumen_api.main:app --app-dir ../.. --host 127.0.0.1 --port 8060 --no-access-log --log-level critical

# Terminal 2, apps/web
npm run dev
```

Keep the documented API logging flags. They suppress framework exception traces that can include SQL parameters. Database statement/parameter logging is disabled by setup. No ordinary application log records submitted text, passwords or cookies. Error responses are bounded and validation errors do not echo input. This local configuration has deliberately minimal diagnostics; restricted, redacted operational telemetry is a later deployment dependency.

To stop processes started by `start-local.ps1`, use the printed/recorded process IDs after confirming they still belong to Lumen. To stop only the project database:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D 'D:\Cooking stuff\Lumen\.tools\pg-data' -w stop
```

## Reproducible checks

With the built application and API running, Google Chrome installed, and the Playwright Firefox/WebKit runtimes installed:

```powershell
# Once, from apps/web; downloads only test-browser runtimes.
node node_modules/playwright/cli.js install firefox webkit
```

```powershell
pwsh -NoProfile -File scripts/check-local.ps1
```

The Python integration suite migrates **only `lumen_test`**. It rejects a configuration outside the named local application database before deriving the test URL. The browser suite exercises `lumen` with generated synthetic accounts and deletes successful test accounts; interrupted/failed runs can leave synthetic accounts. Do not run it against participant data. Browser artifacts and exports stay in the ignored `artifacts/runs/phase2-browser` folder. Initial failure traces contain only authored sample data and are not release evidence.

The `chrome` project runs database-backed journeys, mocked workspace checks and public landing/support checks. `firefox-ui` and `webkit-ui` run the UI/public suites with all API requests intercepted. Serial database journeys start at least 15 seconds apart to stay within the loopback API's shared 60-mutations/minute limit; the runtime limit is not relaxed for testing. Screenshots go to ignored `artifacts/runs/ui-refinement` and `artifacts/runs/landing-page`. Run UI/public suites with `node node_modules/playwright/cli.js test tests/ui.spec.ts tests/landing.spec.ts`. The viewport matrix covers320,390,768 and1440px; physical keyboards/safe areas and assistive technology remain device QA. WebKit skip links use explicit focus because link traversal depends on platform preferences; Chrome/Firefox also test first-Tab access.

`uv run pytest --cov=lumen_api --cov-branch -q` from `services/api` measures Python behavior. Coverage is configured for SQLAlchemy's greenlet context switches; without that setting, async code after a database await is undercounted. `npm run build` performs the optimized Next.js build and TypeScript check. `npm audit` and `uv run pip-audit --progress-spinner off` query dependency advisories; their clean result is a dated check, not proof that no vulnerability exists.

## Contracts and privacy limits

- The web route is a fixed allowlist proxy to the private API. HttpOnly, SameSite=Strict cookies carry opaque, database-backed one-hour sessions; logout deletes the token. Secure cookies and HTTPS are required when `DEVELOPMENT=false`. HTTP cookies are an explicit localhost exception in `.env.local`. No tokens or drafts use localStorage.
- Unsafe requests require the exact configured Origin, including login and registration. Both web and API cap bodies at 64 KiB; entries cap text at 10,000 characters. JSON duplicate keys and unrecognized schema fields are rejected. The API has a bounded single-process rate limiter. All users behind this local proxy share its loopback request budget; replace it with a trusted proxy/shared limiter before multiuser hosting.
- Personal API requests include `X-Lumen-Account`, which must match cookie-authenticated identity. This is a consistency guard against a shared browser cookie changing accounts between tabs; it never grants access. History also identifies its owner. Client epochs discard delayed responses after invalidation. Broadcast and focus checks remove stale session/consent content.
- Events use immutable UUIDs, per-account server sequence numbers, keyed creation-payload digests and UUID idempotency keys. Row locks serialize writes and consent changes. A stale consent revision returns409. A creation retry returns the current receipt, including an edited/deleted state, without rescreening or restoring content. Legacy no-mood payload serialization remains compatible. Owner filters and transaction-local FORCE RLS protect the personal tables; authentication tables must be available before identity is known.
- `PATCH /events/{id}` edits saved journals only, using text/locale/optional integer mood 1–5, `expected_revision` and `expected_consent_revision`. It rescreens through the shared path and increments revision; source, sequence, submission/authored time and creation digest remain immutable. A retry of an acknowledged identical edit returns its current receipt without rescreening; a competing stale edit returns409. The client distinguishes an unacknowledged mutation from a confirmed mutation whose subsequent view refresh failed.
- Migration 0003 adds journal mood, revision and updated timestamp. Database constraints require positive revisions and restrict retained mood to saved journal entries. `GET /moods?start=...&end=...` requires aware timestamps and a positive interval no longer than32days; it returns at most 1000 owned points, with an explicit truncation flag. The mobile14-day view uses local-calendar submission days, the latest rating per day, and gaps for missing observations. Mood is voluntary self-report and is not fed into the rule screen.
- Both sources call the same versioned rule baseline. Results include status/action/reason, policy and baseline hashes, rule IDs and at most50 evidence spans. Coordinates are NFKC/casefold/space-normalized Unicode codepoints, not original-text indices. The policy is pinned for the process lifetime; restart after a reviewed version change. `DEVELOPMENT=false` disables this unreviewed policy with explicit unavailable/null action. Checker/configuration faults return unavailable; database/connection faults return sanitized503 with no confirmed receipt.
- Saving defaults off. Unsaved text/check/mood are not retained; historical/retried unsaved receipts have no check or rating. Database constraints tie retained checks/ratings to saved content. Withdrawal and entry deletion clear text/check/mood together; tombstones prevent recreation, and account deletion cascades personal records. The client reconciles fresh receipt/consent state before showing a check and scrubs private state on acknowledged privacy changes or cross-tab invalidation. Deletion removes live values; it does not guarantee immediate erasure from PostgreSQL files/WAL or downloaded exports. Expiry/backup/restore controls remain pending.
- `/support` uses a versioned static resource registry and dynamic server rendering, with no API/account requirement. India is manually opened; language does not select geography. Telephone links require active, currently dated entries; expired/disabled contacts fall back to official source pages. No entries, account IDs or locale parameters are sent to those links. This directory is not a service backend integration or clinical guidance. Source checks and pending operational verification are recorded in [the review packet](review/REVIEW_PACKET.md).
- Personal memory, reviewer sharing, model generation and research collection are not enabled. Source/language choices invoke the draft policy, whose known synthetic errors remain in the evaluator report. Whole-response guards and clinical/bilingual review remain later gates; AI connection is deferred by the owner.

This milestone verifies local engineering boundaries. It does not establish production hardening, clinical effectiveness, public readiness, a staffed referral service or novelty.
