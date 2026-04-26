from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64
from google import genai
from google.genai import types
from app.core.config import settings

router = APIRouter(prefix="/api", tags=["diagnosis"])

class DiagnosisRequest(BaseModel):
    image_base64: str

@router.post("/diagnosis")
async def diagnose_plant(body: DiagnosisRequest):
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "mock":
        return {"diagnosis": "Mode Mock: Ini adalah respons simulasi karena API Key belum diatur.\n\n**1. Nama Penyakit:** Bercak Daun (Cercospora)\n**2. Penyebab:** Jamur Cercospora sp. akibat kelembaban tinggi.\n**3. Penanganan Organik:** Semprotkan fungisida nabati dari ekstrak daun sirih.\n**4. Penanganan Kimia:** Gunakan fungisida berbahan aktif Mankozeb."}
    
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        image_data = body.image_base64
        mime_type = "image/jpeg"
        if image_data.startswith("data:image"):
            header, image_data = image_data.split(",", 1)
            mime_type = header.split(";")[0].split(":")[1]
            
        img_bytes = base64.b64decode(image_data)
        
        prompt = "Kamu adalah dokter tanaman/ahli hama penyakit (Plant Pathologist). Analisis gambar daun/tanaman ini. Sebutkan: 1. Diagnosis penyakit/hama, 2. Penyebabnya, 3. Cara penanganan organik, 4. Cara penanganan kimiawi. Jawab dengan markdown yang rapi."
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=img_bytes, mime_type=mime_type),
                prompt
            ]
        )
        return {"diagnosis": response.text}
    except Exception as e:
        print(f"Diagnosis error: {e}")
        raise HTTPException(status_code=500, detail="Gagal menganalisis gambar.")
