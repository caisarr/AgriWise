import type { Metadata } from 'next'
import './globals.css'

import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'AgriWise AI — Rekomendasi Tanaman Cerdas',
  description: 'Sistem AI untuk membantu petani Indonesia memilih tanaman terbaik.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="noise-bg font-sans flex min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Sidebar />
        <main className="flex-1 ml-[272px] p-8 relative z-10 print:ml-0 print:p-4">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
