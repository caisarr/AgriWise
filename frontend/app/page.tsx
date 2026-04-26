import Link from 'next/link'
import { Sprout, Stethoscope, CalendarDays, Calculator, ArrowRight, CloudRain } from 'lucide-react'

const features = [
  {
    href: '/recommend',
    icon: Sprout,
    title: 'Cari Rekomendasi',
    desc: 'Temukan tanaman terbaik berdasarkan cuaca, tanah, dan modal Anda.',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
  },

  {
    href: '/kalender',
    icon: CalendarDays,
    title: 'Kalender Tanam',
    desc: 'Buat jadwal perawatan tanaman dari hari ke-0 sampai masa panen.',
    gradient: 'from-violet-500/20 to-violet-500/5',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
  },
  {
    href: '/kalkulator',
    icon: Calculator,
    title: 'Kalkulator ROI',
    desc: 'Hitung estimasi laba bersih dan potensi pendapatan dari panen.',
    gradient: 'from-amber-500/20 to-amber-500/5',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
  },
]

export default function Home() {
  return (
    <div className="animate-fade-in-up">
      {/* Weather Alert */}
      <div className="glass-card p-4 mb-8 flex items-start gap-4"
        style={{ borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.06)' }}>
        <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CloudRain className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h4 className="text-red-300 font-bold text-sm mb-1">Peringatan Cuaca Ekstrem</h4>
          <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(252, 165, 165, 0.8)' }}>
            Diprediksi akan terjadi curah hujan sangat tinggi dalam 3 hari ke depan di wilayah Jawa Barat.
            Tunda pemupukan daun dan pastikan drainase lahan lancar agar akar tidak busuk.
          </p>
        </div>
      </div>

      {/* Hero section */}
      <div className="glass-card p-12 text-center mb-10 relative overflow-hidden">
        {/* Glow accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(90deg, #059669, #34d399)' }} />

        <div className="relative z-10">
          <p className="text-[11px] tracking-[5px] uppercase font-semibold mb-5" style={{ color: 'var(--accent)' }}>
            AI untuk Petani Indonesia
          </p>
          <h1 className="text-5xl font-black text-white mb-5 leading-tight">
            Selamat Datang di <br />
            <span className="gradient-text">AgriWise</span>
          </h1>
          <p className="max-w-lg mx-auto text-[15px] leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Platform pertanian cerdas yang dilengkapi AI untuk membantu Anda
            merencanakan, mendiagnosis, dan memaksimalkan hasil panen.
          </p>
          <Link
            href="/recommend"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Sprout className="w-4 h-4" />
            Mulai Rekomendasi
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
        {features.map(f => {
          const Icon = f.icon
          return (
            <Link
              key={f.href}
              href={f.href}
              className={`glass-card card-hover p-6 group animate-fade-in-up bg-gradient-to-br ${f.gradient}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center flex-shrink-0
                  group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${f.iconColor}`} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-bold text-white text-[15px]">{f.title}</h3>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-300"
                      style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
