import httpx
from app.core.config import settings

OWMAP_BASE = "https://api.openweathermap.org/data/2.5"

async def get_weather_data(lat: float = None, lon: float = None, city_name: str = None) -> dict:
    """Fetch cuaca dari OpenWeatherMap: current + 5-day forecast untuk akurasi lebih tinggi."""
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

    result = {}

    async with httpx.AsyncClient(timeout=10) as client:
        # ── 1. Current Weather ──
        try:
            r = await client.get(f"{OWMAP_BASE}/weather", params=params)
            
            # Jika 404 dan menggunakan parameter q (kota, ID), coba tanpa ID
            if r.status_code == 404 and "q" in params and ",ID" in params["q"]:
                params["q"] = city_name
                r = await client.get(f"{OWMAP_BASE}/weather", params=params)
                
            r.raise_for_status()
            data = r.json()
            result = {
                "temperature": data["main"]["temp"],
                "humidity":    data["main"]["humidity"],
                "rainfall":    data.get("rain", {}).get("1h", 0) * 720,  # estimasi bulanan
                "description": data["weather"][0]["description"],
            }
        except Exception as e:
            print(f"[Weather] Current weather gagal: {e}")

        # ── 2. 5-Day Forecast (untuk prediksi cuaca masa tanam) ──
        try:
            r2 = await client.get(f"{OWMAP_BASE}/forecast", params=params)
            if r2.status_code == 200:
                forecast_data = r2.json()
                forecasts = forecast_data.get("list", [])
                
                if forecasts:
                    # Hitung rata-rata suhu, kelembaban, dan total hujan 5 hari
                    temps = [f["main"]["temp"] for f in forecasts]
                    humids = [f["main"]["humidity"] for f in forecasts]
                    rain_total = sum(f.get("rain", {}).get("3h", 0) for f in forecasts)
                    
                    result["forecast_5d"] = {
                        "avg_temp": round(sum(temps) / len(temps), 1),
                        "min_temp": round(min(temps), 1),
                        "max_temp": round(max(temps), 1),
                        "avg_humidity": round(sum(humids) / len(humids), 1),
                        "total_rain_mm": round(rain_total, 1),
                        "rain_per_month_est": round(rain_total * 6, 1),  # 5 hari → 30 hari
                        "rainy_periods": sum(1 for f in forecasts if f.get("rain", {}).get("3h", 0) > 0),
                        "total_periods": len(forecasts),
                    }
                    
                    # Update estimasi curah hujan bulanan dengan data forecast yang lebih akurat
                    if result["forecast_5d"]["rain_per_month_est"] > 0:
                        result["rainfall"] = result["forecast_5d"]["rain_per_month_est"]
                    
        except Exception as e:
            print(f"[Weather] Forecast gagal (non-fatal): {e}")

    if not result:
        print(f"[Weather] Peringatan: Gagal mengambil cuaca untuk {city_name or 'koordinat'}. Menggunakan data default AI.")
    
    return result
