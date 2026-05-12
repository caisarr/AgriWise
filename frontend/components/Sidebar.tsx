'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Sprout, Calculator, CalendarDays,
  History, Leaf, Store, ShoppingBag, Menu, X, Cpu,
} from 'lucide-react'

const links = [
  { href: '/',            label: 'Dashboard',       icon: Home },
  { href: '/recommend',   label: 'Rekomendasi',     icon: Sprout },
  { href: '/pasar',       label: 'Marketplace',     icon: ShoppingBag },
  { href: '/harga-pasar', label: 'Harga Pasar',     icon: Store },
  { href: '/kalender',    label: 'Kalender Tanam',  icon: CalendarDays },
  { href: '/iot',         label: 'Sensor IoT',      icon: Cpu },
  { href: '/kalkulator',  label: 'Kalkulator ROI',  icon: Calculator },
  { href: '/history',     label: 'Riwayat',         icon: History },
]

// Bottom nav: hanya tampilkan 5 item utama di mobile
const bottomLinks = [
  { href: '/',          label: 'Home',       icon: Home },
  { href: '/recommend', label: 'Rekomendasi',icon: Sprout },
  { href: '/pasar',     label: 'Pasar',      icon: ShoppingBag },
  { href: '/iot',       label: 'IoT',        icon: Cpu },
  { href: '/history',   label: 'Riwayat',    icon: History },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const NavLink = ({ link }: { link: typeof links[0] }) => {
    const isActive = pathname === link.href
    const Icon = link.icon
    return (
      <Link
        href={link.href}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
          ${isActive ? 'text-white' : 'hover:bg-white/[0.04]'}`}
        style={isActive ? {
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          boxShadow: 'inset 0 0 0 1px var(--accent-border)',
        } : { color: 'var(--text-secondary)' }}
      >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
        <span className="truncate">{link.label}</span>
      </Link>
    )
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-7 pt-8 pb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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
        {/* Close button (mobile drawer only) */}
        <button className="lg:hidden p-1.5 rounded-lg hover:bg-white/5" onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px mb-4" style={{ background: 'var(--border-subtle)' }} />

      {/* Nav */}
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-[3px] px-3 mb-2" style={{ color: 'var(--text-dim)' }}>
          Menu
        </p>
        {links.map(link => <NavLink key={link.href} link={link} />)}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            🌱
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">AgriWise AI</p>
            <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>v1.0 · © 2026</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* ── DESKTOP Sidebar (lg+) ── */}
      <aside
        className="hidden lg:flex w-[272px] fixed left-0 top-0 bottom-0 z-30 flex-col border-r print:hidden"
        style={{ background: 'linear-gradient(180deg, #0f1720 0%, #0c1117 100%)', borderColor: 'var(--border-subtle)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── MOBILE/TABLET Top Bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 border-b print:hidden"
        style={{ background: 'rgba(12,17,23,0.95)', backdropFilter: 'blur(12px)', borderColor: 'var(--border-subtle)' }}>
        {/* Hamburger */}
        <button onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          aria-label="Buka menu">
          <Menu className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>
        {/* Logo Center */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
            <Leaf className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-extrabold text-white">
            Agri<span className="gradient-text">Wise</span>
          </span>
        </Link>
        {/* Spacer */}
        <div className="w-9" />
      </header>

      {/* ── MOBILE Drawer Overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 print:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col border-r animate-fade-in"
            style={{ background: 'linear-gradient(180deg, #0f1720 0%, #0c1117 100%)', borderColor: 'var(--border-subtle)' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── MOBILE Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t print:hidden"
        style={{ background: 'rgba(12,17,23,0.97)', backdropFilter: 'blur(12px)', borderColor: 'var(--border-subtle)' }}>
        {bottomLinks.map(link => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link key={link.href} href={link.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors"
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-dim)' }}>
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[9px] font-semibold tracking-wide">{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
