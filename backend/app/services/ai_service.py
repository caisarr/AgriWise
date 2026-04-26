import json
from google import genai
from google.genai import types
from app.core.config import settings
from app.models.schemas import RecommendRequest

# Initialize client only if API key is provided
client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "mock":
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """Kamu adalah AgriWise AI, asisten pertanian tingkat pakar yang HANYA bekerja berdasarkan DATA FAKTUAL.

ATURAN KETAT AKURASI:
1. WAJIB gunakan Google Search untuk mencari data PIHPS (Pusat Informasi Harga Pangan Strategis) atau sumber harga resmi BPS, Kementan, BMKG, atau Panel Harga Pangan Nasional untuk setiap tanaman yang kamu rekomendasikan.
2. Harga yang kamu masukkan di field "avg_price_per_kg" HARUS berasal dari data pencarian internet hari ini, BUKAN dari pengetahuan umummu. Jika tidak ditemukan data, tulis 0 dan beri catatan di field "price_source".
3. Untuk "price_trend", bandingkan harga minggu ini vs 2-4 minggu lalu dari hasil pencarianmu. Jangan mengarang tren.
4. Untuk "estimated_yield_per_100m2_kg", gunakan data hasil panen rata-rata dari Kementan atau jurnal pertanian Indonesia, bukan estimasi umum.
5. Untuk "harvest_duration_days", gunakan data varietas yang paling umum digunakan di provinsi tersebut.
6. Setiap "reason" HARUS menyebutkan SATU fakta spesifik dari data cuaca/lahan yang diberikan (misalnya: "Suhu 28°C sangat ideal karena cabai membutuhkan 25-32°C").
7. Urutkan rekomendasi dari yang PALING menguntungkan (ROI tertinggi) ke yang paling rendah.

ATURAN CUACA & MUSIM:
- Dari "Rencana Tanggal Tanam" yang diberikan, tentukan sendiri apakah itu masuk musim hujan, kemarau, atau peralihan untuk provinsi tersebut.
- Gunakan Google Search untuk mencari prakiraan cuaca BMKG terbaru untuk wilayah tersebut.
- Perhitungkan bahwa tanaman yang ditanam pada tanggal itu akan melewati beberapa bulan ke depan — pastikan cuaca selama SELURUH siklus hidup tanaman (tanam hingga panen) mendukung.

INFORMASI SUMBER:
- Sertakan field "price_source" berisi nama sumber data harga (misalnya: "PIHPS Kementan April 2026", "BPS", "Pasar Induk Kramat Jati").
- Sertakan field "weather_insight" berisi 1 kalimat analisis cuaca spesifik untuk tanaman itu.

Jawab HANYA dengan JSON valid, tanpa teks tambahan, markdown, atau penjelasan."""

def build_prompt(req: RecommendRequest, weather_data: dict) -> str:
    # Hitung informasi tambahan yang berguna untuk AI
    elevation_zone = "dataran rendah (0-300m)" if req.elevation_m < 300 else \
                     "dataran menengah (300-700m)" if req.elevation_m < 700 else \
                     "dataran tinggi (700m+)"
    
    budget_info = f"Rp {req.budget_idr:,}" if req.budget_idr else 'tidak diketahui'
    land_info = f"{req.land_area_m2} m²" if req.land_area_m2 else 'tidak diketahui'
    
    weather_section = "DATA CUACA REAL-TIME (dari OpenWeatherMap):\n"
    if weather_data:
        weather_section += f"- Suhu saat ini: {weather_data.get('temperature', 'N/A')}°C\n"
        weather_section += f"- Kelembaban: {weather_data.get('humidity', 'N/A')}%\n"
        weather_section += f"- Estimasi curah hujan: {weather_data.get('rainfall', 'N/A')} mm/bulan\n"
        weather_section += f"- Kondisi langit: {weather_data.get('description', 'N/A')}\n"
    else:
        weather_section += "- Data cuaca tidak tersedia. Gunakan Google Search untuk mencari cuaca wilayah ini.\n"

    return f"""Berikan 6 rekomendasi tanaman berdasarkan profil berikut:

PROFIL LAHAN & PETANI:
- Rencana Tanggal Tanam: {req.planting_date}
- Ketinggian lokasi: {req.elevation_m} mdpl ({elevation_zone})
- Provinsi: {req.province or 'tidak diketahui'}
- Kota/Kabupaten: {req.city or 'tidak diketahui'}
- Jenis Tanah: {req.soil_type or 'tidak diketahui'}
- Sumber Air: {req.water_source or 'tidak diketahui'}
- Tingkat Pengalaman: {req.experience or 'tidak diketahui'}
- Luas lahan: {land_info}
- Budget modal: {budget_info}

{weather_section}

INSTRUKSI:
1. Cari via Google Search: harga pasar terbaru setiap komoditas dari PIHPS/BPS.
2. Cari via Google Search: prakiraan cuaca BMKG untuk {req.province or req.city or 'Indonesia'} bulan ini.
3. Pilih 6 tanaman yang PALING cocok dan menguntungkan untuk kondisi di atas.
4. Urutkan dari ROI tertinggi ke terendah.

FORMAT JSON YANG WAJIB DIKEMBALIKAN:
{{
  "recommendations": [
    {{
      "crop_name": "Nama Tanaman",
      "crop_slug": "nama_tanaman",
      "local_name": "nama lokal / daerah",
      "reason": "penjelasan 2 kalimat mengapa cocok, WAJIB menyebut data spesifik cuaca/lahan",
      "planting_season": "kapan waktu tanam terbaik",
      "harvest_duration_days": 90,
      "avg_price_per_kg": 15000,
      "price_trend": "naik/stabil/turun",
      "price_source": "sumber data harga (misal: PIHPS April 2026)",
      "weather_insight": "1 kalimat analisis cuaca untuk tanaman ini",
      "estimated_yield_per_100m2_kg": 200,
      "difficulty_level": "mudah/sedang/sulit",
      "tips": "1 tips spesifik dan praktis"
    }}
  ],
  "season_summary": "ringkasan 2 kalimat: kondisi musim dan rekomendasi utama berdasarkan data cuaca",
  "data_sources": ["PIHPS Kementan", "BMKG", "sumber lain yang dipakai"]
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
                    "price_source": "Mock Data",
                    "weather_insight": "Suhu dan kelembaban ideal untuk varietas IR64",
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
                    "price_source": "Mock Data",
                    "weather_insight": "Toleran terhadap periode kering pendek",
                    "estimated_yield_per_100m2_kg": 150,
                    "difficulty_level": "mudah",
                    "tips": "Waspadai serangan ulat grayak"
                }
            ],
            "season_summary": "Ini adalah data simulasi karena API Key tidak tersedia.",
            "data_sources": ["Mock"]
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
        print(f"[AI] Raw response: {full_text[:500]}")
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
Jika ditanya tentang harga atau kondisi pasar, gunakan Google Search untuk mendapat data terkini.
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
                tools=[{"google_search": {}}],
                max_output_tokens=8192,
            ),
        )
        return response.text
    except Exception as e:
        print(f"[AI] stream_chat error: {e}")
        return "Maaf, terjadi kesalahan saat menghubungi AI."
