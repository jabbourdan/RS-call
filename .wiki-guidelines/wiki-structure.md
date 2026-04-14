# Wiki Page Structure

All pages are created under the **Jabbour Test wiki (JA)** Confluence space.

## Page Hierarchy

```
Voicely CRM — Project Home (parent page)
├── 1. Project Overview
├── 2. Tech Stack & Architecture
├── 3. Backend API Reference
│   ├── Auth Endpoints
│   ├── Campaigns Endpoints
│   ├── Leads Endpoints
│   ├── Contacts Endpoints
│   ├── Lead Management Endpoints
│   ├── Calls Endpoints
│   └── Dashboard Endpoints
├── 4. Services & Business Logic
│   ├── Roll Calling Engine
│   ├── Transcription Pipeline
│   ├── AI / LLM Analysis
│   └── Lead Prioritization
├── 5. Frontend (Angular)
├── 6. Integrations
│   ├── Twilio
│   ├── AWS S3 & Transcribe
│   └── Groq AI
├── 7. Database Schema
├── 8. Environment & Setup
└── 9. Deployment & Operations
```

## Page Content Requirements

### 1. Project Overview
- What Voicely CRM is (one paragraph)
- Target users: Israeli sales teams
- Core value proposition: automated outbound calling, Hebrew transcription, AI insights
- Link to all child pages

### 2. Tech Stack & Architecture
- Tech stack table (Backend, Frontend, DB, Telephony, Cloud, AI)
- High-level architecture description (how components connect)
- Folder structure for both Backend and Frontend

### 3. Backend API Reference
- One child page per API domain (Auth, Campaigns, Leads, etc.)
- Each page: endpoint table with Method, Path, Description
- Request/response examples where available
- Auth requirements per endpoint

### 4. Services & Business Logic
- Roll Calling flow (step-by-step)
- Lead prioritization algorithm
- Lead eligibility/exclusion rules
- Transcription pipeline (Twilio -> S3 -> AWS Transcribe -> LLM)
- AI analysis output format (summary, sentiment, key_points, next_action)
- Multi-tenancy model (org_id scoping)

### 5. Frontend (Angular)
- Framework version and template (Trezo / Angular 20)
- How to run the dev server
- Key modules and components (as they are built out)

### 6. Integrations
- One child page per integration
- Configuration needed (env vars)
- How the integration is used in the codebase
- Error handling notes

### 7. Database Schema
- All models from `app/models/base.py`
- Field descriptions and types
- Relationships between models
- HebrewJSON custom type explanation
- Migration history

### 8. Environment & Setup
- Prerequisites (Python, PostgreSQL, Twilio, AWS, Groq)
- Step-by-step local setup
- Full environment variables table with descriptions
- ngrok setup for Twilio webhooks

### 9. Deployment & Operations
- Production deployment notes
- Security considerations (remove test routes, restrict CORS)
- Monitoring and logging
