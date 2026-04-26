from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from contextlib import asynccontextmanager
from app.routers import recommend, prices, chat, diagnosis, calendar
from app.services.scheduler import start_scheduler
from app.core.config import settings
import re

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

app = FastAPI(
    title="AgriWise AI API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Smart CORS: support wildcard patterns like *.vercel.app ──
def is_origin_allowed(origin: str) -> bool:
    """Check if origin matches any allowed pattern (supports wildcards)."""
    for pattern in settings.origins_list:
        pattern = pattern.strip()
        if pattern == "*":
            return True
        # Convert wildcard pattern to regex: *.vercel.app → .*\.vercel\.app
        regex = pattern.replace(".", r"\.").replace("*", ".*")
        if re.fullmatch(regex, origin):
            return True
    return False

class DynamicCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        
        # Handle preflight OPTIONS requests
        if request.method == "OPTIONS":
            if is_origin_allowed(origin):
                return Response(
                    status_code=200,
                    headers={
                        "Access-Control-Allow-Origin": origin,
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Max-Age": "600",
                    },
                )
            return Response(status_code=400)
        
        response = await call_next(request)
        
        if origin and is_origin_allowed(origin):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
        
        return response

app.add_middleware(DynamicCORSMiddleware)

app.include_router(recommend.router)
app.include_router(prices.router)
app.include_router(chat.router)
app.include_router(diagnosis.router)
app.include_router(calendar.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "agriwise-api"}
