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

# Mapping tanaman → keyword pencarian harga (50 Komoditas Utama Pertanian & Perkebunan)
CROP_LIST = [
    # ── Sayuran Daun & Bunga ──
    ("bayam",          "Bayam"),
    ("kangkung",       "Kangkung"),
    ("sawi_hijau",     "Sawi Hijau"),
    ("sawi_putih",     "Sawi Putih"),
    ("kubis",          "Kubis (Kol)"),
    ("brokoli",        "Brokoli"),
    ("kembang_kol",    "Kembang Kol"),
    ("seledri",        "Seledri"),
    ("daun_bawang",    "Daun Bawang"),
    
    # ── Sayuran Buah & Polong ──
    ("tomat",          "Tomat"),
    ("cabai_merah",    "Cabai Merah Keriting"),
    ("cabai_rawit",    "Cabai Rawit Merah"),
    ("cabai_hijau",    "Cabai Hijau"),
    ("terong",         "Terong Ungu"),
    ("timun",          "Mentimun"),
    ("kacang_panjang", "Kacang Panjang"),
    ("buncis",         "Buncis"),
    ("labu_siam",      "Labu Siam"),
    ("pare",           "Pare"),

    # ── Umbi & Akar ──
    ("bawang_merah",   "Bawang Merah"),
    ("bawang_putih",   "Bawang Putih"),
    ("bawang_bombay",  "Bawang Bombay"),
    ("kentang",        "Kentang"),
    ("wortel",         "Wortel"),
    ("singkong",       "Singkong"),
    ("ubi_jalar",      "Ubi Jalar"),
    ("jahe",           "Jahe"),
    ("kunyit",         "Kunyit"),
    ("lengkuas",       "Lengkuas"),

    # ── Pangan Pokok & Palawija ──
    ("padi",           "Beras / Gabah"),
    ("jagung",         "Jagung Pipilan"),
    ("kedelai",        "Kedelai"),
    ("kacang_tanah",   "Kacang Tanah"),
    ("kacang_hijau",   "Kacang Hijau"),

    # ── Buah-Buahan ──
    ("pisang",         "Pisang"),
    ("semangka",       "Semangka"),
    ("melon",          "Melon"),
    ("pepaya",         "Pepaya"),
    ("jeruk",          "Jeruk"),
    ("mangga",         "Mangga"),
    ("alpukat",        "Alpukat"),
    ("nanas",          "Nanas"),
    ("apel",           "Apel"),

    # ── Perkebunan & Komersial ──
    ("kelapa_sawit",   "Kelapa Sawit (TBS)"),
    ("kopi_arabika",   "Kopi Arabika"),
    ("kopi_robusta",   "Kopi Robusta"),
    ("kakao",          "Kakao / Cokelat"),
    ("karet",          "Karet"),
    ("tebu",           "Tebu / Gula Pasir"),
    ("cengkeh",        "Cengkeh"),
    ("lada",           "Lada Hitam / Putih")
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
        crop_dict = {s: l for s, l in CROP_LIST}
        
        # Batch proses per 10 komoditas agar AI lebih teliti mencari data di Web
        chunk_size = 10
        for i in range(0, len(CROP_LIST), chunk_size):
            chunk = CROP_LIST[i:i + chunk_size]
            crops_str = ", ".join([l for s, l in chunk])
            slugs_str = ", ".join([s for s, l in chunk])
            
            print(f"[PriceService] Memproses batch {i//chunk_size + 1}: {crops_str}")
            
            prompt = f"""Cari berita/data PIHPS terbaru hari ini tentang harga komoditas pasar tradisional di Indonesia.
Komoditas: {crops_str}
Berikan HANYA format JSON valid seperti ini:
[
  {{ "crop_slug": "slug_sesuai_daftar", "price": 15000, "price_min": 14000, "price_max": 16000 }}
]
Daftar slug yang WAJIB dipakai: {slugs_str}"""

            try:
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
                print(f"[PriceService] Gagal memproses batch {i//chunk_size + 1}: {e}")

    except Exception as e:
        print(f"[PriceService] Fetch gagal total: {e}")
        return updated

    print(f"[PriceService] Selesai — {updated}/{len(CROP_LIST)} komoditas diupdate")
    return updated
