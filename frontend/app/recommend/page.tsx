'use client'
import { useState } from 'react'
import { fetchRecommendations } from '@/lib/api'
import type { RecommendResult, Season } from '@/lib/types'
import CropCard from '@/components/CropCard'
import ChatWidget from '@/components/ChatWidget'
import { Sun, CloudRain, CloudSun, Search, Sprout, MapPin, Mountain, Landmark, Droplets, UserCheck, Wallet, Printer, CalendarDays } from 'lucide-react'

export default function RecommendPage() {
  const [plantingDate, setPlantingDate]       = useState('')
  const [elevation, setElevation] = useState('')
  const [province, setProvince]   = useState('')
  const [city, setCity]           = useState('')
  const [landArea, setLandArea]   = useState('')
  const [budget, setBudget]       = useState('')
  const [soilType, setSoilType]   = useState('')
  const [waterSource, setWaterSource] = useState('')
  const [experience, setExperience] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [result, setResult]       = useState<RecommendResult | null>(null)

  const formatNumber = (val: string) => {
    const num = val.replace(/\D/g, '')
    return num ? parseInt(num, 10).toLocaleString('id-ID') : ''
  }

  async function handleSubmit() {
    if (!plantingDate || !elevation) { setError('Tanggal tanam dan ketinggian wajib diisi'); return }
    setError('')
    setLoading(true)
    try {
      const data = await fetchRecommendations({
        planting_date: plantingDate,
        elevation_m:   parseInt(elevation.replace(/\D/g, '') || '0'),
        province:      province || undefined,
        city:          city || undefined,
        land_area_m2:  landArea ? parseInt(landArea.replace(/\D/g, '')) : undefined,
        budget_idr:    budget   ? parseInt(budget.replace(/\D/g, '')) : undefined,
        soil_type:     soilType || undefined,
        water_source:  waterSource || undefined,
        experience:    experience || undefined,
      })
      setResult(data)
    } catch {
      setError('Gagal menghubungi server. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in-up">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050a06]/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card p-8 flex flex-col items-center text-center max-w-sm w-full mx-4 border-emerald-500/30">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 animate-pulse">
              <Search className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Sedang Bekerja...</h3>
            <p className="text-[13px] leading-relaxed text-emerald-100/70 mb-5">
              Mengambil data cuaca satelit dan mencocokkan miliaran parameter tanaman dengan profil lahan Anda.
            </p>
            <div className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20 flex items-center gap-2">
              <span className="animate-ping w-2 h-2 rounded-full bg-amber-400"></span>
              Mohon jangan refresh halaman
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-emerald-400" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              Rekomendasi <span className="gradient-text">Tanaman</span>
            </h1>
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Isi form di bawah, AI akan mencari tanaman terbaik untuk kondisi Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="glass-card p-7 mb-8 print:hidden">
        {/* Tanggal Tanam */}
        <div className="mb-7">
          <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-3 flex items-center gap-2"
            style={{ color: 'var(--text-muted)' }}>
            <CalendarDays className="w-3.5 h-3.5" />
            Rencana Tanggal Tanam <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={plantingDate}
            onChange={e => setPlantingDate(e.target.value)}
            className="input-field cursor-pointer"
            style={{ colorScheme: 'dark' }}
          />
          <p className="text-[11px] mt-2" style={{ color: 'var(--accent)' }}>
            AI akan menyocokkan tanggal ini dengan prakiraan cuaca satelit wilayah Anda.
          </p>
        </div>

        {/* Ketinggian */}
        <div className="mb-6">
          <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 flex items-center gap-2"
            style={{ color: 'var(--text-muted)' }}>
            <Mountain className="w-3.5 h-3.5" />
            Ketinggian Lahan (mdpl) <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={elevation}
            onChange={e => setElevation(formatNumber(e.target.value))}
            placeholder="Contoh: 800"
            className="input-field"
          />
          <p className="text-[11px] mt-2 flex gap-3" style={{ color: 'var(--text-dim)' }}>
            <span>Rendah: 0–300</span>
            <span>·</span>
            <span>Sedang: 300–700</span>
            <span>·</span>
            <span>Tinggi: 700+</span>
          </p>
        </div>

        {/* Grid: Provinsi, Kota, Luas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}>
              <MapPin className="w-3.5 h-3.5" />
              Provinsi
            </label>
            <input type="text" value={province} onChange={e => setProvince(e.target.value)}
              placeholder="Contoh: Jawa Barat" className="input-field" />
          </div>
          <div>
            <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}>
              <Landmark className="w-3.5 h-3.5" />
              Kota / Kab
            </label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)}
              placeholder="Contoh: Bandung" className="input-field" />
          </div>
          <div>
            <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 block"
              style={{ color: 'var(--text-muted)' }}>
              Luas Lahan (m²)
            </label>
            <input type="text" value={landArea} onChange={e => setLandArea(formatNumber(e.target.value))}
              placeholder="Contoh: 500" className="input-field" />
          </div>
        </div>

        {/* Budget */}
        <div className="mb-6">
          <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 flex items-center gap-2"
            style={{ color: 'var(--text-muted)' }}>
            <Wallet className="w-3.5 h-3.5" />
            Budget Modal (Rp)
          </label>
          <input type="text" value={budget} onChange={e => setBudget(formatNumber(e.target.value))}
            placeholder="Contoh: 5.000.000" className="input-field" />
        </div>

        {/* Detail Pertanian */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
          <div>
            <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 block"
              style={{ color: 'var(--text-muted)' }}>
              Jenis Tanah
            </label>
            <select value={soilType} onChange={e => setSoilType(e.target.value)} className="input-field">
              <option value="">Pilih Jenis Tanah</option>
              <option value="Lempung / Tanah Liat">Lempung / Tanah Liat</option>
              <option value="Gambut">Gambut</option>
              <option value="Pasir">Berpasir</option>
              <option value="Kapur">Kapur</option>
              <option value="Vulkanik / Andosol">Vulkanik / Andosol</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}>
              <Droplets className="w-3.5 h-3.5" />
              Sumber Air
            </label>
            <select value={waterSource} onChange={e => setWaterSource(e.target.value)} className="input-field">
              <option value="">Pilih Pengairan</option>
              <option value="Tadah Hujan">Tadah Hujan</option>
              <option value="Irigasi Teknis">Irigasi Teknis</option>
              <option value="Sumur Bor / Pompa">Sumur Bor / Pompa</option>
              <option value="Dekat Sungai / Danau">Sungai / Danau</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}>
              <UserCheck className="w-3.5 h-3.5" />
              Pengalaman
            </label>
            <select value={experience} onChange={e => setExperience(e.target.value)} className="input-field">
              <option value="">Pilih Pengalaman</option>
              <option value="Pemula">Baru Mulai (Pemula)</option>
              <option value="Menengah">Menengah</option>
              <option value="Ahli">Profesional (Ahli)</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-[13px] font-medium"
            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          <Sprout className="w-4 h-4" />
          Dapatkan Rekomendasi
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-fade-in-up">
          {result.season_summary && (
            <div className="glass-card p-4 mb-6 flex items-start gap-3"
              style={{ borderColor: 'var(--accent-border)', background: 'var(--accent-soft)' }}>
              <Sprout className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
              <p className="text-[13px] leading-relaxed" style={{ color: '#a7f3d0' }}>
                {result.season_summary}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Tanaman yang Disarankan</h2>
            <div className="flex items-center gap-3">
              <span className="text-[11px] px-3 py-1 rounded-full"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                {result.duration_ms}ms · {result.recommendations.length} tanaman
              </span>
              <button onClick={() => window.print()} className="flex items-center gap-2 text-[11px] px-3 py-1.5 font-bold print:hidden" 
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white' }}>
                <Printer className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>

          <div className="grid gap-4 stagger">
            {result.recommendations.map((crop, i) => (
              <CropCard key={i} crop={crop} isTopChoice={i === 0} />
            ))}
          </div>

          <ChatWidget context={JSON.stringify(result.recommendations)} />
        </div>
      )}
    </div>
  )
}
