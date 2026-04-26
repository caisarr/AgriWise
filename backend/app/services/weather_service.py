import httpx
from app.core.config import settings

OWMAP_BASE = "https://api.openweathermap.org/data/2.5"

async def get_weather_data(lat: float = None, lon: float = None, city_name: str = None) -> dict:
    """Fetch cuaca dari OpenWeatherMap berdasarkan koordinat atau nama kota."""
    if not settings.OPENWEATHERMAP_API_KEY:
        return {}
    
    params = {
        "appid": settings.OPENWEATHERMAP_API_KEY,
        "units": "metric", "lang": "id",
    }
    
    if lat and lon:
        params["lat"] = lat
        params["lon"] = lon
    elif city_name:
        params["q"] = f"{city_name},ID"
    else:
        return {}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{OWMAP_BASE}/weather", params=params)
            
            # Jika 404 dan menggunakan parameter q (kota, ID), coba tanpa ID
            if r.status_code == 404 and "q" in params and ",ID" in params["q"]:
                params["q"] = city_name
                r = await client.get(f"{OWMAP_BASE}/weather", params=params)
                
            r.raise_for_status()
            data = r.json()
            return {
                "temperature": data["main"]["temp"],
                "humidity":    data["main"]["humidity"],
                "rainfall":    data.get("rain", {}).get("1h", 0) * 720,  # estimasi bulanan
                "description": data["weather"][0]["description"],
            }
    except Exception as e:
        print(f"[Weather] Peringatan: Gagal mengambil cuaca untuk {city_name or 'koordinat'}. Menggunakan data default AI. Error: {e}")
        return {}
