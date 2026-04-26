import time
from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from app.models.schemas import RecommendRequest
from app.services.supabase_service import (
    get_or_create_session, save_recommendation,
    get_latest_prices, get_session_history,
)
from app.services.ai_service import get_crop_recommendations
from app.services.weather_service import get_weather_data
from app.services.validator_service import validate_and_fix_recommendations

router = APIRouter(prefix="/api", tags=["recommend"])

@router.post("/recommend")
async def recommend(
    body: RecommendRequest,
    x_session_id: Optional[str] = Header(None, alias="x-session-id"),
):
    start = time.time()

    session_id   = get_or_create_session(x_session_id)
    weather_data = await get_weather_data(body.lat, body.lon, body.city)
    ai_result    = await get_crop_recommendations(body, weather_data)

    if not ai_result:
        raise HTTPException(status_code=502, detail="AI service gagal merespons")

    # Validasi & koreksi output AI (tangkap halusinasi)
    ai_result = validate_and_fix_recommendations(ai_result)

    # Enrich harga dari Supabase
    slugs     = [c.get("crop_slug") for c in ai_result.get("recommendations", []) if c.get("crop_slug")]
    db_prices = get_latest_prices(slugs) if slugs else []
    price_map = {p["crop_name"]: p for p in db_prices}

    for crop in ai_result.get("recommendations", []):
        slug = crop.get("crop_slug")
        if slug and slug in price_map:
            db = price_map[slug]
            crop["db_price_per_kg"] = db["price_per_kg"]
            crop["price_source"]    = db["source"]
            crop["price_updated"]   = db["recorded_at"]

    duration_ms = int((time.time() - start) * 1000)
    saved = save_recommendation(
        session_id     = session_id,
        season         = body.planting_date,
        elevation_m    = body.elevation_m,
        ai_response    = ai_result.get("recommendations", []),
        weather_data   = weather_data,
        province       = body.province,
        land_area_m2   = body.land_area_m2,
        budget_idr     = body.budget_idr,
        season_summary = ai_result.get("season_summary"),
        duration_ms    = duration_ms,
    )

    return {
        "session_id":        session_id,
        "recommendation_id": saved.get("id"),
        "recommendations":   ai_result.get("recommendations", []),
        "season_summary":    ai_result.get("season_summary"),
        "data_sources":      ai_result.get("data_sources", []),
        "weather":           weather_data,
        "duration_ms":       duration_ms,
    }

@router.get("/history")
async def history(
    limit: int = 10,
    x_session_id: Optional[str] = Header(None, alias="x-session-id"),
):
    if not x_session_id:
        return {"history": []}
    return {"history": get_session_history(x_session_id, limit=limit)}
