import json
from google import genai
from google.genai import types
from app.core.config import settings
from app.models.schemas import RecommendRequest

# Initialize client only if API key is provided
client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "mock":
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """Kamu adalah AgriWise AI, asisten pertanian ahli untuk petani Indonesia.
Tugasmu: merekomendasikan tanaman terbaik berdasarkan kondisi yang diberikan.
Gunakan fitur Web Search (Google Search) milikmu untuk memastikan harga pasar yang kamu masukkan benar-benar harga terbaru (realtime) hari ini di Indonesia.
Jawab HANYA dengan JSON valid, tanpa teks tambahan apapun."""

def build_prompt(req: RecommendRequest, weather_data: dict) -> str:
    return f"""Berikan 6 rekomendasi tanaman berdasarkan data ini:

INPUT PETANI:
- Rencana Tanggal Tanam: {req.planting_date}
- Ketinggian lokasi: {req.elevation_m} mdpl
- Provinsi: {req.province or 'tidak diketahui'}
- Kota/Kabupaten: {req.city or 'tidak diketahui'}
- Jenis Tanah: {req.soil_type or 'tidak diketahui'}
- Sumber Air: {req.water_source or 'tidak diketahui'}
- Tingkat Pengalaman: {req.experience or 'tidak diketahui'}
- Luas lahan: {f"{req.land_area_m2} m²" if req.land_area_m2 else 'tidak diketahui'}
- Budget modal: {f"Rp {req.budget_idr:,}" if req.budget_idr else 'tidak diketahui'}

DATA CUACA:
- Curah hujan: {weather_data.get('rainfall', 'N/A')} mm/bulan
- Suhu: {weather_data.get('temperature', 'N/A')}°C
- Kelembaban: {weather_data.get('humidity', 'N/A')}%

Cari tanaman yang cocok lalu kembalikan JSON persis seperti ini:
{{
  "recommendations": [
    {{
      "crop_name": "Nama Tanaman",
      "crop_slug": "nama_tanaman",
      "local_name": "nama lokal / daerah",
      "reason": "penjelasan 2 kalimat mengapa cocok",
      "planting_season": "kapan waktu tanam terbaik",
      "harvest_duration_days": 90,
      "avg_price_per_kg": 15000,
      "price_trend": "naik",
      "estimated_yield_per_100m2_kg": 200,
      "difficulty_level": "mudah",
      "tips": "1 tips singkat penting"
    }}
  ],
  "season_summary": "ringkasan 1 kalimat kondisi musim saat ini"
}}"""

async def get_crop_recommendations(req: RecommendRequest, weather_data: dict) -> dict | None:
    if not client:
        print("[AI] No Gemini API key found, returning MOCK data...")
        return {
            "recommendations": [
                {
                    "crop_name": "Padi Sawah (Mock)",
                    "crop_slug": "padi",
                    "local_name": "Pari",
                    "reason": "Sangat cocok untuk daerah dataran rendah dengan curah hujan tinggi rata-rata. Kebutuhan air tercukupi.",
                    "planting_season": "Awal musim hujan",
                    "harvest_duration_days": 115,
                    "avg_price_per_kg": 6500,
                    "price_trend": "stabil",
                    "estimated_yield_per_100m2_kg": 60,
                    "difficulty_level": "sedang",
                    "tips": "Gunakan varietas tahan wereng"
                },
                {
                    "crop_name": "Jagung Manis (Mock)",
                    "crop_slug": "jagung",
                    "local_name": "Jagung",
                    "reason": "Alternatif yang baik bila curah hujan mulai berkurang. Umur panen lebih singkat dibanding padi.",
                    "planting_season": "Akhir musim hujan",
                    "harvest_duration_days": 75,
                    "avg_price_per_kg": 4000,
                    "price_trend": "naik",
                    "estimated_yield_per_100m2_kg": 150,
                    "difficulty_level": "mudah",
                    "tips": "Waspadai serangan ulat grayak"
                }
            ],
            "season_summary": "Ini adalah data simulasi karena API Key tidak tersedia."
        }

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=build_prompt(req, weather_data),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=[{"google_search": {}}],
            ),
        )

        full_text = response.text
        # Parse JSON
        clean = full_text.strip().lstrip("```json").rstrip("```").strip()
        return json.loads(clean)

    except json.JSONDecodeError as e:
        print(f"[AI] JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"[AI] error: {e}")
        return None

async def stream_chat(messages: list, context: str = "") -> str:
    """Untuk AI chat assistant lanjutan (tanya-jawab tentang tanaman)."""
    if not client:
        return "Halo! Ini adalah balasan simulasi (mock) karena Anda belum memasukkan API Key."

    system = f"""Kamu adalah AgriWise AI, asisten pertanian ramah untuk petani Indonesia.
Jawab pertanyaan tentang cara tanam, pupuk, hama, panen, dll dengan bahasa sederhana.
{f'Konteks rekomendasi sebelumnya: {context}' if context else ''}"""

    formatted_messages = []
    for m in messages:
        role = 'model' if m.get('role') == 'assistant' else 'user'
        formatted_messages.append(
            types.Content(role=role, parts=[types.Part.from_text(text=m.get('content', ''))])
        )

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=formatted_messages,
            config=types.GenerateContentConfig(
                system_instruction=system,
                max_output_tokens=8192,
            ),
        )
        return response.text
    except Exception as e:
        print(f"[AI] stream_chat error: {e}")
        return "Maaf, terjadi kesalahan saat menghubungi AI."
