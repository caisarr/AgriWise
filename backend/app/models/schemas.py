from pydantic import BaseModel, Field
from typing import Optional, List, Any

# ── Request ──────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    planting_date: str
    elevation_m:  int   = Field(..., ge=0, le=4000)
    province:     Optional[str]   = None
    city:         Optional[str]   = None
    land_area_m2: Optional[int]   = None
    budget_idr:   Optional[int]   = None
    lat:          Optional[float] = None
    lon:          Optional[float] = None
    soil_type:    Optional[str]   = None
    water_source: Optional[str]   = None
    experience:   Optional[str]   = None

class ChatMessage(BaseModel):
    role:    str  # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages:   List[ChatMessage]
    context:    Optional[str] = None  # JSON rekomendasi sebelumnya

# ── Response ─────────────────────────────────────────────────

class CropRecommendation(BaseModel):
    crop_name:                  str
    crop_slug:                  str
    local_name:                 Optional[str]
    reason:                     str
    planting_season:            str
    harvest_duration_days:      int
    avg_price_per_kg:           int
    price_trend:                str
    estimated_yield_per_100m2_kg: int
    difficulty_level:           str
    tips:                       str
    db_price_per_kg:            Optional[int] = None
    price_source:               Optional[str] = None
    price_updated:              Optional[str] = None

class RecommendResponse(BaseModel):
    session_id:        str
    recommendation_id: Optional[str]
    recommendations:   List[Any]
    season_summary:    Optional[str]
    weather:           dict
    duration_ms:       int
