'use client'
import { useState } from 'react'
import { generateCalendar } from '@/lib/api'
import { CalendarDays, Search, Sprout, CheckCircle2, Printer } from 'lucide-react'

export default function KalenderPage() {
  const [crop, setCrop] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any[] | null>(null)

  async function handleGenerate() {
    if (!crop.trim()) return
    setLoading(true)
    try {
      const res = await generateCalendar(crop)
      setResult(res.calendar)
    } catch {
      setResult(null)
      alert('Gagal membuat kalender.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-violet-400" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Kalender <span className="gradient-text">Tanam</span>
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Dapatkan panduan langkah demi langkah merawat tanaman dari hari ke-0 hingga panen.
          </p>
        </div>
      </div>

      <div className="glass-card p-7">
        {/* Input row */}
        <div className="flex gap-3 mb-2 print:hidden">
          <div className="flex-1 relative">
            <Sprout className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
            <input
              type="text"
              value={crop}
              onChange={e => setCrop(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="Contoh: Bawang Merah"
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!crop.trim() || loading}
            className="btn-primary flex items-center gap-2 px-6 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
          >
            {loading ? (
              <>
                <Search className="w-4 h-4 animate-spin" />
                Membuat...
              </>
            ) : (
              <>
                <CalendarDays className="w-4 h-4" />
                Buat Kalender
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] mb-0 print:hidden" style={{ color: 'var(--text-dim)' }}>
          Masukkan nama tanaman, lalu AI akan membuat jadwal perawatan lengkap.
        </p>

        {/* Calendar result */}
        {result && result.length > 0 && (
          <div className="mt-8 pt-6 border-t animate-fade-in-up print:mt-0 print:pt-0 print:border-none" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-bold text-white">
                  Roadmap <span className="text-violet-400">Penanaman {crop}</span>
                </h3>
              </div>
              <button onClick={() => window.print()} className="flex items-center gap-2 text-[11px] px-3 py-1.5 font-bold print:hidden" 
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white' }}>
                <Printer className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
            
            <div className="relative pl-3">
              {/* Timeline Line */}
              <div className="absolute top-3 bottom-5 left-[23px] w-0.5" style={{ background: 'var(--border-subtle)' }} />
              
              <div className="space-y-6">
                {result.map((item, idx) => (
                  <div key={idx} className="relative flex gap-5 animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                    {/* Timeline Dot */}
                    <div className="w-[18px] h-[18px] rounded-full mt-1.5 flex-shrink-0 z-10"
                      style={{ 
                        background: 'var(--bg-primary)',
                        border: '3px solid #8b5cf6',
                        boxShadow: '0 0 0 4px var(--bg-primary)'
                      }} 
                    />
                    
                    {/* Content Card */}
                    <div className="flex-1 glass-card p-5" style={{ borderColor: 'var(--border-subtle)' }}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                        <h4 className="font-bold text-white text-[15px]">{item.phase}</h4>
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                          style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd' }}>
                          {item.day_range}
                        </span>
                      </div>
                      <ul className="space-y-2 mt-2">
                        {item.tasks && item.tasks.map((task: string, i: number) => (
                          <li key={i} className="text-[13px] flex items-start gap-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            <span className="text-violet-400 mt-0.5">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
