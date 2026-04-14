<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.1.1
Bump rationale: PATCH — monorepo consolidation. Removed redundant
  .specify/ scaffolding (templates, extensions, scripts, integrations),
  .github/, and .vscode/ from this sub-project. These now live at the
  monorepo root only. Added global constitution hierarchy reference
  to Governance section.

Modified principles: None (content unchanged)

Modified sections:
  - Governance — added "Constitution Hierarchy" subsection referencing
    the global constitution at the monorepo root

Removed files (moved to monorepo root):
  - Voice-transcript/.specify/templates/*
  - Voice-transcript/.specify/extensions/*
  - Voice-transcript/.specify/scripts/*
  - Voice-transcript/.specify/integrations/*
  - Voice-transcript/.specify/extensions.yml
  - Voice-transcript/.specify/init-options.json
  - Voice-transcript/.specify/integration.json
  - Voice-transcript/.github/*
  - Voice-transcript/.vscode/* (Python settings merged into root)

Previous report (1.0.0 → 1.1.0):
  Modified principles:
    - I. API-Contract Integrity (removed external doc references)
  Added sections:
    - Principle VI. Environment Separation (dev vs. prod)
  Removed sections:
    - All references to BACKEND_DOCS.md, BACKEND_TIMELINE.md, FRONTEND_INTEGRATION.md
    (files scheduled for deletion; constitution must not depend on them)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — no constitution references to update
  ✅ .specify/templates/spec-template.md — no constitution references to update
  ✅ .specify/templates/tasks-template.md — env-separation tasks may appear in future specs
  ✅ .specify/templates/agent-file-template.md — no changes needed
Deferred TODOs:
  - RATIFICATION_DATE kept as 2026-04-11
  - Environment separation is codified as a principle but not yet implemented in code;
    implementation tracked separately.
-->

# Voicely CRM Constitution

## Core Principles

### I. API-Contract Integrity (NON-NEGOTIABLE)

Every backend endpoint MUST have a clearly defined request/response contract.
When an endpoint is added, removed, renamed, or its request/response shape
changes, the corresponding API documentation (e.g., OpenAPI/Swagger auto-docs
at `/docs`, inline docstrings, or any future contract files) MUST be updated in
the same commit or PR. A change to any endpoint, model field, or status enum
that lacks matching documentation is considered an incomplete change and MUST NOT
be merged.

Checklist enforced on every API change:
- Add or remove the endpoint entry in the relevant documentation.
- Update request body and response examples if shapes changed.
- Update field reference tables for new or modified fields.
- Update data model references if new types or enums were introduced.
- Verify OpenAPI schema at `/docs` reflects the change after restart.

### II. Service-Layer Separation

Business logic MUST live exclusively in `app/services/`. FastAPI route handlers
in `app/api/v1/` are thin orchestrators: they validate input via Pydantic,
call one or more service methods, and return the response. Database queries,
telephony calls, S3 operations, and LLM calls MUST NOT be placed directly inside
route handlers. Each service module owns exactly one domain
(e.g., `call_service`, `lead_service`, `roll_service`).

### III. Multi-Tenant Data Isolation

Every database query that reads or writes user-owned data MUST scope itself to
`current_user.org_id`. No cross-organisation data leakage is acceptable.
The `get_current_user` dependency (JWT validation) MUST be applied to every
protected route. Role-based checks (`require_admin`) MUST be enforced at the
dependency level, not inside service logic.

### IV. Telephony & Webhook Reliability

All Twilio webhook handlers MUST be idempotent — receiving the same webhook
twice MUST NOT duplicate records or trigger duplicate side-effects such as
double-starting a transcription job. The Roll calling engine (`roll_service`)
MUST apply cooldown logic, per-lead max-call limits, and follow-up date checks
before firing any call. Webhook endpoints MUST return a valid TwiML or HTTP 200
response within Twilio's timeout window; long-running work (transcription polling,
LLM analysis) MUST be dispatched as FastAPI `BackgroundTasks`.

### V. Schema Migration Discipline

Every structural database change (new table, new column, dropped column, new index)
MUST be captured in an Alembic migration file generated via
`alembic revision --autogenerate`. Migrations MUST be applied with
`alembic upgrade head` before the server starts in any environment. Hotfixes
that alter the schema by any means other than Alembic are prohibited.
Migration files MUST be committed alongside the model change that prompted them.

### VI. Environment Separation (Dev / Prod)

The application MUST support distinct configuration profiles for development and
production environments. Environment-specific behaviour MUST be driven by a
single discriminator (e.g., an `ENV` or `APP_ENV` variable) rather than ad-hoc
conditionals scattered through the codebase. The following rules apply:

- **CORS**: development MAY allow all origins (`*`); production MUST restrict
  `allow_origins` to an explicit allowlist of known frontend domains.
- **Debug mode**: development MAY enable `--reload`, verbose SQL logging, and
  the `/docs` interactive Swagger UI; production MUST disable auto-reload,
  MUST suppress verbose SQL echo, and SHOULD restrict or disable `/docs`.
- **Secrets management**: development MAY read secrets from a local `.env` file;
  production MUST source secrets from a secure provider (environment variables
  injected by the hosting platform, a vault, or encrypted config). A `.env`
  file MUST NOT exist on production servers.
- **Database URL**: development and production MUST use separate database
  connection strings. Running production traffic against a development database
  is prohibited.
- **Webhook base URL**: `BASE_URL` MUST resolve to the correct public hostname
  for the active environment (e.g., ngrok in dev, the production domain in
  prod). Twilio webhooks that point to a dev tunnel in production are a
  critical misconfiguration.
- **Logging**: development MAY log to stdout at DEBUG level; production MUST
  log structured JSON at INFO level or above.

> **Status**: This principle is ratified but not yet fully implemented in code.
> Implementation MUST be completed before any production deployment.

## Tech Stack & Architecture Constraints

The following technology choices are fixed for the lifetime of this project
unless a formal amendment is ratified:

| Layer | Choice | Constraint |
|---|---|---|
| Backend framework | FastAPI (Python 3.10+) | Async handlers required (`async def`) |
| ORM | SQLModel + SQLAlchemy (async) | `asyncpg` driver; no sync sessions |
| Database | PostgreSQL | Schema changes via Alembic only |
| Telephony | Twilio REST API + Voice SDK | Conference model for browser calls |
| Cloud storage | AWS S3 | MP3 recordings only |
| Transcription | AWS Transcribe (`he-IL`) | Hebrew language; speaker diarization enabled |
| AI / LLM | Groq API | Hebrew-language structured output required |
| Auth | JWT (access + refresh tokens) | 15 min access / 7 day refresh |
| Config | pydantic-settings (.env) | No secrets hard-coded in source |
| Hebrew JSON | Custom `HebrewJSON` SQLAlchemy type | `ensure_ascii=False` on all JSON fields |

All API routes MUST be registered under the `/api/v1` prefix. See Principle VI
for environment-specific CORS, debug, and secrets requirements.

## Development Workflow

1. **Branch per feature**: every feature or fix MUST be developed on a dedicated
   branch named `###-short-description` (e.g., `012-lead-timeline`).
2. **Spec first**: non-trivial features MUST have a spec document in
   `specs/###-feature-name/spec.md` before implementation begins.
3. **Migration with model**: any SQLModel change that affects table schema MUST
   include the corresponding Alembic migration in the same commit.
4. **Docs in lockstep**: see Principle I — API documentation MUST update in the
   same PR as the code change.
5. **Background tasks for webhooks**: CPU- or I/O-heavy work triggered by Twilio
   webhooks (AWS Transcribe polling, LLM analysis) MUST use FastAPI
   `BackgroundTasks`; blocking the request event loop is prohibited.
6. **Phone normalisation**: all inbound phone numbers MUST be normalised to
   E.164 Israeli format (`+972XXXXXXXXX`) at the service boundary before
   persistence or dialling.
7. **Israel-time awareness**: any date/time comparison that is user-visible
   (follow-up scheduling, today's call counts) MUST use `Asia/Jerusalem` timezone
   via `zoneinfo.ZoneInfo`.

## Governance

This constitution governs the **Voicely CRM Backend** project
(`Voice-transcript/`). It supersedes all verbal agreements, ad-hoc conventions,
and prior undocumented practices.

### Constitution Hierarchy

This is a **sub-constitution** within the Voicely CRM monorepo. The hierarchy is:

```
<repo-root>/.specify/memory/constitution.md   ← Global (monorepo-wide rules)
├── Frontend-voice/.specify/memory/constitution.md
└── Voice-transcript/.specify/memory/constitution.md   ← THIS FILE
```

The global constitution takes precedence on cross-stack concerns (API contracts,
authentication, environment separation, i18n/locale, telephony). This
sub-constitution MAY add stricter backend-specific rules but MUST NOT relax
global principles.

Shared speckit scaffolding (templates, extensions, hooks, scripts) lives at the
monorepo root `.specify/` — this sub-project only maintains its own
`.specify/memory/` for project-scoped memory.

### Amendments

Amendments follow semantic versioning:

- **MAJOR**: removal or incompatible redefinition of an existing principle.
- **MINOR**: addition of a new principle or materially expanded guidance to an
  existing section.
- **PATCH**: clarifications, wording fixes, and non-semantic refinements.

All PRs MUST include a "Constitution Check" confirming that no principle is
violated. If a PR deviates from a principle, it MUST either (a) include a formal
amendment to this constitution ratified by the project owner, or (b) be reworked
to comply before merge.

Runtime development guidance is captured inline within the codebase (docstrings,
OpenAPI annotations, and `README.md`). This constitution governs the rules by
which the codebase and its documentation evolve.

**Version**: 1.1.1 | **Ratified**: 2026-04-11 | **Last Amended**: 2026-04-11
