# Content Sources

Where to pull information from when creating or updating wiki pages.

## Primary Sources (always read before writing)

| Wiki Section | Source File(s) |
|---|---|
| Project Overview | `Voice-transcript/README.md` |
| Tech Stack & Architecture | `Voice-transcript/BACKEND_DOCS.md` (Tech Stack + Folder Structure sections) |
| Backend API Reference | `Voice-transcript/BACKEND_DOCS.md` (endpoint sections) and `Voice-transcript/FRONTEND_INTEGRATION.md` |
| Services & Business Logic | `Voice-transcript/BACKEND_DOCS.md` (services sections + Key Business Logic Notes) |
| Frontend | `Frontend-voice/README.md` and `Frontend-voice/src/` |
| Integrations | `Voice-transcript/BACKEND_DOCS.md` (integrations section) |
| Database Schema | `Voice-transcript/app/models/base.py` |
| Environment & Setup | `Voice-transcript/BACKEND_DOCS.md` (Environment Variables Reference + How to Run) |
| Roll Feature | `Voice-transcript/ROLL_FEATURE_SPEC.md` |

## Secondary Sources

- `Voice-transcript/requirements.txt` — Python dependencies
- `Voice-transcript/alembic/versions/` — migration history
- `Frontend-voice/package.json` — frontend dependencies (if exists)
- `Frontend-voice/angular.json` or `Frontend-voice/tsconfig.json` — Angular config

## Rules for Sourcing

1. **Always read the source file before writing wiki content** — do not rely on memory or cached info
2. **If a source file has been updated since the last wiki update**, the wiki page must be refreshed
3. **If information conflicts between sources**, prefer the actual code (`app/`) over documentation files
4. **Never fabricate endpoints or features** — only document what exists in the codebase
5. **Check `app/api/v1/*.py` files** for the most accurate endpoint list — docs may lag behind code
