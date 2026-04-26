'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sprout, Calculator, CalendarDays, History, Leaf, Store } from 'lucide-react'

const links = [
  { href: '/',          label: 'Dashboard',        icon: Home },
  { href: '/recommend', label: 'Rekomendasi',      icon: Sprout },
  { href: '/pasar',     label: 'Pasar Komoditas',  icon: Store },
  { href: '/kalender',  label: 'Kalender Tanam',   icon: CalendarDays },
  { href: '/kalkulator',label: 'Kalkulator ROI',   icon: Calculator },
  { href: '/history',   label: 'Riwayat',          icon: History },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[272px] fixed left-0 top-0 bottom-0 z-30 flex flex-col border-r print:hidden"
      style={{
        background: 'linear-gradient(180deg, #0f1720 0%, #0c1117 100%)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div className="px-7 pt-8 pb-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
            <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              Agri<span className="gradient-text">Wise</span>
            </h1>
            <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>
              AI Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px mb-4" style={{ background: 'var(--border-subtle)' }} />

      {/* Nav */}
      <nav className="flex-1 px-4 flex flex-col gap-1">
        <p className="text-[10px] font-semibold uppercase tracking-[3px] px-3 mb-2"
          style={{ color: 'var(--text-dim)' }}>
          Menu
        </p>
        {links.map(link => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                ${isActive
                  ? 'text-white'
                  : 'hover:bg-white/[0.04]'
                }
              `}
              style={isActive ? {
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                boxShadow: 'inset 0 0 0 1px var(--accent-border)',
              } : {
                color: 'var(--text-secondary)',
              }}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            🌱
          </div>
          <div>
            <p className="text-xs font-semibold text-white">AgriWise AI</p>
            <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>v1.0 · © 2026</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
