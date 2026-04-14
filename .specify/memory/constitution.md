<!--
  ═══════════════════════════════════════════════════════════════
  SYNC IMPACT REPORT
  ═══════════════════════════════════════════════════════════════
  Version change: 0.0.0 → 1.0.0
  Bump rationale: MAJOR — initial ratification of the global
                  monorepo constitution. First version; no prior
                  global governance existed.

  Modified principles: N/A (initial version)

  Added sections:
    - I. Monorepo Structure & Boundary Discipline
    - II. API-Contract Integrity (NON-NEGOTIABLE)
    - III. Environment Separation (Dev / Prod)
    - IV. Authentication & Security
    - V. Internationalization & Locale Awareness
    - VI. Schema & Migration Discipline
    - VII. Telephony & Webhook Reliability
    - VIII. Documentation-Driven Development
    - IX. Simplicity & Incremental Delivery
    - Repository Structure & Tech Stack
    - Cross-Cutting Constraints
    - Development Workflow & Quality Gates
    - Governance

  Removed sections: N/A (initial version)

  Templates requiring updates:
    - .specify/templates/plan-template.md       ✅ aligned (generic)
    - .specify/templates/spec-template.md       ✅ aligned (generic)
    - .specify/templates/tasks-template.md      ✅ aligned (generic)
    - .specify/templates/checklist-template.md  ✅ aligned (generic)
    - .specify/extensions/git/commands/*.md     ✅ no outdated references

  Follow-up TODOs: None
  ═══════════════════════════════════════════════════════════════
-->

# Voicely CRM — Project Constitution

## Core Principles

### I. Monorepo Structure & Boundary Discipline

The repository MUST contain exactly two top-level application directories:

| Directory | Role |
|---|---|
| `Voice-transcript/` | Backend — FastAPI (Python) API server |
| `Frontend-voice/` | Frontend — Angular 20 SPA |

Each directory is an independent deployable unit with its own dependencies,
build tooling, and sub-constitution (`.specify/memory/constitution.md`).
Cross-directory imports are prohibited — the **only** coupling point between
frontend and backend is the HTTP API contract (see Principle II).

Rules:
- A commit that changes backend API shape (endpoints, request/response models,
  status codes) MUST include the corresponding frontend model and service
  updates **in the same commit**.
- Shared configuration (CI/CD, repo-level linting, Git hooks) lives at the
  repository root. Application-specific config MUST live inside its own
  directory.
- Each sub-project MAY maintain its own `.specify/` directory for
  project-scoped specs and memory. The root `.specify/` governs global
  workflow, hooks, and this constitution.

**Rationale:** A single repository ensures atomic cross-stack commits, unified
PR reviews, and a single source of truth for feature branches — while strict
directory boundaries prevent accidental coupling.

### II. API-Contract Integrity (NON-NEGOTIABLE)

The backend FastAPI interactive docs (`/docs`) and the Pydantic/SQLModel
schemas in `Voice-transcript/` are the **single source of truth** for all API
contracts. The frontend TypeScript interfaces in `*.models.ts` files MUST
mirror backend field names, types, and nullability exactly.

When any endpoint is added, removed, renamed, or its request/response shape
changes, **all** of the following MUST be updated in the same commit or PR:
1. Backend route handler and Pydantic model (`Voice-transcript/app/`).
2. Frontend TypeScript interface (`Frontend-voice/src/app/services/<domain>/*.models.ts`).
3. Frontend service method (`*.service.ts`) — URL, HTTP verb, and payload.
4. OpenAPI schema verification — confirm `/docs` reflects the change after
   backend restart.

A discrepancy between the backend's actual responses and the frontend's
TypeScript models is a defect.

**Rationale:** In a monorepo the contract boundary is the HTTP API. Keeping
both sides in sync within a single atomic commit eliminates integration drift.

### III. Environment Separation (Dev / Prod)

Both backend and frontend MUST support distinct configuration profiles for
development and production. Environment-specific behaviour MUST be driven by
explicit configuration — not ad-hoc conditionals scattered through code.

**Backend** (`Voice-transcript/`):
- CORS: dev MAY allow `*`; prod MUST restrict to an explicit allowlist.
- Debug: dev MAY enable `--reload`, verbose SQL, `/docs`; prod MUST disable
  reload, suppress SQL echo, and SHOULD restrict `/docs`.
- Secrets: dev MAY use `.env`; prod MUST source secrets from a secure
  provider. A `.env` file MUST NOT exist on production servers.
- Database: dev and prod MUST use separate connection strings.
- Webhook `BASE_URL`: MUST resolve to the correct public hostname per
  environment (ngrok in dev, production domain in prod).
- Logging: dev MAY log DEBUG to stdout; prod MUST log structured JSON at
  INFO or above.

**Frontend** (`Frontend-voice/`):
- `environment.ts` (dev): `production: false`, `apiUrl: '/api/v1'` via proxy.
- `environment.prod.ts` (prod): `production: true`, explicit production API
  URL.
- `proxy.conf.json` is dev-only — MUST NOT be bundled in production builds.
- When adding a new config property, it MUST be added to **both** environment
  files in the same commit.

**Rationale:** Mismatched environment config is a top source of production
incidents. Explicit separation makes misconfiguration visible at review time.

### IV. Authentication & Security

The project uses JWT Bearer authentication (access + refresh token pattern).
Rules that apply **across the full stack**:

- **Backend**: Every protected endpoint MUST depend on `get_current_user`
  (JWT validation). Role checks (`require_admin`) MUST be enforced at the
  dependency level, not inside service logic. Access tokens expire in 15 min;
  refresh tokens in 7 days.
- **Frontend**: All `/dashboard/**` routes MUST be guarded by `authGuard`.
  The `authInterceptor` MUST attach Bearer tokens and auto-refresh on 401
  (except `/auth/refresh` itself). Tokens MUST be stored in `localStorage`.
  Sign-out MUST clear all tokens and redirect to `/authentication/sign-in`.
- **Multi-tenant isolation**: Every backend database query on user-owned data
  MUST scope to `current_user.org_id`. Cross-organisation data leakage is
  prohibited.

**Rationale:** Auth is the single highest-risk cross-cutting concern. Both
sides MUST enforce it consistently to prevent unauthorized access.

### V. Internationalization & Locale Awareness

**Frontend i18n:**
- All user-facing text MUST use `@ngx-translate/core` translation keys —
  never hardcoded strings.
- Translation files (`public/i18n/en.json`, `he.json`, `ar.json`) MUST be
  updated in the same commit as any UI text change.
- Keys follow `<SECTION>.<KEY_NAME>` convention.
- Hebrew (`he`) is the primary user-facing language; English (`en`) is the
  developer reference; Arabic (`ar`) MUST be maintained at parity.

**Backend locale rules:**
- All phone numbers MUST be normalised to E.164 Israeli format
  (`+972XXXXXXXXX`) at the service boundary before persistence or dialling.
- Date/time comparisons that are user-visible (follow-ups, daily counts)
  MUST use `Asia/Jerusalem` via `zoneinfo.ZoneInfo`.
- Dashboard stats use Israel time (UTC+2/+3); the backend handles timezone
  conversion — the frontend MUST NOT apply additional offsets.

**Rationale:** The product targets Israeli sales teams operating in Hebrew
and Arabic. Consistent locale handling across the stack prevents data
corruption and UX degradation.

### VI. Schema & Migration Discipline

Every structural database change (new table, column, index, drop) MUST be
captured in an Alembic migration generated via
`alembic revision --autogenerate`. Migrations MUST be applied with
`alembic upgrade head` before the server starts in any environment. Migration
files MUST be committed alongside the model change that prompted them.
Hotfixes that alter the schema outside Alembic are prohibited.

**Rationale:** Untracked schema changes cause silent data loss or deployment
failures. Alembic is the single migration authority.

### VII. Telephony & Webhook Reliability

All Twilio webhook handlers MUST be idempotent — receiving the same webhook
twice MUST NOT duplicate records or trigger double side-effects. The Roll
calling engine (`roll_service`) MUST enforce cooldown logic, per-lead
max-call limits, and follow-up date checks before firing any call. Webhook
endpoints MUST return valid TwiML or HTTP 200 within Twilio's timeout;
long-running work (transcription, LLM analysis) MUST be dispatched as
FastAPI `BackgroundTasks`.

Frontend telephony (`@twilio/voice-sdk`):
- Browser calls use the Twilio Voice SDK conference model.
- Real-time features (roll status) MUST poll at 3–5 second intervals.
- Polling MUST stop on component destroy and on error.

**Rationale:** Telephony is revenue-critical. Duplicate calls or missed
webhooks directly impact sales operations and customer trust.

### VIII. Documentation-Driven Development

Every new feature or endpoint integration MUST have a corresponding spec
created via the speckit workflow (`.specify/templates/spec-template.md`)
**before** implementation begins. Specs MUST include: backend endpoints,
TypeScript types, service methods, UI changes, i18n keys, file change
summary, edge cases, and implementation order. The spec is the
implementation contract — deviations require spec amendment first.

Backend-specific: inline docstrings, OpenAPI annotations, and `README.md`
serve as runtime API documentation. Changes to endpoints MUST update these
in the same PR (see Principle II).

**Rationale:** Without specs it is impossible to distinguish intentional
customisations from template artifacts (frontend) or undocumented API
behaviour (backend).

### IX. Simplicity & Incremental Delivery

New features MUST be implemented incrementally, one user story at a time,
each independently testable. YAGNI applies: do not add infrastructure,
abstractions, or services not required by a current spec. Unused template
components (frontend Trezo artifacts) MUST NOT be modified or extended.

**Rationale:** Scope discipline keeps the active feature surface small and
prevents accidental coupling with unused code.

## Repository Structure & Tech Stack

```
RS-call/                          ← Repository root
├── .specify/                     ← Global speckit config & memory
│   ├── memory/constitution.md    ← THIS FILE (global constitution)
│   ├── templates/                ← Speckit templates
│   └── extensions/               ← Git hooks, extensions
├── .github/                      ← CI/CD, PR templates, Actions
├── Frontend-voice/               ← Angular 20 SPA
│   ├── .specify/                 ← Frontend-scoped specs & constitution
│   ├── src/app/                  ← Application source
│   ├── public/i18n/              ← Translation files
│   ├── angular.json              ← Build config
│   └── package.json              ← npm dependencies
└── Voice-transcript/             ← FastAPI backend
    ├── .specify/                 ← Backend-scoped specs & constitution
    ├── app/                      ← Application source
    │   ├── api/v1/               ← Route handlers (thin)
    │   ├── services/             ← Business logic
    │   ├── models/               ← SQLModel / Pydantic schemas
    │   └── integrations/         ← Twilio, AWS, Groq
    ├── alembic/                  ← Database migrations
    └── requirements.txt          ← Python dependencies
```

### Tech Stack Summary

| Layer | Backend (`Voice-transcript/`) | Frontend (`Frontend-voice/`) |
|---|---|---|
| **Language** | Python 3.10+ | TypeScript ~5.8 (strict) |
| **Framework** | FastAPI (async) | Angular 20 (standalone components) |
| **ORM / HTTP** | SQLModel + SQLAlchemy (asyncpg) | Angular HttpClient |
| **Database** | PostgreSQL (Alembic migrations) | — |
| **Telephony** | Twilio REST API + Voice SDK | @twilio/voice-sdk v2.18.x |
| **Storage** | AWS S3 (MP3 recordings) | — |
| **Transcription** | AWS Transcribe (`he-IL`) | — |
| **AI / LLM** | Groq API (Hebrew structured output) | — |
| **Auth** | JWT (15 min access / 7 day refresh) | JWT (Bearer, auto-refresh) |
| **Styling** | — | TailwindCSS 4.x + SCSS |
| **i18n** | — | @ngx-translate/core (en, he, ar) |
| **UI Base** | — | Trezo v4.1.0 admin template |
| **Charts** | — | ApexCharts (ng-apexcharts) |
| **Config** | pydantic-settings (.env) | Angular environments |
| **Build** | uvicorn | Angular CLI (`ng serve/build`) |
| **Package Mgr** | pip (requirements.txt) | npm (package.json) |

## Cross-Cutting Constraints

- **API prefix**: All API calls MUST go through `/api/v1` — no direct
  backend URLs in frontend service code.
- **Phone numbers**: E.164 format (`+972XXXXXXXXX`) enforced at the service
  boundary (backend) and before any API call (frontend).
- **Timezone**: Israel time (`Asia/Jerusalem`) for all user-visible dates.
  Backend owns conversion; frontend MUST NOT apply additional offsets.
- **Bundle size**: Frontend initial bundle MUST NOT exceed 5 MB warning /
  10 MB error (enforced in `angular.json` budgets).
- **Polling**: Real-time features poll at 3–5 s; polling MUST stop on
  component destroy and on error.
- **Hebrew JSON**: Backend uses custom `HebrewJSON` SQLAlchemy type with
  `ensure_ascii=False` on all JSON fields.
- **No secrets in source**: Neither `.env` values nor API keys MUST appear
  in committed source code. Prod secrets MUST be injected at deploy time.
- **Standalone components**: Frontend MUST use Angular standalone components
  (`standalone: true`). New `NgModule` creation is prohibited.
- **Service-layer separation**: Backend business logic MUST live in
  `app/services/`; route handlers are thin orchestrators.
- **Service-per-domain**: Frontend MUST maintain one service + models file
  pair per backend domain under `src/app/services/<domain>/`.

## Development Workflow & Quality Gates

### Branch Strategy

- Feature work MUST happen on a dedicated branch (`<id>-feature-name`).
- Commits MUST follow conventional format: `feat:`, `fix:`, `docs:`,
  `refactor:`, `chore:`.
- The `speckit.git.feature` hook creates feature branches automatically.

### Pre-Implementation Gates

1. **Spec exists**: A feature spec MUST be approved before code changes.
2. **Types / models first**: Backend Pydantic models and frontend TypeScript
   interfaces MUST be defined before service methods or component logic.
3. **Service before UI**: Backend service methods and frontend HTTP service
   wrappers MUST be implemented before wiring into route handlers or
   components.
4. **Migration with model**: Any SQLModel change affecting table schema MUST
   include the Alembic migration in the same commit.

### Quality Checklist (per feature)

**Cross-stack:**
- [ ] API contract matches on both sides (Principle II)
- [ ] Environment config updated in both backend and frontend if needed
- [ ] Phone numbers normalised to E.164
- [ ] Feature spec exists and is up to date

**Frontend:**
- [ ] All user-facing strings use `@ngx-translate` keys
- [ ] All 3 language files (`en.json`, `he.json`, `ar.json`) updated
- [ ] New routes protected by `authGuard` (if under `/dashboard`)
- [ ] `ng build --configuration production` succeeds with no errors
- [ ] No `console.log` statements in committed code
- [ ] Subscriptions cleaned up (`ngOnDestroy` / `takeUntil` / `DestroyRef`)

**Backend:**
- [ ] Alembic migration included for schema changes
- [ ] Endpoint documented in OpenAPI (`/docs` reflects change)
- [ ] Background tasks used for long-running webhook work
- [ ] Multi-tenant scoping verified (`org_id` filter)

### Documentation Updates

When any API-touching code changes:
1. Update backend Pydantic models and OpenAPI annotations.
2. Update frontend `*.models.ts` and `*.service.ts` files.
3. Update the relevant feature spec (if behaviour changed).
4. Update i18n files (if user-facing text changed).

## Governance

This constitution is the **highest-authority document** for the Voicely CRM
monorepo. It governs cross-stack concerns and the relationship between the
frontend and backend sub-projects. Each sub-project's own constitution
(`.specify/memory/constitution.md` inside `Frontend-voice/` and
`Voice-transcript/`) provides additional project-scoped rules that MUST NOT
contradict this global constitution. In case of conflict, this document
takes precedence.

### Constitution Hierarchy

```
Global (this file)          ← Monorepo-wide rules
├── Frontend-voice/.specify/memory/constitution.md
└── Voice-transcript/.specify/memory/constitution.md
```

Sub-constitutions MAY add stricter rules but MUST NOT relax global
principles.

### Amendment Process

1. Propose the change with rationale (in a commit or discussion).
2. Update this constitution file with the new or modified principle.
3. Increment the version following semantic versioning:
   - **MAJOR**: Principle removed or fundamentally redefined.
   - **MINOR**: New principle added or existing principle materially expanded.
   - **PATCH**: Clarification, typo fix, or non-semantic wording improvement.
4. Update `LAST_AMENDED_DATE` to the date of the change.
5. Verify sub-constitutions still align (no contradictions).
6. Run the consistency propagation checklist (templates, specs, extensions).

### Compliance

- Every PR / code review MUST verify compliance with these principles.
- Deviations MUST be justified in the PR description with a reference to
  the principle being waived and the reason.
- Use the backend FastAPI docs (`/docs`), feature specs, and
  sub-constitutions as runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-04-11 | **Last Amended**: 2026-04-11
