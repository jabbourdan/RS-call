# Voicely CRM — Voice Intelligence Platform

> [!IMPORTANT]
> **Documentation Maintenance Rule**
> Whenever you add, remove, or change **any** endpoint, service, model, or environment variable, you **must** update all three documentation files in the same commit:
> - [`BACKEND_DOCS.md`](./BACKEND_DOCS.md) — architecture, services, and business logic reference
> - [`FRONTEND_INTEGRATION.md`](./FRONTEND_INTEGRATION.md) — API contract for frontend developers
> - [`README.md`](./README.md) — quick-start and endpoint index (this file)

---

Outbound calling CRM for Israeli sales teams. Built with FastAPI, PostgreSQL, Twilio, AWS Transcribe, and Groq AI.

Full documentation:
- 📖 **Backend architecture:** [`BACKEND_DOCS.md`](./BACKEND_DOCS.md)
- 🔌 **Frontend API reference:** [`FRONTEND_INTEGRATION.md`](./FRONTEND_INTEGRATION.md)

---

## Quick Start

### 1. Set up environment

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure `.env`

Copy the environment variable template from `BACKEND_DOCS.md` → *Configure Environment Variables* and fill in your credentials.

### 3. Run migrations

```bash
alembic upgrade head
```

### 4. Start the server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API: `http://127.0.0.1:8000`  
Interactive docs: `http://127.0.0.1:8000/docs`

---

## Endpoint Index

### Auth — `/api/v1/auth`
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new org + owner user |
| `POST` | `/auth/sign-in` | Sign in, returns JWT tokens |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/sign-out` | Sign out, invalidates refresh token |
| `GET`  | `/auth/me` | Get current user profile |
| `POST` | `/auth/CreateUsers` | Create additional users in the org |
| `GET`  | `/auth/users` | List all users in the organisation |

### Dashboard — `/api/v1/dashboard`
| Method | Path | Description |
|---|---|---|
| `GET` | `/dashboard/overview` | Org-level stats, follow-ups, campaigns |

### Campaigns — `/api/v1/campaigns`
| Method | Path | Description |
|---|---|---|
| `POST`   | `/campaigns/` | Create campaign |
| `GET`    | `/campaigns/` | List campaigns |
| `GET`    | `/campaigns/all-overviews` | Settings + stats for **all** campaigns at once |
| `GET`    | `/campaigns/{campaign_id}` | Get single campaign |
| `GET`    | `/campaigns/{campaign_id}/overview` | Settings + full lead & call stats |
| `PATCH`  | `/campaigns/{campaign_id}` | Update campaign name / description / status |
| `PATCH`  | `/campaigns/{campaign_id}/settings` | Update settings |
| `DELETE` | `/campaigns/{campaign_id}` | Delete campaign |

### Leads — `/api/v1/leads`
| Method | Path | Description |
|---|---|---|
| `POST`   | `/leads/{campaign_id}/preview-columns` | Preview file columns |
| `POST`   | `/leads/{campaign_id}/upload` | Bulk upload leads |
| `POST`   | `/leads/{campaign_id}/create` | Add single lead |
| `GET`    | `/leads/{campaign_id}` | List leads |
| `PATCH`  | `/leads/{campaign_id}/{lead_id}` | Update lead |
| `DELETE` | `/leads/{campaign_id}/{lead_id}` | Delete lead |

### Contacts — `/api/v1/contacts`
| Method | Path | Description |
|---|---|---|
| `POST`   | `/contacts/` | Create contact |
| `POST`   | `/contacts/preview-columns` | Preview file columns |
| `POST`   | `/contacts/upload` | Bulk import contacts |
| `GET`    | `/contacts/` | List contacts |
| `GET`    | `/contacts/{contact_id}` | Get contact |
| `PATCH`  | `/contacts/{contact_id}` | Update contact |
| `DELETE` | `/contacts/{contact_id}` | Delete contact |

### Lead Management — `/api/v1/lead_management`
| Method | Path | Description |
|---|---|---|
| `GET`   | `/lead_management/{campaign_id}/next-lead` | Next lead to call |
| `POST`  | `/lead_management/{campaign_id}/initiate` | Initiate call to lead |
| `PATCH` | `/lead_management/{campaign_id}/leads/{lead_id}/status` | Update lead status |
| `DELETE`| `/lead_management/{campaign_id}/leads/{lead_id}` | Delete lead |
| `GET`   | `/lead_management/{campaign_id}/stats` | Campaign statistics |

### Calls — `/api/v1/calls`
| Method | Path | Description |
|---|---|---|
| `POST` | `/calls/start` | Start a single call |
| `POST` | `/calls/token` | Get Twilio browser SDK token |
| `GET`  | `/calls/{call_id}` | Get call status + transcript + AI insights |
| `POST` | `/calls/start-roll` | Start automated roll calling |
| `POST` | `/calls/stop-roll` | Stop roll calling |
| `GET`  | `/calls/roll-status/{campaign_id}` | Live roll stats |

