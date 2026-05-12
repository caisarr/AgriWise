from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from contextlib import asynccontextmanager
from app.routers import recommend, prices, chat, diagnosis, calendar, marketplace, iot
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

# Pisahkan origins biasa dan regex
origins = []
regex_patterns = []

for o in settings.origins_list:
    o = o.strip()
    if "*" in o:
        # Convert https://*.vercel.app -> https://.*\.vercel\.app
        regex_patterns.append(o.replace(".", r"\.").replace("*", ".*"))
    else:
        origins.append(o)

origin_regex = f"^({'|'.join(regex_patterns)})$" if regex_patterns else None

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend.router)
app.include_router(prices.router)
app.include_router(chat.router)
app.include_router(diagnosis.router)
app.include_router(calendar.router)
app.include_router(marketplace.router)
app.include_router(iot.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "agriwise-api"}
