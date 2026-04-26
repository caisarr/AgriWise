'use client'
import { useHistory } from '@/hooks/useHistory'
import Link from 'next/link'
import { useState } from 'react'
import CropCard from '@/components/CropCard'
import { History, Sun, CloudRain, CloudSun, Mountain, MapPin, Sprout, ArrowRight, Printer, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react'

const SEASON_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  kemarau:   { label: 'Kemarau',   icon: Sun,      color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  hujan:     { label: 'Hujan',     icon: CloudRain, color: 'text-sky-400',    bg: 'bg-sky-500/10' },
  peralihan: { label: 'Peralihan', icon: CloudSun,  color: 'text-violet-400', bg: 'bg-violet-500/10' },
}

export default function HistoryPage() {
  const { history, loading } = useHistory()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 print:hidden">
        <div className="w-10 h-10 rounded-xl bg-slate-500/15 flex items-center justify-center">
          <History className="w-5 h-5 text-slate-400" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Riwayat <span className="gradient-text">Rekomendasi</span>
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Pencarian tanaman yang pernah Anda lakukan.
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && history.length === 0 && (
        <div className="glass-card py-20 text-center">
          <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Belum ada riwayat pencarian.</p>
          <Link href="/recommend"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: 'var(--accent)' }}>
            Mulai cari tanaman <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* History items */}
      <div className={`flex flex-col gap-4 stagger ${expandedId ? 'print:gap-0' : ''}`}>
        {history.map((item) => {
          const isOldSeason = ['kemarau', 'hujan', 'peralihan'].includes(item.season)
          const seasonCfg = isOldSeason ? SEASON_CONFIG[item.season] : null
          const SeasonIcon = seasonCfg?.icon ?? CalendarDays
          const isExpanded = expandedId === item.id

          return (
            <div key={item.id} className={`glass-card p-5 animate-fade-in-up ${!isExpanded && expandedId ? 'print:hidden' : ''} ${isExpanded ? 'print:border-none print:p-0 print:bg-transparent' : 'card-hover'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2.5 items-center flex-wrap">
                  {/* Season badge */}
                  <span className={`text-[11px] font-medium flex items-center gap-1.5 border px-2.5 py-1 rounded-lg
                    ${seasonCfg?.color ?? 'text-emerald-400'} ${seasonCfg?.bg ?? 'bg-emerald-500/10'}`}
                    style={{ borderColor: 'var(--border-subtle)' }}>
                    <SeasonIcon className="w-3.5 h-3.5" />
                    {seasonCfg?.label ?? `Tanam: ${item.season}`}
                  </span>

                  <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Mountain className="w-3 h-3" />
                    {item.elevation_m} mdpl
                  </span>
                  {item.province && (
                    <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <MapPin className="w-3 h-3" />
                      {item.province}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 print:hidden">
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-dim)' }}>
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                  <button onClick={() => setExpandedId(isExpanded ? null : item.id)} 
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors border"
                    style={{ borderColor: 'var(--border-subtle)' }}>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>

              {item.season_summary && (
                <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {item.season_summary}
                </p>
              )}

              {!isExpanded ? (
                <div className="flex flex-wrap gap-2 print:hidden">
                  {item.ai_response.slice(0, 5).map((crop: any, i: number) => (
                    <span key={i} className="text-[11px] flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }}>
                      <Sprout className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                      {crop.crop_name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-5 pt-5 border-t print:border-none print:mt-0 print:pt-0" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-white">Detail Rekomendasi Lengkap</h3>
                    <button onClick={() => {
                        setTimeout(() => window.print(), 100)
                      }} 
                      className="flex items-center gap-2 text-[11px] px-3 py-1.5 font-bold print:hidden" 
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'white' }}>
                      <Printer className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                  </div>
                  <div className="grid gap-4">
                    {item.ai_response.map((crop: any, i: number) => (
                      <CropCard key={i} crop={crop} isTopChoice={i === 0} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
