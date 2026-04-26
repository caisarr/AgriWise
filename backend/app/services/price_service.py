"""
Price service — fetch harga komoditas dari sumber publik.
Update ke Supabase via update_crop_price().
Dipanggil oleh scheduler setiap 6 jam.
"""
import json
from google import genai
from google.genai import types
from app.services.supabase_service import update_crop_price
from app.core.config import settings

# Mapping tanaman → keyword pencarian harga
CROP_LIST = [
    # Sayuran
    ("cabai_merah",    "Cabai Merah"),
    ("cabai_rawit",    "Cabai Rawit"),
    ("bawang_merah",   "Bawang Merah"),
    ("bawang_putih",   "Bawang Putih"),
    ("tomat",          "Tomat"),
    ("kentang",        "Kentang"),
    ("wortel",         "Wortel"),
    ("bayam",          "Bayam"),
    ("kangkung",       "Kangkung"),
    ("sawi",           "Sawi"),
    ("kacang_panjang", "Kacang Panjang"),
    ("terong",         "Terong"),
    ("kubis",          "Kubis (Kol)"),
    ("buncis",         "Buncis"),
    ("timun",          "Timun"),
    ("labu_siam",      "Labu Siam"),
    # Pangan pokok
    ("padi",           "Padi (Gabah)"),
    ("jagung",         "Jagung"),
    ("singkong",       "Singkong"),
    ("kedelai",        "Kedelai"),
    ("kacang_tanah",   "Kacang Tanah"),
    ("ubi_jalar",      "Ubi Jalar"),
    # Buah
    ("pisang",         "Pisang"),
    ("semangka",       "Semangka"),
    ("melon",          "Melon"),
    ("pepaya",         "Pepaya"),
    ("jeruk",          "Jeruk"),
    ("mangga",         "Mangga"),
    ("jambu_biji",     "Jambu Biji"),
]

async def fetch_and_update_prices():
    """
    Fetch harga dari internet (Google Search) via Gemini AI.
    Update database Supabase agar grafik harga 90 hari terakhir selalu relevan.
    """
    print("[PriceService] Memulai update harga komoditas via AI Web Search...")
    updated = 0

    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "mock":
        print("[PriceService] Skip: Tidak ada API key Gemini")
        return updated

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        crops_str = ", ".join([l for s, l in CROP_LIST])
        prompt = f"""Cari berita/data PIHPS terbaru hari ini tentang harga komoditas pasar tradisional di Indonesia.
Komoditas: {crops_str}
Berikan HANYA format JSON valid seperti ini:
[
  {{ "crop_slug": "slug_sesuai_daftar", "price": 15000, "price_min": 14000, "price_max": 16000 }}
]
Daftar slug yang wajib dipakai: {", ".join([s for s, l in CROP_LIST])}"""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[{"google_search": {}}]
            )
        )
        
        full_text = response.text
        clean = full_text.strip().lstrip("```json").rstrip("```").strip()
        data = json.loads(clean)
        crop_dict = {s: l for s, l in CROP_LIST}
        
        for item in data:
            slug = item.get("crop_slug")
            price = item.get("price")
            if slug in crop_dict and price:
                update_crop_price(
                    crop_name=slug,
                    crop_label=crop_dict[slug],
                    price=price,
                    price_min=item.get("price_min"),
                    price_max=item.get("price_max"),
                    source="Google Search AI"
                )
                updated += 1

    except Exception as e:
        print(f"[PriceService] Fetch gagal: {e}")
        return updated

    print(f"[PriceService] Selesai — {updated} komoditas diupdate")
    return updated
