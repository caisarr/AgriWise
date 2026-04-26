import uuid
import time
from datetime import datetime, timedelta
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY,
)

# ── Sessions ─────────────────────────────────────────────────

def get_or_create_session(session_id: Optional[str] = None) -> str:
    if session_id:
        result = supabase.table("sessions") \
            .select("id").eq("id", session_id).maybe_single().execute()
        if result.data:
            supabase.table("sessions") \
                .update({"last_active": datetime.utcnow().isoformat()}) \
                .eq("id", session_id).execute()
            return session_id
    new_id = str(uuid.uuid4())
    supabase.table("sessions").insert({"id": new_id}).execute()
    return new_id

# ── Recommendations ──────────────────────────────────────────

def save_recommendation(
    session_id: str,
    season: str,
    elevation_m: int,
    ai_response: dict,
    weather_data: dict = None,
    province: str = None,
    land_area_m2: int = None,
    budget_idr: int = None,
    season_summary: str = None,
    duration_ms: int = None,
) -> dict:
    record = {
        "session_id":     session_id,
        "season":         season,
        "elevation_m":    elevation_m,
        "ai_response":    ai_response,
        "weather_data":   weather_data or {},
        "province":       province,
        "land_area_m2":   land_area_m2,
        "budget_idr":     budget_idr,
        "season_summary": season_summary,
        "duration_ms":    duration_ms,
    }
    result = supabase.table("recommendations").insert(record).execute()
    return result.data[0] if result.data else {}

def get_session_history(session_id: str, limit: int = 10) -> list:
    result = supabase.table("recommendations") \
        .select("id, created_at, season, elevation_m, province, season_summary, ai_response") \
        .eq("session_id", session_id) \
        .order("created_at", desc=True) \
        .limit(limit).execute()
    return result.data or []

# ── Crop Prices ──────────────────────────────────────────────

def get_latest_prices(crop_names: list[str] = None, region: str = "nasional") -> list:
    query = supabase.table("crop_prices") \
        .select("crop_name, crop_label, price_per_kg, price_min, price_max, recorded_at, source") \
        .eq("is_latest", True).eq("region", region)
    if crop_names:
        query = query.in_("crop_name", crop_names)
    return query.execute().data or []

def get_price_history(crop_name: str, region: str = "nasional", days: int = 30) -> list:
    since = (datetime.utcnow() - timedelta(days=days)).isoformat()
    for attempt in range(3):
        try:
            result = supabase.table("crop_price_history") \
                .select("price_per_kg, recorded_at") \
                .eq("crop_name", crop_name).eq("region", region) \
                .gte("recorded_at", since) \
                .order("recorded_at", desc=False).execute()
            return result.data or []
        except Exception as e:
            if attempt == 2:
                print(f"[Supabase] error fetching price history for {crop_name}: {e}")
                return []
            time.sleep(0.5)
    return []

def update_crop_price(
    crop_name: str, crop_label: str, price: int,
    price_min: int = None, price_max: int = None,
    source: str = "system", region: str = "nasional",
) -> bool:
    try:
        supabase.rpc("update_crop_price", {
            "p_crop_name":  crop_name,
            "p_crop_label": crop_label,
            "p_price":      price,
            "p_price_min":  price_min,
            "p_price_max":  price_max,
            "p_source":     source,
            "p_region":     region,
        }).execute()
        return True
    except Exception as e:
        print(f"[Supabase] update_crop_price error: {e}")
        return False
