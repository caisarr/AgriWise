from fastapi import APIRouter
from app.services.supabase_service import get_latest_prices, get_price_history

router = APIRouter(prefix="/api", tags=["prices"])

@router.get("/prices")
def all_prices(region: str = "nasional"):
    return {"prices": get_latest_prices(region=region)}

@router.get("/prices/{crop_name}")
def price_history(crop_name: str, region: str = "nasional", days: int = 30):
    return {
        "crop_name": crop_name,
        "history":   get_price_history(crop_name, region=region, days=days),
    }
