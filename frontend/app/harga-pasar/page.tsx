'use client'
import { useState, useEffect } from 'react'
import { Store, TrendingUp, TrendingDown, Minus, Search, RefreshCw, ArrowUpRight, Package, MapPin } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL

interface CropPrice {
  crop_name: string
  crop_label: string
  price_per_kg: number
  price_min: number | null
  price_max: number | null
  recorded_at: string
  source?: string
}

const TREND_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  naik:   { icon: TrendingUp,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: '↑ Naik' },
  turun:  { icon: TrendingDown, color: 'text-red-400',     bg: 'bg-red-500/10',     label: '↓ Turun' },
  stabil: { icon: Minus,        color: 'text-slate-400',   bg: 'bg-slate-500/10',   label: '— Stabil' },
}

const COMMODITY_ICONS: Record<string, string> = {
  // Sayuran Daun & Bunga
  bayam: '🥬', kangkung: '🌿', sawi_hijau: '🥬', sawi_putih: '🥬', kubis: '🥬', brokoli: '🥦', kembang_kol: '🥦', seledri: '🌿', daun_bawang: '🧅',
  // Sayuran Buah & Polong
  tomat: '🍅', cabai_merah: '🌶️', cabai_rawit: '🌶️', cabai_hijau: '🌶️', terong: '🍆', timun: '🥒', kacang_panjang: '🫛', buncis: '🫛', labu_siam: '🍐', pare: '🥒',
  // Umbi & Akar
  bawang_merah: '🧅', bawang_putih: '🧄', bawang_bombay: '🧅', kentang: '🥔', wortel: '🥕', singkong: '🫘', ubi_jalar: '🍠', jahe: '🫚', kunyit: '🫚', lengkuas: '🫚',
  // Pangan Pokok & Palawija
  padi: '🌾', jagung: '🌽', kedelai: '🫘', kacang_tanah: '🥜', kacang_hijau: '🫘',
  // Buah-buahan
  pisang: '🍌', semangka: '🍉', melon: '🍈', pepaya: '🥭', jeruk: '🍊', mangga: '🥭', alpukat: '🥑', nanas: '🍍', apel: '🍎',
  // Perkebunan & Komersial
  kelapa_sawit: '🌴', kopi_arabika: '☕', kopi_robusta: '☕', kakao: '🍫', karet: '🌳', tebu: '🎋', cengkeh: '🍂', lada: '🧂'
}

