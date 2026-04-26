'use client'
import { useLivePrices } from '@/hooks/useLivePrices'
import type { CropRecommendation } from '@/lib/types'
import { TrendingUp, TrendingDown, Minus, CalendarDays, Lightbulb, Weight, Timer, Star } from 'lucide-react'
import PriceChart from '@/components/PriceChart'

const DIFFICULTY: Record<string, { label: string; color: string; bg: string; border: string }> = {
  mudah: { label: 'Mudah', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  sedang: { label: 'Sedang', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  sulit: { label: 'Sulit', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
}

const TREND_ICON: Record<string, React.ElementType> = {
  naik: TrendingUp,
  turun: TrendingDown,
  stabil: Minus,
}

const TREND_COLOR: Record<string, string> = {
  naik: 'text-emerald-400',
  turun: 'text-red-400',
  stabil: 'text-slate-400',
}

interface Props {
  crop: CropRecommendation
  isTopChoice?: boolean
}

export default function CropCard({ crop, isTopChoice }: Props) {
  const { prices } = useLivePrices([crop.crop_slug])
  const livePrice  = prices[crop.crop_slug]

  const displayPrice = livePrice?.price_per_kg ?? crop.db_price_per_kg ?? crop.avg_price_per_kg
  const isLive       = !!livePrice
  const diff = DIFFICULTY[crop.difficulty_level]
  const TrendIcon = TREND_ICON[crop.price_trend] ?? Minus

  return (
    <div className={`glass-card card-hover p-6 animate-fade-in-up ${isTopChoice ? 'ring-2 ring-emerald-500/50' : ''}`}
      style={isTopChoice ? { background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(0, 0, 0, 0.2))' } : {}}>
      {/* Header */}
      {isTopChoice && (
        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)' }}>
          <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
          <span className="text-[11px] font-bold" style={{ color: 'var(--accent)' }}>Paling Disarankan AI</span>
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-bold text-white">{crop.crop_name}</h3>
          {crop.local_name && (
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{crop.local_name}</p>
          )}
        </div>
        {diff && (
          <span className={`text-[11px] font-medium border px-2.5 py-1 rounded-lg ${diff.color} ${diff.bg} ${diff.border}`}>
            {diff.label}
          </span>
        )}
      </div>

      {/* Reason */}
      <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
        {crop.reason}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Harga */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-[11px] font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            Harga Pasar
            {isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live" />
            )}
          </p>
          <p className="text-[15px] font-bold text-white">
            Rp {displayPrice.toLocaleString('id-ID')}
            <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--text-dim)' }}>/kg</span>
          </p>
          {livePrice?.price_min && livePrice?.price_max && (
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-dim)' }}>
              {livePrice.price_min.toLocaleString('id-ID')} – {livePrice.price_max.toLocaleString('id-ID')}
            </p>
          )}
          <div className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${TREND_COLOR[crop.price_trend] ?? 'text-slate-400'}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            {crop.price_trend}
          </div>
          {(crop as any).price_source && (
            <p className="text-[10px] mt-1.5 italic" style={{ color: 'var(--text-dim)' }}>
              Sumber: {(crop as any).price_source}
            </p>
          )}
        </div>

        {/* Estimasi */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-[11px] font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Weight className="w-3 h-3" />
            Estimasi Hasil
          </p>
          <p className="text-[15px] font-bold text-white">
            {crop.estimated_yield_per_100m2_kg} kg
            <span className="text-[11px] font-normal ml-1" style={{ color: 'var(--text-dim)' }}>/100m²</span>
          </p>
          <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Timer className="w-3 h-3" />
            Panen ~{crop.harvest_duration_days} hari
          </p>
          <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--accent)' }}>
            ≈ Rp {(crop.estimated_yield_per_100m2_kg * displayPrice).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Bottom info */}
      <div className="flex flex-col gap-2.5 pt-4 border-t mb-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-start gap-2.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          <CalendarDays className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
          <span>{crop.planting_season}</span>
        </div>
        <div className="flex items-start gap-2.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>{crop.tips}</span>
        </div>
        {(crop as any).weather_insight && (
          <div className="flex items-start gap-2.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            <span className="text-sky-400 flex-shrink-0 mt-0.5">🌤</span>
            <span className="italic">{(crop as any).weather_insight}</span>
          </div>
        )}
      </div>

      <PriceChart cropSlug={crop.crop_slug} cropLabel={crop.crop_name} currentPrice={displayPrice} />
    </div>
  )
}
