"""
Enrichment Service — Memperkaya data input petani sebelum dikirim ke AI.
Mengubah data mentah menjadi konteks agronomis yang kaya agar 
Google Search dan Gemini AI bisa memberikan rekomendasi super akurat.
"""
from datetime import datetime, timedelta

# ── Peta Iklim Indonesia per Provinsi ──
# Berdasarkan data BMKG: bulan-bulan musim hujan (curah hujan tinggi)
PROVINCE_RAINY_MONTHS = {
    # Sumatera
    "aceh":               [9, 10, 11, 12, 1],
    "sumatera utara":     [9, 10, 11, 12, 1, 2],
    "sumatera barat":     [9, 10, 11, 12, 1, 2, 3],
    "riau":               [10, 11, 12, 1, 2, 3],
    "jambi":              [10, 11, 12, 1, 2, 3],
    "sumatera selatan":   [10, 11, 12, 1, 2, 3],
    "bengkulu":           [10, 11, 12, 1, 2, 3],
    "lampung":            [10, 11, 12, 1, 2, 3],
    "bangka belitung":    [10, 11, 12, 1, 2, 3],
    "kepulauan riau":     [10, 11, 12, 1, 2],
    # Jawa
    "banten":             [11, 12, 1, 2, 3],
    "dki jakarta":        [11, 12, 1, 2, 3],
    "jawa barat":         [10, 11, 12, 1, 2, 3, 4],
    "jawa tengah":        [11, 12, 1, 2, 3, 4],
    "di yogyakarta":      [11, 12, 1, 2, 3, 4],
    "jawa timur":         [11, 12, 1, 2, 3, 4],
    # Kalimantan
    "kalimantan barat":   [9, 10, 11, 12, 1, 2, 3],
    "kalimantan tengah":  [10, 11, 12, 1, 2, 3],
    "kalimantan selatan": [10, 11, 12, 1, 2, 3],
    "kalimantan timur":   [10, 11, 12, 1, 2, 3],
    "kalimantan utara":   [10, 11, 12, 1, 2, 3],
    # Sulawesi
    "sulawesi utara":     [10, 11, 12, 1, 2],
    "sulawesi tengah":    [11, 12, 1, 2, 3],
    "sulawesi selatan":   [11, 12, 1, 2, 3, 4],
    "sulawesi tenggara":  [12, 1, 2, 3, 4, 5],
    "gorontalo":          [10, 11, 12, 1, 2],
    "sulawesi barat":     [11, 12, 1, 2, 3],
    # Nusa Tenggara & Maluku & Papua
    "bali":               [11, 12, 1, 2, 3],
    "nusa tenggara barat":[11, 12, 1, 2, 3],
    "nusa tenggara timur":[12, 1, 2, 3],
    "maluku":             [5, 6, 7, 8],  # pola terbalik
    "maluku utara":       [5, 6, 7, 8],
    "papua":              [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "papua barat":        [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "papua tengah":       [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "papua pegunungan":   [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "papua selatan":      [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "papua barat daya":   [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}

# ── Suhu rata-rata berdasarkan ketinggian ──
def estimate_temp_range(elevation_m: int) -> tuple[float, float]:
    """Estimasi suhu berdasarkan rumus lapse rate: -0.6°C per 100m kenaikan."""
    base_temp = 28.0  # suhu rata-rata dataran rendah Indonesia
    drop = (elevation_m / 100) * 0.6
    avg = base_temp - drop
    return round(avg - 3, 1), round(avg + 3, 1)


def determine_season(province: str, planting_date: str) -> dict:
    """
    Tentukan musim dan fase iklim berdasarkan provinsi & tanggal tanam.
    Returns: dict dengan season_name, season_phase, growing_months, dll.
    """
    try:
        dt = datetime.strptime(planting_date, "%Y-%m-%d")
    except (ValueError, TypeError):
        return {"season_name": "tidak diketahui", "confidence": "rendah"}

    month = dt.month
    prov_key = (province or "").strip().lower()
    
    rainy = PROVINCE_RAINY_MONTHS.get(prov_key, [11, 12, 1, 2, 3])  # default Jawa
    
    # Tentukan musim saat tanam
    if month in rainy:
        # Cek apakah di awal, tengah, atau akhir musim hujan
        idx = rainy.index(month)
        total = len(rainy)
        if idx < total * 0.3:
            phase = "awal musim hujan"
        elif idx > total * 0.7:
            phase = "akhir musim hujan (transisi ke kemarau)"
        else:
            phase = "puncak musim hujan"
        season_name = "hujan"
    else:
        dry_months = [m for m in range(1, 13) if m not in rainy]
        if month in dry_months:
            idx = dry_months.index(month)
            total = len(dry_months)
            if idx < total * 0.3:
                phase = "awal musim kemarau"
            elif idx > total * 0.7:
                phase = "akhir musim kemarau (transisi ke hujan)"
            else:
                phase = "puncak musim kemarau"
        else:
            phase = "peralihan"
        season_name = "kemarau"

    # Hitung bulan-bulan yang dilalui tanaman (asumsi 4 bulan siklus)
    growing_months = []
    for i in range(5):  # 5 bulan ke depan dari tanggal tanam
        future = dt + timedelta(days=30 * i)
        month_name = future.strftime("%B %Y")
        m = future.month
        is_rainy = m in rainy
        growing_months.append({
            "bulan": month_name,
            "prediksi": "hujan" if is_rainy else "kemarau",
        })

    return {
        "season_name": season_name,
        "season_phase": phase,
        "growing_months": growing_months,
        "confidence": "tinggi" if prov_key in PROVINCE_RAINY_MONTHS else "sedang",
    }


def enrich_input(planting_date: str, elevation_m: int, province: str = None, 
                  city: str = None, soil_type: str = None, 
                  water_source: str = None, land_area_m2: int = None,
                  budget_idr: int = None) -> dict:
    """
    Fungsi utama: memperkaya data input petani menjadi konteks agronomis lengkap.
    Output digunakan untuk membangun prompt AI yang sangat informatif.
    """
    # 1. Klasifikasi ketinggian
    if elevation_m < 200:
        elev_zone = "dataran rendah"
        elev_crops_hint = "padi, jagung, kacang tanah, ubi kayu, cabai, terong"
    elif elevation_m < 500:
        elev_zone = "dataran rendah-menengah"
        elev_crops_hint = "padi, jagung, cabai, tomat, bawang merah, kacang panjang"
    elif elevation_m < 800:
        elev_zone = "dataran menengah"
        elev_crops_hint = "sayuran (sawi, bayam, kangkung), cabai, tomat, jagung"
    elif elevation_m < 1200:
        elev_zone = "dataran tinggi"
        elev_crops_hint = "kentang, wortel, kubis, brokoli, strawberry, bawang putih, daun bawang"
    else:
        elev_zone = "dataran sangat tinggi"
        elev_crops_hint = "kentang, wortel, kubis, teh, kopi arabika"

    # 2. Estimasi suhu
    temp_min, temp_max = estimate_temp_range(elevation_m)

    # 3. Analisis musim
    season_info = determine_season(province, planting_date)

    # 4. Analisis tanah
    soil_analysis = ""
    if soil_type:
        soil_map = {
            "Lempung / Tanah Liat": "pH 5.5-7.0, retensi air tinggi, cocok padi/sayuran",
            "Gambut": "pH 3.0-5.0 (asam), perlu pengapuran, cocok nanas/sawit/kelapa",
            "Pasir": "drainase cepat, perlu irigasi rutin, cocok semangka/melon/kacang tanah",
            "Kapur": "pH 7.0-8.5 (basa), kaya kalsium, cocok jagung/kedelai",
            "Vulkanik / Andosol": "sangat subur, pH 5.5-6.5, cocok hampir semua sayuran & hortikultura",
        }
        soil_analysis = soil_map.get(soil_type, f"Tipe: {soil_type}")

    # 5. Analisis air
    water_analysis = ""
    if water_source:
        water_map = {
            "Tadah Hujan": "RISIKO TINGGI di musim kemarau — pilih tanaman tahan kering",
            "Irigasi Teknis": "pasokan stabil — bisa tanam tanaman intensif air (padi)",
            "Sumur Bor / Pompa": "pasokan sedang — perlu manajemen efisiensi air",
            "Dekat Sungai / Danau": "pasokan baik — cocok untuk tanaman semi-akuatik",
        }
        water_analysis = water_map.get(water_source, f"Sumber: {water_source}")

    # 6. Analisis ekonomi
    budget_analysis = ""
    if budget_idr and land_area_m2:
        per_m2 = budget_idr / land_area_m2
        if per_m2 < 5000:
            budget_analysis = f"Modal sangat terbatas (Rp {per_m2:,.0f}/m²) — prioritaskan tanaman murah bibit (kangkung, bayam, singkong)"
        elif per_m2 < 15000:
            budget_analysis = f"Modal sedang (Rp {per_m2:,.0f}/m²) — bisa tanaman menengah (cabai, tomat, jagung)"
        else:
            budget_analysis = f"Modal cukup (Rp {per_m2:,.0f}/m²) — bisa tanaman intensif (strawberry, paprika, melon)"

    # 7. Bangun konteks pencarian Google
    search_context_hints = []
    if province:
        search_context_hints.append(f"harga komoditas pertanian {province} hari ini")
        search_context_hints.append(f"prakiraan cuaca BMKG {province} {planting_date}")
    if city:
        search_context_hints.append(f"harga sayuran pasar {city} terbaru")

    return {
        "elevation_zone": elev_zone,
        "elevation_crop_hints": elev_crops_hint,
        "temp_range": f"{temp_min}°C – {temp_max}°C",
        "season": season_info,
        "soil_analysis": soil_analysis,
        "water_analysis": water_analysis,
        "budget_analysis": budget_analysis,
        "search_hints": search_context_hints,
    }
