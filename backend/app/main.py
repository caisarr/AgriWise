from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import recommend, prices, chat, diagnosis, calendar
from app.services.scheduler import start_scheduler
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

app = FastAPI(
    title="AgriWise AI API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend.router)
app.include_router(prices.router)
app.include_router(chat.router)
app.include_router(diagnosis.router)
app.include_router(calendar.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "agriwise-api"}
