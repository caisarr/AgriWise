"""
Validator Service — Memvalidasi output AI sebelum dikirim ke frontend.
Menangkap halusinasi AI seperti harga tidak masuk akal, harvest days aneh, dll.
"""

# Rentang harga wajar per kg komoditas Indonesia (Rp)
PRICE_RANGES = {
    "default":       (500, 200000),
    "padi":          (4000, 9000),
    "jagung":        (3000, 8000),
    "cabai_merah":   (15000, 120000),
    "bawang_merah":  (15000, 80000),
    "bawang_putih":  (20000, 80000),
    "tomat":         (5000, 30000),
    "kentang":       (8000, 25000),
    "wortel":        (6000, 20000),
    "bayam":         (5000, 20000),
    "kangkung":      (3000, 15000),
    "singkong":      (1500, 5000),
    "sawi":          (4000, 18000),
    "kacang_panjang":(8000, 25000),
}

# Rentang wajar harvest duration (hari)
HARVEST_RANGES = {
    "default": (20, 365),
    "bayam": (20, 35),
    "kangkung": (20, 30),
    "sawi": (25, 45),
    "cabai_merah": (60, 150),
    "tomat": (60, 120),
    "padi": (90, 130),
    "jagung": (60, 110),
    "kentang": (80, 120),
    "singkong": (180, 365),
}


def validate_and_fix_recommendations(ai_result: dict) -> dict:
    """
    Validasi dan perbaiki output AI sebelum dikirim ke frontend.
    Returns: dict yang sudah dibersihkan + field 'validation_notes' jika ada koreksi.
    """
    if not ai_result or "recommendations" not in ai_result:
        return ai_result

    notes = []
    recommendations = ai_result.get("recommendations", [])

    for i, crop in enumerate(recommendations):
        slug = crop.get("crop_slug", "")
        name = crop.get("crop_name", f"Tanaman #{i+1}")

        # ── Validasi Harga ──
        price = crop.get("avg_price_per_kg", 0)
        price_range = PRICE_RANGES.get(slug, PRICE_RANGES["default"])
        
        if not isinstance(price, (int, float)):
            try:
                price = int(str(price).replace(".", "").replace(",", ""))
                crop["avg_price_per_kg"] = price
            except (ValueError, TypeError):
                price = 0

        if price <= 0:
            # Gunakan rata-rata dari rentang wajar
            midpoint = (price_range[0] + price_range[1]) // 2
            crop["avg_price_per_kg"] = midpoint
            crop["price_source"] = (crop.get("price_source", "") + " (estimasi sistem)").strip()
            notes.append(f"{name}: harga kosong, diganti estimasi Rp {midpoint:,}")
        elif price < price_range[0]:
            notes.append(f"{name}: harga Rp {price:,} di bawah rentang wajar ({price_range[0]:,}-{price_range[1]:,})")
        elif price > price_range[1]:
            notes.append(f"{name}: harga Rp {price:,} di atas rentang wajar ({price_range[0]:,}-{price_range[1]:,})")

        # ── Validasi Harvest Duration ──
        days = crop.get("harvest_duration_days", 0)
        harvest_range = HARVEST_RANGES.get(slug, HARVEST_RANGES["default"])
        
        if not isinstance(days, (int, float)) or days <= 0:
            midpoint = (harvest_range[0] + harvest_range[1]) // 2
            crop["harvest_duration_days"] = midpoint
            notes.append(f"{name}: harvest days kosong, diganti {midpoint} hari")
        elif days < harvest_range[0] or days > harvest_range[1]:
            notes.append(f"{name}: harvest {days} hari di luar rentang wajar ({harvest_range[0]}-{harvest_range[1]})")

        # ── Validasi Yield ──
        yield_kg = crop.get("estimated_yield_per_100m2_kg", 0)
        if not isinstance(yield_kg, (int, float)) or yield_kg <= 0:
            crop["estimated_yield_per_100m2_kg"] = 100  # fallback default
            notes.append(f"{name}: yield kosong, diganti default 100 kg/100m²")
        elif yield_kg > 5000:
            crop["estimated_yield_per_100m2_kg"] = 500
            notes.append(f"{name}: yield {yield_kg} kg terlalu tinggi, dikoreksi ke 500")

        # ── Validasi Field Wajib ──
        if not crop.get("reason"):
            crop["reason"] = "Tanaman ini cocok untuk kondisi lahan dan iklim yang diberikan."
        if not crop.get("tips"):
            crop["tips"] = "Pastikan drainase lahan baik dan lakukan pemupukan rutin."
        if not crop.get("difficulty_level") or crop["difficulty_level"] not in ["mudah", "sedang", "sulit"]:
            crop["difficulty_level"] = "sedang"
        if not crop.get("price_trend") or crop["price_trend"] not in ["naik", "turun", "stabil"]:
            crop["price_trend"] = "stabil"

    # Tambahkan catatan validasi jika ada koreksi
    if notes:
        ai_result["validation_notes"] = notes
        print(f"[Validator] {len(notes)} koreksi dilakukan: {notes}")

    return ai_result
