'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Upload, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function JualPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '',
    category: 'sayuran',
    price: '',
    stock: '',
    unit: 'kg',
    description: '',
    seller_name: '',
    seller_phone: '',
    location: '',
    image_url: ''
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...form,
        price: parseInt(form.price),
        stock: parseInt(form.stock)
      }

      const res = await fetch(`${API}/api/marketplace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/pasar')
          router.refresh()
        }, 2000)
      } else {
        alert('Gagal memposting produk')
      }
    } catch (e) {
      console.error(e)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Produk Berhasil Diposting!</h2>
        <p className="text-slate-400">Mengarahkan kembali ke marketplace...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up pb-10">
      <Link href="/pasar" className="inline-flex items-center gap-2 text-[13px] text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Marketplace
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <Store className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Jual Produk</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Lengkapi detail produk atau hasil panen yang ingin Anda jual.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
        
        {/* Informasi Penjual */}
        <div>
          <h3 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">Informasi Penjual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">Nama Anda / Toko *</label>
              <input required type="text" name="seller_name" value={form.seller_name} onChange={handleChange} className="input-field w-full" placeholder="Contoh: Pak Budi Farm" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">Nomor WhatsApp *</label>
              <input required type="text" name="seller_phone" value={form.seller_phone} onChange={handleChange} className="input-field w-full" placeholder="Contoh: 08123456789" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">Lokasi / Kota *</label>
              <input required type="text" name="location" value={form.location} onChange={handleChange} className="input-field w-full" placeholder="Contoh: Lembang, Jawa Barat" />
            </div>
          </div>
        </div>

        {/* Detail Produk */}
        <div className="pt-4">
          <h3 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">Detail Produk</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">Nama Produk *</label>
              <input required type="text" name="title" value={form.title} onChange={handleChange} className="input-field w-full" placeholder="Contoh: Cabai Merah Keriting Segar" />
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">Kategori *</label>
              <select required name="category" value={form.category} onChange={handleChange} className="input-field w-full">
                <option value="sayuran">Sayuran</option>
                <option value="buah">Buah-buahan</option>
                <option value="bibit">Bibit & Benih</option>
                <option value="pupuk">Pupuk & Obat</option>
                <option value="alat">Alat Tani</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">Harga (Rp) *</label>
                <input required type="number" min="0" name="price" value={form.price} onChange={handleChange} className="input-field w-full" placeholder="45000" />
              </div>
              <div className="w-1/3">
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">Per</label>
                <select required name="unit" value={form.unit} onChange={handleChange} className="input-field w-full">
                  <option value="kg">Kg</option>
                  <option value="ton">Ton</option>
                  <option value="ikat">Ikat</option>
                  <option value="pcs">Pcs</option>
                  <option value="sak">Sak</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">Stok Tersedia *</label>
              <input required type="number" min="1" name="stock" value={form.stock} onChange={handleChange} className="input-field w-full" placeholder="100" />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">URL Foto Produk</label>
              <input type="text" name="image_url" value={form.image_url} onChange={handleChange} className="input-field w-full" placeholder="https://..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-2">Deskripsi Produk *</label>
              <textarea required name="description" value={form.description} onChange={handleChange} rows={4} className="input-field w-full" placeholder="Jelaskan kualitas, kondisi, dan minimal pembelian..." />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            {loading ? 'Memproses...' : (
              <>
                <Upload className="w-5 h-5" />
                Posting Produk Sekarang
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
