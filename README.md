# AgriWise AI 🌱

Sistem rekomendasi tanaman berbasis AI untuk petani Indonesia.
Input: musim + ketinggian → Output: rekomendasi tanaman + harga realtime.

## Stack
- **Frontend**: Next.js 14 + Tailwind CSS + Supabase JS
- **Backend**: FastAPI (Python) + Supabase + Claude AI
- **Database**: Supabase (PostgreSQL + Realtime)
- **Deploy**: Railway (backend) + Vercel (frontend)

## Quick Start

```bash
# Clone & setup
git clone https://github.com/yourname/agriwise.git
cd agriwise

# Backend
cd backend
cp .env.example .env        # isi API keys
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (terminal baru)
cd frontend
cp .env.example .env.local  # isi Supabase keys
npm install
npm run dev
```

## Deploy

- **Backend** → Railway: connect repo, set root directory = `backend`, Railway auto-detect Python
- **Frontend** → Vercel: connect repo, set root directory = `frontend`

Lihat `/infra/` untuk konfigurasi Railway dan Docker lengkap.
