'use client'
import { useState } from 'react'
import { Calculator, TrendingUp, Weight, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function KalkulatorPage() {
  const [luas, setLuas] = useState('')
  const [harga, setHarga] = useState('')
  const [yieldPer100, setYieldPer100] = useState('')
  const [modal, setModal] = useState('')

  const formatNumber = (val: string) => {
    const num = val.replace(/\D/g, '')
    return num ? parseInt(num, 10).toLocaleString('id-ID') : ''
  }

  const luasNum = parseFloat(luas.replace(/\D/g, '')) || 0
  const hargaNum = parseFloat(harga.replace(/\D/g, '')) || 0
  const yieldNum = parseFloat(yieldPer100.replace(/\D/g, '')) || 0
  const modalNum = parseFloat(modal.replace(/\D/g, '')) || 0

  const estimasiPanenKg = (luasNum / 100) * yieldNum
  const estimasiPendapatan = estimasiPanenKg * hargaNum
  const labaBersih = estimasiPendapatan - modalNum
  const roi = modalNum > 0 ? (labaBersih / modalNum) * 100 : 0
  const hasInput = luasNum > 0 || hargaNum > 0 || yieldNum > 0 || modalNum > 0

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-amber-400" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Kalkulator <span className="gradient-text">ROI</span>
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Hitung estimasi panen, pendapatan, dan laba bersih pertanian Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="glass-card p-7">
          <div className="flex items-center gap-2 mb-6">
            <Coins className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-[15px]">Input Data</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 block"
                style={{ color: 'var(--text-muted)' }}>
                Luas Lahan (m²)
              </label>
              <input type="text" value={luas} onChange={e => setLuas(formatNumber(e.target.value))}
                placeholder="Misal: 1.000" className="input-field" />
            </div>
            <div>
              <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 block"
                style={{ color: 'var(--text-muted)' }}>
                Modal Awal (Rp)
              </label>
              <input type="text" value={modal} onChange={e => setModal(formatNumber(e.target.value))}
                placeholder="Misal: 5.000.000" className="input-field" />
            </div>
            <div>
              <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 block"
                style={{ color: 'var(--text-muted)' }}>
                Estimasi Hasil per 100m² (kg)
              </label>
              <input type="text" value={yieldPer100} onChange={e => setYieldPer100(formatNumber(e.target.value))}
                placeholder="Misal: 200" className="input-field" />
            </div>
            <div>
              <label className="text-[11px] tracking-[2px] uppercase font-semibold mb-2 block"
                style={{ color: 'var(--text-muted)' }}>
                Harga Jual per Kg (Rp)
              </label>
              <input type="text" value={harga} onChange={e => setHarga(formatNumber(e.target.value))}
                placeholder="Misal: 15.000" className="input-field" />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="glass-card p-7 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: hasInput
              ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.08), rgba(23, 31, 43, 0.6))'
              : 'var(--glass-bg)',
          }}>

          {/* Decorative glow */}
          {hasInput && (
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15 blur-3xl"
              style={{ background: labaBersih >= 0 ? '#34d399' : '#ef4444' }} />
          )}

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h3 className="font-bold text-white text-[15px]">Proyeksi Hasil</h3>
            </div>

            <div className="space-y-6">
              {/* Estimasi Panen */}
              <div>
                <p className="text-[11px] uppercase tracking-widest font-medium mb-1.5"
                  style={{ color: 'var(--text-muted)' }}>
                  Total Estimasi Panen
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-white">
                    {estimasiPanenKg.toLocaleString("id-ID")}
                  </p>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-dim)' }}>kg</span>
                </div>
              </div>

              {/* Pendapatan Kotor */}
              <div>
                <p className="text-[11px] uppercase tracking-widest font-medium mb-1.5"
                  style={{ color: 'var(--text-muted)' }}>
                  Estimasi Pendapatan Kotor
                </p>
                <p className="text-2xl font-bold text-white">
                  Rp {estimasiPendapatan.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Laba Bersih */}
              <div className="pt-5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-[11px] uppercase tracking-widest font-bold mb-1.5"
                  style={{ color: 'var(--accent)' }}>
                  Laba Bersih (Keuntungan)
                </p>
                <div className="flex items-center gap-3">
                  <p className={`text-4xl font-black ${labaBersih >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    Rp {labaBersih.toLocaleString("id-ID")}
                  </p>
                  {hasInput && (
                    labaBersih >= 0
                      ? <ArrowUpRight className="w-6 h-6 text-emerald-400" />
                      : <ArrowDownRight className="w-6 h-6 text-red-400" />
                  )}
                </div>
                {modalNum > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      Return on Investment (ROI):
                    </span>
                    <span className={`text-sm font-bold px-2.5 py-0.5 rounded-md ${
                      roi >= 0
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-red-400 bg-red-500/10'
                    }`}>
                      {roi.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
