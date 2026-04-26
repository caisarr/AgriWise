'use client'
import { useState } from 'react'
import { diagnosePlant } from '@/lib/api'
import { Stethoscope, Upload, Camera, Search, CheckCircle2 } from 'lucide-react'

export default function DokterPage() {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setImage(event.target?.result as string)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  async function handleDiagnose() {
    if (!image) return
    setLoading(true)
    try {
      const res = await diagnosePlant(image)
      setResult(res.diagnosis)
    } catch (err) {
      setResult('Gagal mendiagnosis gambar. Pastikan backend menyala.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-sky-400" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Dokter <span className="gradient-text">Tanaman</span>
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Upload foto daun sakit atau hama, AI akan mendiagnosis dan memberi resep penanganan.
          </p>
        </div>
      </div>

      <div className="glass-card p-7">
        {/* Upload Zone */}
        <label className="block rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200 mb-6 group
          hover:border-sky-400/50 hover:bg-sky-500/[0.03]"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4
              group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-7 h-7 text-sky-400" />
            </div>
            <p className="text-sm font-bold text-white mb-1">Klik untuk upload foto tanaman</p>
            <p className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
              Format JPG / PNG · Maksimal 5MB
            </p>
          </div>
        </label>

        {/* Image preview */}
        {image && (
          <div className="mb-6 rounded-xl overflow-hidden border max-h-72 flex justify-center animate-fade-in"
            style={{ borderColor: 'var(--border-default)', background: 'rgba(0,0,0,0.3)' }}>
            <img src={image} alt="Preview" className="max-h-72 object-contain" />
          </div>
        )}

        {/* Diagnose button */}
        <button
          onClick={handleDiagnose}
          disabled={!image || loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
          style={!image ? {} : { background: 'linear-gradient(135deg, #0284c7, #38bdf8)' }}
        >
          {loading ? (
            <>
              <Search className="w-4 h-4 animate-spin" />
              AI Sedang Mendiagnosis...
            </>
          ) : (
            <>
              <Stethoscope className="w-4 h-4" />
              Analisis Penyakit
            </>
          )}
        </button>

        {/* Diagnosis result */}
        {result && (
          <div className="mt-8 pt-6 border-t animate-fade-in-up" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h3 className="text-lg font-bold gradient-text">Hasil Diagnosis</h3>
            </div>
            <div className="rounded-xl p-5 text-[13px] leading-relaxed whitespace-pre-wrap"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}>
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
