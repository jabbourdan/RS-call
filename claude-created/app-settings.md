# App Settings Feature

## Overview

The App Settings module (`/dashboard/app-settings`) is a new standalone top-level section in the RS-Call
frontend (Angular 20). It sits alongside Contacts, Leads, Campaigns, and Lead Management in the sidebar.

It provides two sub-tabs:

1. **General Settings** (`/dashboard/app-settings/general-settings`) — editable org info, read-only
   phone numbers, call/dialing config, and locale settings.
2. **User Management** (`/dashboard/app-settings/user-management`) — card grid of org users with
   role and status badges, and Add/Edit/Delete actions (dummy data, no backend).

---

## File Structure

```
Frontend-voice/src/app/app-settings/
├── app-settings.component.ts           # Shell with RouterOutlet + tab nav
├── app-settings.component.html         # Breadcrumb, card wrapper, tab links, router-outlet
├── app-settings.component.scss         # Active tab style
├── app-settings.component.spec.ts      # Unit tests
├── general-settings/
│   ├── general-settings.component.ts   # Form with ngModel bindings + onSave()
│   ├── general-settings.component.html # 4 sections: Org, Phones, Dialing, Locale
│   ├── general-settings.component.scss
│   └── general-settings.component.spec.ts
└── user-management/
    ├── user-management.component.ts    # Dummy users array + badge class maps
    ├── user-management.component.html  # Card grid with Add/Edit/Delete
    ├── user-management.component.scss
    └── user-management.component.spec.ts
```

---

## Routing

Added to `src/app/app.routes.ts` as a direct child of `/dashboard`:

```typescript
{
    path: 'app-settings',
    component: AppSettingsComponent,
    children: [
        { path: '', redirectTo: 'general-settings', pathMatch: 'full' },
        { path: 'general-settings', component: GeneralSettingsComponent },
        { path: 'user-management', component: UserManagementComponent }
    ]
}
```

---

## Sidebar

A new `accordion-item` div was added to `sidebar.component.html` immediately after the
`lead-management` item. Uses the `settings` Material Symbol icon and `SIDEBAR.APP_SETTINGS`
translation key. No `[routerLinkActiveOptions]="{exact: true}"` — keeps the item highlighted
for all child routes.

---

## i18n Keys Added

All three locale files (`en.json`, `ar.json`, `he.json`) received:
- `SIDEBAR.APP_SETTINGS` — sidebar nav label
- Top-level `APP_SETTINGS` object with ~30 keys covering section headings, field labels,
  button text, and role/status values

---

## General Settings — Form Fields

| Section | Field | Editable | Source (backend model) |
|---|---|---|---|
| Organization | Org Name | Yes | `Organization.org_name` |
| Organization | Business Type | Yes | `Organization.bus_type` |
| Organization | Plan | **No (locked)** | `Organization.plan` |
| Phone Numbers | Phone Number 1 | **No (locked)** | `CampaignSettings.phone_number_used1` |
| Phone Numbers | Phone Number 2 | **No (locked)** | `CampaignSettings.phone_number_used2` |
| Call / Dialing | Max Calls to Unanswered | Yes | `CampaignSettings.max_calls_to_unanswered_lead` |
| Call / Dialing | Calling Algorithm | Yes | `CampaignSettings.calling_algorithm` |
| Call / Dialing | Cooldown (minutes) | Yes | `CampaignSettings.cooldown_minutes` |
| Call / Dialing | Change Number After | Yes | `CampaignSettings.change_number_after` |
| Locale | Language | Yes | app-level i18n |
| Locale | Timezone | Yes | app-level config |

Locked fields use `readonly` attribute, grayed background (`bg-gray-50 dark:bg-[#0d1628]`),
and a `lock` Material Symbol icon overlay.

---

## User Management — Dummy Data

Four hardcoded users (no backend):

| Name | Email | Role | Status |
|---|---|---|---|
| Alice Johnson | alice@example.com | Admin | Active |
| Bob Kim | bob@example.com | Agent | Active |
| Carol Martinez | carol@example.com | Supervisor | Active |
| David Wilson | david@example.com | Agent | Inactive |

---

## Design Decisions

- **Shell pattern**: Mirrors `src/app/settings/settings.component.{ts,html}` — minimal shell
  that owns only breadcrumb, card wrapper, nav tabs, and `<router-outlet>`.
- **Tab active state**: `routerLinkActive="active"` + `.nav-links a.active` CSS rule sets
  `background-color: var(--primary-500)` — identical to the existing settings page.
- **Dummy data only**: `onSave()` logs to console. Wire a future `AppSettingsService` to persist.
- **Card grid**: `xl:grid-cols-4` — 4 across on wide screens, 2 on tablet, 1 on mobile.
- **RTL support**: All directional spacing uses `ltr:` / `rtl:` Tailwind prefixes.
- **Dark mode**: Uses project-wide `dark:bg-[#0c1427]` / `dark:border-[#172036]` pattern.
- **Angular 20 control flow**: Uses `@for` syntax (not `*ngFor`), consistent with the project.

---

## Next Steps (Future Work)

1. Create `AppSettingsService` to `GET /api/org-settings` on init and `PATCH` on save.
2. Wire `language` selector to `TranslateService.use()` for real-time language switching.
3. Wire `timezone` to a date-fns-tz or moment-timezone helper.
4. Replace dummy user list with a real `GET /api/users` call.
5. Implement Add/Edit modal dialogs for User Management.
6. Guard the `app-settings` route to Admin role only once RBAC is available.
