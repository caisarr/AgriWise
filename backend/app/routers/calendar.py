from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from app.core.config import settings

router = APIRouter(prefix="/api", tags=["calendar"])

class CalendarRequest(BaseModel):
    crop_name: str

@router.post("/calendar")
async def generate_calendar(body: CalendarRequest):
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "mock":
        return {"calendar": [
            {"phase": "Persiapan Lahan", "day_range": "Hari 1-7", "tasks": ["Pembersihan gulma", "Pemupukan dasar"]},
            {"phase": "Penanaman & Tumbuh", "day_range": "Hari 8-30", "tasks": ["Penyiraman rutin", "Pengecekan hama awal"]},
            {"phase": "Pemeliharaan Lanjut", "day_range": "Hari 31-60", "tasks": ["Pemupukan susulan", "Pemasangan ajir (jika perlu)"]},
            {"phase": "Panen", "day_range": "Hari 60-90", "tasks": ["Persiapan alat panen", "Pemanenan bertahap"]}
        ]}
    
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = f"""Buatkan kalender tanam (roadmap/timeline) yang praktis untuk menanam {body.crop_name} dari hari ke-0 sampai masa panen.
Kembalikan HANYA dalam format JSON valid (tanpa blok kode markdown). Struktur array seperti ini:
[
  {{ "phase": "Nama Fase", "day_range": "Hari X-Y", "tasks": ["Tugas 1", "Tugas 2"] }}
]"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        import json
        data = json.loads(response.text)
        return {"calendar": data}
    except Exception as e:
        print(f"Calendar error: {e}")
        return {"calendar": []}