export default function PasarPage() {
  const [prices, setPrices]     = useState<CropPrice[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [sortBy, setSortBy]     = useState<'name' | 'price_asc' | 'price_desc'>('name')

  useEffect(() => {
    fetchPrices()
  }, [])

  async function fetchPrices() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/prices`)
      const data = await res.json()
      setPrices(data.prices || [])
    } catch (e) {
      console.error('Gagal memuat harga:', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = prices
    .filter(p => 
      p.crop_label?.toLowerCase().includes(search.toLowerCase()) ||
      p.crop_name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price_per_kg || 0) - (b.price_per_kg || 0)
      if (sortBy === 'price_desc') return (b.price_per_kg || 0) - (a.price_per_kg || 0)
      return (a.crop_label || '').localeCompare(b.crop_label || '')
    })

  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((sum, p) => sum + (p.price_per_kg || 0), 0) / prices.length)
    : 0
  const highestPrice = prices.length > 0
    ? prices.reduce((max, p) => (p.price_per_kg || 0) > (max.price_per_kg || 0) ? p : max, prices[0])
    : null
  const lowestPrice = prices.length > 0
    ? prices.reduce((min, p) => (p.price_per_kg || 0) < (min.price_per_kg || 0) ? p : min, prices[0])
    : null

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Store className="w-5 h-5 text-orange-400" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              Pasar <span className="gradient-text">Komoditas</span>
            </h1>
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Pantau harga pasar komoditas pertanian Indonesia secara real-time.
            </p>
          </div>
        </div>
        <button onClick={fetchPrices} disabled={loading}
          className="flex items-center gap-2 text-[12px] px-4 py-2 font-bold rounded-lg transition-all hover:bg-white/5"
          style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {prices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 stagger">
          {/* Total Komoditas */}
          <div className="glass-card p-5 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-orange-400" />
              <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
                Total Komoditas
              </p>
            </div>
            <p className="text-3xl font-black text-white">{prices.length}</p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-dim)' }}>
              Rata-rata Rp {avgPrice.toLocaleString('id-ID')}/kg
            </p>
          </div>

          {/* Harga Tertinggi */}
          {highestPrice && (
            <div className="glass-card p-5 animate-fade-in-up" style={{ borderColor: 'rgba(239, 68, 68, 0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-red-400" />
                <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Harga Tertinggi
                </p>
              </div>
              <p className="text-2xl font-black text-red-400">
                Rp {(highestPrice.price_per_kg || 0).toLocaleString('id-ID')}
              </p>
              <p className="text-[12px] mt-1 font-medium text-white">
                {COMMODITY_ICONS[highestPrice.crop_name] || '🌱'} {highestPrice.crop_label}
              </p>
            </div>
          )}

          {/* Harga Terendah */}
          {lowestPrice && (
            <div className="glass-card p-5 animate-fade-in-up" style={{ borderColor: 'rgba(52, 211, 153, 0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Harga Terendah
                </p>
              </div>
              <p className="text-2xl font-black text-emerald-400">
                Rp {(lowestPrice.price_per_kg || 0).toLocaleString('id-ID')}
              </p>
              <p className="text-[12px] mt-1 font-medium text-white">
                {COMMODITY_ICONS[lowestPrice.crop_name] || '🌱'} {lowestPrice.crop_label}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search & Sort */}
      <div className="glass-card p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari komoditas... (cabai, bawang, tomat, dll)"
              className="input-field pl-11"
            />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="input-field w-auto" style={{ minWidth: '180px' }}>
            <option value="name">Urutkan: A–Z</option>
            <option value="price_desc">Harga: Tertinggi</option>
            <option value="price_asc">Harga: Terendah</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton h-44 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="glass-card py-16 text-center">
          <Store className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm mb-2 text-white font-semibold">
            {search ? `Tidak ditemukan komoditas "${search}"` : 'Belum ada data harga'}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {search ? 'Coba kata kunci lain.' : 'Data harga akan tersedia setelah scheduler berjalan.'}
          </p>
        </div>
      )}

      {/* Commodity Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {filtered.map((item, idx) => {
            const emoji = COMMODITY_ICONS[item.crop_name] || '🌱'
            const updated = item.recorded_at 
              ? new Date(item.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : null

            return (
              <div key={item.crop_name} className="glass-card card-hover p-5 animate-fade-in-up group"
                style={{ animationDelay: `${idx * 60}ms` }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl
                      group-hover:scale-110 transition-transform duration-300">
                      {emoji}
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-white">{item.crop_label}</h3>
                      <p className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>{item.crop_name}</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(0,0,0,0.25)' }}>
                  <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Harga Per Kg</p>
                  <p className="text-xl font-black text-white">
                    {item.price_per_kg > 0 
                      ? `Rp ${item.price_per_kg.toLocaleString('id-ID')}`
                      : <span style={{ color: 'var(--text-dim)' }}>Belum tersedia</span>
                    }
                  </p>
                  {item.price_min != null && item.price_max != null && (
                    <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-dim)' }}>
                      Rentang: Rp {item.price_min.toLocaleString('id-ID')} — Rp {item.price_max.toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {updated && (
                    <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                      Update: {updated}
                    </p>
                  )}
                  {item.source && (
                    <p className="text-[10px] italic" style={{ color: 'var(--text-dim)' }}>
                      {item.source}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info Footer */}
      <div className="glass-card p-4 mt-8 flex items-start gap-3"
        style={{ borderColor: 'rgba(245, 158, 11, 0.15)', background: 'rgba(245, 158, 11, 0.04)' }}>
        <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-bold text-amber-300 mb-1">Tentang Data Harga</p>
          <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Harga diambil secara otomatis setiap 6 jam dari berbagai sumber termasuk PIHPS Kementan, Panel Harga Pangan, 
            dan pasar tradisional Indonesia menggunakan AI. Harga bersifat indikatif dan dapat berbeda di setiap daerah.
          </p>
        </div>
      </div>
    </div>
  )
}
