# AgriWise AI — Panduan Deploy Railway + Vercel

## Struktur Deploy

```
GitHub Repo (monorepo)
├── backend/   → Railway  (FastAPI Python)
└── frontend/  → Vercel   (Next.js)
```

---

## 1. Deploy Backend ke Railway

### Langkah:
1. Buka railway.app → New Project → Deploy from GitHub repo
2. Pilih repo `agriwise`
3. Railway akan detect otomatis ada `backend/` — set **Root Directory** = `backend`
4. Railway baca `railway.toml` dan `Procfile` otomatis
5. Tambah **Environment Variables** di Railway dashboard:

```
SUPABASE_URL              = https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJ...
ANTHROPIC_API_KEY         = sk-ant-...
OPENWEATHERMAP_API_KEY    = xxx (opsional)
ALLOWED_ORIGINS           = https://agriwise.vercel.app
```

6. Deploy → Railway generate URL: `https://agriwise-api.up.railway.app`
7. Test: buka `https://agriwise-api.up.railway.app/health` → harus return `{"status":"ok"}`

### railway.toml sudah dikonfigurasi:
- Build: Nixpacks (auto-detect Python)
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/health`
- Auto-restart on failure

---

## 2. Deploy Frontend ke Vercel

### Langkah:
1. Buka vercel.com → New Project → Import GitHub repo
2. Set **Root Directory** = `frontend`
3. Framework: Next.js (auto-detect)
4. Tambah **Environment Variables** di Vercel:

```
NEXT_PUBLIC_SUPABASE_URL      = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
NEXT_PUBLIC_API_URL           = https://agriwise-api.up.railway.app
```

5. Deploy → Vercel generate URL: `https://agriwise.vercel.app`

---

## 3. Update CORS di Railway

Setelah dapat URL Vercel, update env di Railway:
```
ALLOWED_ORIGINS = https://agriwise.vercel.app,http://localhost:3000
```

---

## 4. Setup Supabase

1. Buka supabase.com → New Project → region: Southeast Asia (Singapore)
2. SQL Editor → paste isi `backend/supabase/schema.sql` → Run
3. Pastikan tabel muncul di Table Editor
4. Settings → API → copy URL dan keys ke env Railway & Vercel

---

## Checklist Deploy

- [ ] Supabase schema.sql sudah dijalankan
- [ ] Seed data 10 komoditas ada di crop_prices
- [ ] Realtime enabled untuk crop_prices
- [ ] Railway backend running & /health OK
- [ ] Vercel frontend deployed
- [ ] CORS backend sudah include URL Vercel
- [ ] Test form recommend end-to-end
