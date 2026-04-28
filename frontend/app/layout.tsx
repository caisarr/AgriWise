import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'AgriWise AI — Rekomendasi Tanaman Cerdas',
  description: 'Sistem AI untuk membantu petani Indonesia memilih tanaman terbaik.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0c1117" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="noise-bg font-sans flex min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Sidebar />
        {/* Desktop: offset left for sidebar. Mobile: offset top for header, bottom for bottom nav */}
        <main className="
          flex-1
          lg:ml-[272px]
          mt-14 lg:mt-0
          mb-[60px] lg:mb-0
          p-4 sm:p-6 lg:p-8
          relative z-10
          print:ml-0 print:mt-0 print:mb-0 print:p-4
        ">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
