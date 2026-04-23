import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.openapi.utils import get_openapi
import os

from app.api.v1 import calls, auth, campaigns, leads, lead_management, calls_test, dashboard, contacts, org_phone_numbers

app = FastAPI(
    title="Kolligent - Voice Intelligence",
    description="S3 Upload, AWS Transcribe, and PostgreSQL Storage",
    version="1.0.0"
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    # Add Bearer token + Cookie security schemes
    schema.setdefault("components", {}).setdefault("securitySchemes", {}).update({
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        },
        "CookieAuth": {
            "type": "apiKey",
            "in": "cookie",
            "name": "access_token",
        },
    })
    # Apply both schemes globally to all endpoints
    for path in schema.get("paths", {}).values():
        for operation in path.values():
            operation.setdefault("security", [
                {"BearerAuth": []},
                {"CookieAuth": []},
            ])
    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi

# ── CORS ──────────────────────────────────────────────────────────
# NOTE: allow_origins cannot be ["*"] when allow_credentials=True.
# Add your frontend origin(s) here (e.g. "http://localhost:3000")
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────
app.include_router(auth.router,            prefix="/api/v1")
app.include_router(calls.router,           prefix="/api/v1")
app.include_router(calls_test.router,      prefix="/api/v1")
app.include_router(campaigns.router,       prefix="/api/v1")
app.include_router(leads.router,           prefix="/api/v1")
app.include_router(lead_management.router, prefix="/api/v1")
app.include_router(dashboard.router,       prefix="/api/v1")
app.include_router(contacts.router,        prefix="/api/v1")
app.include_router(org_phone_numbers.router, prefix="/api/v1")


# ── Root ──────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "API is active.",
        "docs": "/docs"
    }


# ── Browser Call Test Page ────────────────────────────────────────
@app.get("/test-call")
async def test_call_page():
    """
    Serves the browser-based call test HTML page.
    Open http://127.0.0.1:8000/test-call in Chrome to test.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return FileResponse(os.path.join(base_dir, "test_browser_call.html"))


@app.get("/test-roll")
async def test_roll_page():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return FileResponse(os.path.join(base_dir, "test_roll.html"))

@app.get("/agent")
async def agent_console():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return FileResponse(os.path.join(base_dir, "agent_console.html"))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
