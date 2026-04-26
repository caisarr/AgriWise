'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Search, Filter, Plus, MessageCircle, MapPin, Package } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Product {
  id: string
  title: string
  description: string
  price: number
  stock: number
  unit: string
  category: string
  image_url: string
  seller_name: string
  seller_phone: string
  location: string
  created_at: string
}

const CATEGORIES = [
  { id: '', label: 'Semua' },
  { id: 'sayuran', label: 'Sayuran' },
  { id: 'buah', label: 'Buah-buahan' },
  { id: 'bibit', label: 'Bibit & Benih' },
  { id: 'pupuk', label: 'Pupuk & Obat' },
  { id: 'alat', label: 'Alat Tani' },
]

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [category, search])

  async function fetchProducts() {
    setLoading(true)
    try {
      const url = new URL(`${API}/api/marketplace`)
      if (category) url.searchParams.append('category', category)
      if (search) url.searchParams.append('q', search)
      
      const res = await fetch(url.toString())
      const data = await res.json()
      setProducts(data.products || [])
    } catch (e) {
      console.error('Gagal memuat produk:', e)
    } finally {
      setLoading(false)
    }
  }

  // Format nomor HP ke link wa.me
  const getWaLink = (phone: string, text: string) => {
    let num = phone.replace(/\D/g, '')
    if (num.startsWith('0')) num = '62' + num.slice(1)
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-blue-400" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              Agri<span className="text-blue-400">Market</span>
            </h1>
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Beli langsung dari petani atau jual hasil panen Anda.
            </p>
          </div>
        </div>
        
        <Link href="/pasar/jual" 
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
          <Plus className="w-4 h-4" />
          Jual Produk
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari sayuran, buah, pupuk..."
            className="input-field pl-11 w-full"
            onKeyDown={e => e.key === 'Enter' && fetchProducts()}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-all
                ${category === cat.id 
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="skeleton h-[320px] rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && products.length === 0 && (
        <div className="glass-card py-20 text-center flex flex-col items-center justify-center">
          <Package className="w-16 h-16 mb-4 text-slate-600" />
          <h3 className="text-lg font-bold text-white mb-2">Produk Tidak Ditemukan</h3>
          <p className="text-[13px] text-slate-400 mb-6 max-w-md">
            Belum ada produk untuk kategori ini atau dengan kata kunci tersebut.
          </p>
          <button onClick={() => {setSearch(''); setCategory('')}} className="text-blue-400 text-sm font-semibold hover:underline">
            Tampilkan Semua Produk
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
          {products.map(p => (
            <div key={p.id} className="glass-card card-hover flex flex-col overflow-hidden group">
              {/* Image */}
              <div className="aspect-square w-full bg-slate-800 relative overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-slate-600" />
                  </div>
                )}
                {/* Badge Category */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white">
                  {p.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-[14px] font-bold text-white line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                  {p.title}
                </h3>
                
                <p className="text-lg font-black text-blue-400 mb-3">
                  Rp {p.price.toLocaleString('id-ID')}
                  <span className="text-[11px] font-normal text-slate-400 ml-1">/ {p.unit}</span>
                </p>

                <div className="flex flex-col gap-1.5 mt-auto pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] font-medium text-slate-300 truncate pr-2">
                      {p.seller_name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                      Stok: {p.stock}
                    </span>
                  </div>
                </div>

                {/* Chat Button */}
                <a 
                  href={getWaLink(p.seller_phone, `Halo ${p.seller_name}, saya tertarik dengan produk "${p.title}" yang dijual di AgriMarket.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-bold transition-colors bg-white/5 hover:bg-emerald-500 hover:text-white text-slate-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat Penjual
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
