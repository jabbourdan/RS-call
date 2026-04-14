<!--
  ═══════════════════════════════════════════════════════════════
  SYNC IMPACT REPORT
  ═══════════════════════════════════════════════════════════════
  Version change: 1.2.0 → 1.2.1
  Bump rationale: PATCH — monorepo consolidation. Removed redundant
                  .specify/ scaffolding (templates, extensions, scripts,
                  integrations), .github/, and .vscode/ from this sub-project.
                  These now live at the monorepo root only. Added global
                  constitution hierarchy reference to Governance section.

  Modified principles: None (content unchanged)

  Modified sections:
    - Governance — added "Constitution Hierarchy" subsection referencing
      the global constitution at the monorepo root

  Removed files (moved to monorepo root):
    - Frontend-voice/.specify/templates/*
    - Frontend-voice/.specify/extensions/*
    - Frontend-voice/.specify/scripts/*
    - Frontend-voice/.specify/integrations/*
    - Frontend-voice/.specify/extensions.yml
    - Frontend-voice/.specify/init-options.json
    - Frontend-voice/.specify/integration.json
    - Frontend-voice/.github/*
    - Frontend-voice/.vscode/*

  Templates requiring updates: N/A (templates now at root only)

  Follow-up TODOs: None
  ═══════════════════════════════════════════════════════════════
-->

# Voicely CRM Frontend Constitution

## Core Principles

### I. Standalone Components First

Every Angular component MUST be declared as `standalone: true`. New modules (`NgModule`) MUST NOT be created. All imports (directives, pipes, child components) MUST be declared in the component's `imports` array. Components MUST be self-contained: a component and its template, styles, and direct dependencies form a single deployable unit. Shared UI primitives (buttons, modals, cards) MUST live under `src/app/common/` and be reusable without side effects.

**Rationale:** The project is built on Angular 20 standalone architecture. NgModules introduce unnecessary coupling and lazy-loading complexity that standalone components already solve.

### II. Service-Per-Domain

Each backend domain (auth, campaigns, leads, contacts, dashboard, lead-management) MUST have its own dedicated service under `src/app/services/<domain>/`. Every service MUST contain:
- A `<domain>.service.ts` file with HTTP methods wrapping backend endpoints.
- A `<domain>.models.ts` file with TypeScript interfaces matching the API request/response contracts.

Services MUST use the centralized `environment.apiUrl` base path. Services MUST NOT store UI state — they are HTTP adapters only. UI state belongs in the parent component or a dedicated state model.

**Rationale:** Clear separation between API integration and UI logic prevents coupling and makes backend contract changes traceable to a single service file.

### III. API Contract Fidelity (NON-NEGOTIABLE)

The backend API (FastAPI interactive docs at `/docs`) and the `Voice-transcript/` codebase are the **source of truth** for all API contracts. Every TypeScript model in `*.models.ts` files MUST match the field names, types, and nullability of the actual backend responses. When the backend API changes, the following MUST be updated **in the same commit**:
1. The corresponding `*.models.ts` file — interfaces matching the new request/response shape
2. The corresponding `*.service.ts` method — URL, HTTP verb, and payload

Any discrepancy between the backend's actual responses and the TypeScript models is a defect.

**Rationale:** The backend (FastAPI/Python) and frontend (Angular/TypeScript) are maintained in separate directories. The TypeScript models ARE the contract boundary on the frontend side — they must stay in sync with the backend at all times.

### IV. Internationalization (i18n) Required

All user-facing text MUST use `@ngx-translate/core` translation keys — never hardcoded strings in templates or components. Translation files (`public/i18n/en.json`, `public/i18n/he.json`, `public/i18n/ar.json`) MUST be updated **in the same commit** as any UI text change. Keys MUST follow the convention `<SECTION>.<KEY_NAME>` (e.g., `LEAD_MANAGEMENT.AUTO_DIALER_START`). Hebrew (`he`) is the primary user-facing language; English (`en`) is the developer reference language; Arabic (`ar`) MUST be maintained at parity.

**Rationale:** The product targets Israeli sales teams who operate in Hebrew and Arabic. Missing translations degrade user experience and violate market requirements.

### V. Authentication & Route Protection

All routes under `/dashboard/**` MUST be protected by `authGuard`. The `authInterceptor` MUST attach the Bearer JWT token to every outgoing HTTP request and MUST automatically refresh tokens on 401 responses (except `/auth/refresh` itself). Auth tokens (`access_token`, `refresh_token`, `user_id`, `org_id`, `role`) MUST be stored in `localStorage`. Sign-out MUST clear all stored tokens and redirect to `/authentication/sign-in`.

**Rationale:** The backend enforces JWT authentication on all protected endpoints. The frontend MUST mirror this enforcement at the routing and HTTP layers to prevent unauthorized access and provide graceful session recovery.

### VI. Documentation-Driven Development

Every new feature or endpoint integration MUST have a corresponding spec created via the speckit workflow (`.specify/templates/spec-template.md`) **before** implementation begins. Spec documents MUST include: backend endpoints used, TypeScript types to add, service methods to add, UI changes with markup examples, i18n keys, file change summary, edge cases, and implementation order. The spec is the implementation contract — deviations require spec amendment first.

**Rationale:** The project is built on an open-source template (Trezo) with extensive pre-existing code. Without specs, it is impossible to distinguish intentional customizations from template artifacts. Specs make the "what we built" boundary explicit.

### VII. Simplicity & Incremental Delivery

New features MUST be implemented incrementally, one user story at a time, each independently testable. YAGNI applies: do not add infrastructure, abstractions, or services that are not required by a current spec. When extending the open-source template, prefer editing existing components over creating parallel structures. Unused template components (e.g., ecommerce, NFT, hospital dashboards) MUST NOT be modified or extended — they exist as-is from the template and are not part of the project scope.

**Rationale:** The codebase inherits hundreds of template components. Scope discipline prevents accidental coupling with unused template code and keeps the active feature surface small and maintainable.

## Technology Stack & Constraints

| Layer | Technology | Version / Notes |
|---|---|---|
| **Framework** | Angular | 20.x (standalone components, signal-ready) |
| **Language** | TypeScript | ~5.8 (strict mode via `tsconfig.json`) |
| **Styling** | TailwindCSS + SCSS | TailwindCSS 4.x via PostCSS; SCSS for component styles |
| **UI Template** | Trezo | v4.1.0 — open-source Angular admin dashboard |
| **HTTP** | Angular HttpClient | Functional interceptors (`authInterceptor`) |
| **i18n** | @ngx-translate/core | 3 languages: `en`, `he`, `ar` |
| **Telephony** | @twilio/voice-sdk | v2.18.x — browser-based VoIP calling |
| **Charts** | ApexCharts (ng-apexcharts) | Dashboard visualizations |
| **Backend** | FastAPI (Python) | Separate `Voice-transcript/` directory |
| **API Proxy** | Angular dev proxy | `proxy.conf.json` → `http://localhost:8000` |
| **Auth** | JWT (Bearer) | Access + Refresh token pattern |
| **Build** | Angular CLI | `ng serve`, `ng build` |
| **Package Manager** | npm | `package.json` at project root |

### Constraints

- **Bundle size:** Initial bundle MUST NOT exceed 5 MB warning / 10 MB error (enforced in `angular.json` budgets).
- **API base path:** All API calls MUST go through `/api/v1` — no direct backend URLs in service code.
- **Phone numbers:** All phone numbers MUST be normalized to E.164 format (`+972XXXXXXXXX`) before sending to the backend.
- **Timezone:** Dashboard stats use Israel time (UTC+2/+3). The backend handles timezone conversion — the frontend MUST NOT apply additional timezone offsets.
- **Polling intervals:** Real-time features (roll status) MUST poll at 3–5 second intervals. Polling MUST stop on component destroy and on error.

### Environment Configuration

The project MUST maintain two distinct environment files under `src/environments/`:

| File | Purpose |
|---|---|
| `environment.ts` | **Development** — used by `ng serve` with proxy to local backend |
| `environment.prod.ts` | **Production** — used by `ng build --configuration production` |

**Dev environment** (`environment.ts`):
- `production: false`
- `apiUrl: '/api/v1'` — proxied via `proxy.conf.json` to `http://localhost:8000`
- `twilioEnabled: true` — Twilio SDK active in dev for testing browser calls
- `pollingIntervalMs: 4000` — roll status polling interval
- `tokenRefreshBufferMs: 30000` — refresh JWT 30 seconds before expiry
- `logLevel: 'debug'` — verbose console output for development

**Prod environment** (`environment.prod.ts`):
- `production: true`
- `apiUrl: 'https://api.voicely.co.il/api/v1'` — production API base URL
- `twilioEnabled: true` — Twilio SDK active in production
- `pollingIntervalMs: 4000` — roll status polling interval
- `tokenRefreshBufferMs: 60000` — refresh JWT 60 seconds before expiry in prod
- `logLevel: 'error'` — only errors logged in production

**Rules:**
- Services MUST read configuration from the `environment` object — never hardcode URLs, intervals, or feature flags.
- `environment.prod.ts` MUST NOT contain secrets, API keys, or tokens — those MUST be injected at deploy time via CI/CD environment variables or server-side config.
- The `proxy.conf.json` is dev-only — it MUST NOT be referenced or bundled in production builds.
- When adding a new config property, it MUST be added to **both** environment files in the same commit.

## Development Workflow & Quality Gates

### Branch Strategy

- Feature work MUST happen on a dedicated branch (`<id>-feature-name`).
- Commits MUST follow conventional format: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- The `speckit.git.feature` hook creates feature branches automatically before specification.

### Pre-Implementation Gates

1. **Spec exists:** A feature spec (via `.specify/templates/spec-template.md`) MUST be approved before any code changes.
2. **Types first:** TypeScript interfaces MUST be defined before service methods or component logic.
3. **Service before UI:** Service methods wrapping API calls MUST be implemented and verified before wiring into components.

### Quality Checklist (per feature)

- [ ] All user-facing strings use `@ngx-translate` keys
- [ ] All 3 language files (`en.json`, `he.json`, `ar.json`) updated
- [ ] New routes protected by `authGuard` (if under `/dashboard`)
- [ ] `ng build --configuration production` succeeds with no errors
- [ ] No `console.log` statements left in committed code
- [ ] Subscriptions cleaned up in `ngOnDestroy` (or via `takeUntil` / `DestroyRef`)
- [ ] Feature spec's "Edge Cases & Error Handling" table addressed

### Documentation Updates

When any API-touching code changes:
1. Update the corresponding `*.models.ts` and `*.service.ts` files to match the backend
2. Update the relevant feature spec (if behavior changed)
3. Update i18n files (if user-facing text changed)

## Governance

This constitution governs the **Voicely CRM Frontend** project (`Frontend-voice/`). All development decisions, code reviews, and feature implementations MUST comply with the principles defined above.

### Constitution Hierarchy

This is a **sub-constitution** within the Voicely CRM monorepo. The hierarchy is:

```
<repo-root>/.specify/memory/constitution.md   ← Global (monorepo-wide rules)
├── Frontend-voice/.specify/memory/constitution.md   ← THIS FILE
└── Voice-transcript/.specify/memory/constitution.md
```

The global constitution takes precedence on cross-stack concerns (API contracts,
authentication, environment separation, i18n/locale). This sub-constitution MAY
add stricter frontend-specific rules but MUST NOT relax global principles.

Shared speckit scaffolding (templates, extensions, hooks, scripts) lives at the
monorepo root `.specify/` — this sub-project only maintains its own
`.specify/memory/` for project-scoped memory.

### Amendment Process

1. Propose the change with rationale (in a commit or discussion).
2. Update this constitution file with the new or modified principle.
3. Increment the version following semantic versioning:
   - **MAJOR:** Principle removed or fundamentally redefined.
   - **MINOR:** New principle added or existing principle materially expanded.
   - **PATCH:** Clarification, typo fix, or non-semantic wording improvement.
4. Update `LAST_AMENDED_DATE` to the date of the change.
5. Run the consistency propagation checklist (verify templates and specs still align).

### Compliance

- Every PR / code review MUST verify compliance with these principles.
- Deviations MUST be justified in the PR description with a reference to the principle being waived and the reason.
- Use the backend FastAPI docs (`/docs`) and feature specs as runtime development guidance.

**Version**: 1.2.1 | **Ratified**: 2026-04-11 | **Last Amended**: 2026-04-11
