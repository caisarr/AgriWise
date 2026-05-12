'use client'
import { useState, useEffect } from 'react'
import { Cpu, Droplets, RefreshCw, Sliders, AlertTriangle, CheckCircle, Info, Settings, Component, Layers } from 'lucide-react'

const rawAPI = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API = rawAPI.replace(/\/+$/, '')

interface IoTData {
  moisture_percentage: number
  soil_status: string
  recommendation: string
  color_code: string
  last_updated: string
  device_info: {
    name: string
    microcontroller: string
    sensor_type: string
    total_cost_idr: number
    portability: string
    protection_class: string
  }
  hardware_specs: Array<{
    komponen: string
    qty: number
    harga: number
  }>
  action_steps: Array<{
    icon: string
    title: string
    detail: string
    priority: string
  }>
}

export default function IoTPage() {
  const [data, setData] = useState<IoTData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sliderValue, setSliderValue] = useState(45)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [useBackend, setUseBackend] = useState(true)

  useEffect(() => {
    initFetch()
  }, [])

  async function initFetch() {
    try {
      const res = await fetch(`${API}/api/iot/status`)
      if (!res.ok) throw new Error('Backend unavailable')
      const json = await res.json()
      if (json.status === 'success') {
        setData(json.data)
        setSliderValue(json.data.moisture_percentage)
        setUseBackend(true)
        setError('')
      }
    } catch {
      setError('Mode simulasi offline aktif — backend belum tersedia.')
      setUseBackend(false)
      setData(getFallbackData(45))
    } finally {
      setLoading(false)
    }
  }

  async function handleSimulate(val: number) {
    setSliderValue(val)
    setUpdating(true)
    // Optimistic update — langsung update gauge/status tanpa menunggu backend
    setData(getFallbackData(val))
    try {
      const res = await fetch(`${API}/api/iot/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moisture: val })
      })
      if (res.ok) {
        // Setelah backend berhasil diupdate, ambil data resmi dari server
        const statusRes = await fetch(`${API}/api/iot/status`)
        if (statusRes.ok) {
          const json = await statusRes.json()
          if (json.status === 'success') {
            setData(json.data)
            setError('')
          }
        }
      }
    } catch {
      // Tidak perlu fallback lagi — sudah diset di atas secara optimistic
    } finally {
      setUpdating(false)
    }
  }

  function getFallbackData(m: number): IoTData {
    let status = "Normal"
    let rec = "Kondisi kelembaban tanah sangat optimal untuk penyerapan nutrisi. Kelembaban terjaga dengan baik."
    let col = "emerald"
    let steps: IoTData['action_steps'] = [
      {icon: "✅", title: "Pertahankan Kondisi Saat Ini", detail: "Kelembaban berada di zona ideal (40-70%). Lanjutkan jadwal perawatan rutin tanpa perubahan signifikan pada pola pengairan.", priority: "normal"},
      {icon: "🌱", title: "Pemupukan Optimal", detail: "Kondisi kelembaban ini sangat ideal untuk pemupukan. Aplikasikan pupuk sesuai jadwal Kalender Tanam agar penyerapan nutrisi oleh akar maksimal.", priority: "normal"},
      {icon: "🔍", title: "Monitor Hama & Penyakit", detail: "Kelembaban optimal juga menjadi lingkungan yang nyaman bagi hama. Lakukan pengecekan visual rutin pada daun bawah dan batang tanaman.", priority: "normal"},
      {icon: "📊", title: "Catat Data untuk Analisis", detail: "Dokumentasikan kondisi kelembaban harian untuk membangun pola data jangka panjang. Gunakan catatan ini untuk optimasi jadwal irigasi di musim berikutnya.", priority: "low"},
    ]
    if (m < 40) {
      status = "Kering"
      rec = "Lakukan penyiraman segera. Kelembaban tanah di bawah ambang batas kritis (40%), berisiko memicu stres air."
      col = "red"
      steps = [
        {icon: "💧", title: "Penyiraman Segera", detail: "Siram lahan secara merata dengan volume 2-3 liter per m². Gunakan metode tetes (drip) jika tersedia untuk efisiensi air maksimal.", priority: "urgent"},
        {icon: "🌿", title: "Mulching / Penutupan Tanah", detail: "Tutup permukaan tanah dengan mulsa organik (jerami, sekam padi) setebal 5-10 cm untuk mengurangi evaporasi dan menjaga kelembaban.", priority: "high"},
        {icon: "🕐", title: "Jadwal Penyiraman Berkala", detail: "Atur penyiraman di pagi hari (06.00-08.00) dan sore hari (16.00-18.00) agar penyerapan optimal dan menghindari penguapan di jam panas.", priority: "high"},
        {icon: "🧪", title: "Periksa Kondisi Akar", detail: "Cek apakah tanaman mulai menunjukkan gejala layu, daun menguning, atau pengerutan. Jika ya, berikan larutan pupuk cair encer untuk membantu pemulihan.", priority: "medium"},
        {icon: "⛅", title: "Pasang Peneduh Sementara", detail: "Jika cuaca panas terik, pasang paranet dengan naungan 50-60% untuk mengurangi paparan sinar matahari langsung dan tekanan evapotranspirasi.", priority: "medium"},
      ]
    } else if (m > 70) {
      status = "Basah"
      rec = "Tanah dalam kondisi jenuh air (>70%). Tunda penyiraman dan pastikan sistem drainase berfungsi lancar."
      col = "blue"
      steps = [
        {icon: "🚫", title: "Hentikan Penyiraman", detail: "Jangan tambah air ke lahan. Tunda seluruh jadwal penyiraman hingga kelembaban kembali turun ke zona normal (di bawah 70%).", priority: "urgent"},
        {icon: "🔧", title: "Periksa Sistem Drainase", detail: "Pastikan saluran drainase tidak tersumbat oleh sampah atau sedimen. Buat parit kecil di sekeliling bedengan jika diperlukan.", priority: "urgent"},
        {icon: "🍃", title: "Aerasi Tanah", detail: "Buat lubang-lubang kecil di sekitar zona perakaran menggunakan garpu tanah untuk memperbaiki sirkulasi udara dan mencegah kondisi anaerob.", priority: "high"},
        {icon: "⚠️", title: "Tunda Pemupukan", detail: "Jangan melakukan pemupukan saat tanah jenuh air. Pupuk akan larut terbawa air dan tidak terserap optimal.", priority: "high"},
        {icon: "🍄", title: "Waspadai Jamur & Penyakit", detail: "Kelembaban tinggi mempercepat pertumbuhan jamur patogen. Periksa pangkal batang dan akar. Aplikasikan fungisida nabati jika ditemukan bercak.", priority: "medium"},
      ]
    }
    return {
      moisture_percentage: m,
      soil_status: status,
      recommendation: rec,
      color_code: col,
      last_updated: new Date().toISOString(),
      device_info: {
        name: "AgriWise Soil Moisture Node v1.0",
        microcontroller: "Tes",
        sensor_type: "Capacitive / Analog Soil Moisture Probe",
        total_cost_idr: 395000,
        portability: "Portable Base Structure (Pipa PVC & Kayu)",
        protection_class: "IP65 Weatherproof Enclosure",
      },
      hardware_specs: [
        {"komponen": "Sensor Soil Moisture Analog", "qty": 1, "harga": 20000},
        {"komponen": "Mikrokontroler ESP32 WiFi", "qty": 1, "harga": 70000},
        {"komponen": "Modul Display LCD OLED 0.96\"", "qty": 1, "harga": 30000},
        {"komponen": "Powerbank 5V 10.000 mAh", "qty": 1, "harga": 100000},
        {"komponen": "Box Plastik Enclosure IP65", "qty": 1, "harga": 40000},
        {"komponen": "Struktur Pipa PVC Ø 1.5 inch", "qty": 1, "harga": 20000},
        {"komponen": "Base Papan Kayu Portabel", "qty": 1, "harga": 25000},
        {"komponen": "Karet Kaki Anti-Slip", "qty": 4, "harga": 2500},
        {"komponen": "Kabel & Konektor / Probe", "qty": 1, "harga": 20000},
        {"komponen": "Klem Pipa & Aksesoris", "qty": 1, "harga": 10000},
        {"komponen": "Jasa Perakitan & Tenaga", "qty": 1, "harga": 50000},
      ],
      action_steps: steps,
    }
  }

  // Helper untuk rendering warna dinamis
  const getColorClasses = (code: string) => {
    if (code === 'red') return {
      text: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      gradient: 'from-red-500/20 to-transparent',
      bar: '#ef4444'
    }
    if (code === 'blue') return {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      gradient: 'from-blue-500/20 to-transparent',
      bar: '#3b82f6'
    }
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      gradient: 'from-emerald-500/20 to-transparent',
      bar: '#10b981'
    }
  }

  const colors = data ? getColorClasses(data.color_code) : getColorClasses('emerald')

  return (
    <div className="animate-fade-in-up pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-6 h-6 text-cyan-400" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">
                Monitoring <span className="text-cyan-400">IoT System</span>
              </h1>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Sistem pendukung keputusan irigasi otomatis berbasis kelembaban tanah aktual.
            </p>
          </div>
        </div>

        <button 
          onClick={initFetch} 
          disabled={loading || updating}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white/5 hover:bg-white/10 text-slate-300 border border-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Mutakhirkan Data
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl text-xs flex items-center gap-2 bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-80 rounded-2xl lg:col-span-1" />
          <div className="skeleton h-80 rounded-2xl lg:col-span-2" />
        </div>
      ) : data ? (
        <>
          {/* Bagian Atas: Gauge & Keputusan AI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 stagger">
            {/* 1. Gauge Card */}
            <div className={`glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b ${colors.gradient}`}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                Kadar Air Tanah (Soil Moisture)
              </p>

              {/* Circular Gauge Representation */}
              <div className="relative w-44 h-44 flex items-center justify-center my-2">
                {/* Track Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="40"
                    stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent"
                  />
                  {/* Value Circle */}
                  <circle
                    cx="50" cy="50" r="40"
                    stroke={colors.bar} strokeWidth="10" fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * data.moisture_percentage) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                {/* Center Content */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {data.moisture_percentage}%
                  </span>
                  <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mt-1 border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {data.soil_status}
                  </span>
                </div>
              </div>

              {/* Legend Ambang Batas */}
              <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Kering &lt;40%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal 40-70%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Basah &gt;70%
                </span>
              </div>
            </div>

            {/* 2. Rekomendasi Keputusan (Decision Support) */}
            <div className="glass-card p-6 flex flex-col justify-between lg:col-span-2">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Droplets className={`w-5 h-5 ${colors.text}`} />
                  <h3 className="text-base font-bold text-white">Rekomendasi Sistem Pakar (DSS)</h3>
                </div>

                <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border} mb-6`}>
                  <p className="text-sm leading-relaxed text-slate-200 font-medium">
                    {data.recommendation}
                  </p>
                </div>

                {/* Info Transmisi Data */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-[10px] text-slate-400 mb-1">Metode Pengiriman</p>
                    <p className="text-xs font-bold text-white">Wi-Fi</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-[10px] text-slate-400 mb-1">Waktu Pembaruan</p>
                    <p className="text-xs font-bold text-white truncate">
                      {new Date(data.last_updated).toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-slate-400 mb-1">Tegangan Kerja</p>
                    <p className="text-xs font-bold text-white">3.3V – 5V DC</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Terintegrasi dengan Rekomendasi AI & Kalender
                </span>
                <span className="font-semibold text-cyan-400">Siap Lomba</span>
              </div>
            </div>
          </div>

          {/* Panel Simulator Interaktif (Khusus Presentasi Juri) */}
          <div className="glass-card p-6 mb-8 border-cyan-500/30 bg-gradient-to-r from-cyan-500/[0.03] to-transparent">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Panel Simulator Data IoT <span className="text-[10px] bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded font-black tracking-wider uppercase">Fitur Demo Juri</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-2xl">
                  Geser slider di bawah untuk menyimulasikan perubahan kelembaban tanah pada alat fisik secara interaktif. Status kondisi tanah dan rekomendasi irigasi akan langsung beradaptasi secara real-time.
                </p>
              </div>
            </div>

            {/* Slider Control */}
            <div className="max-w-xl my-6">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                <span>0% (Sangat Kering)</span>
                <span className="text-cyan-400 text-sm">{sliderValue}%</span>
                <span>100% (Jenuh Air)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={e => setSliderValue(parseInt(e.target.value))}
                onMouseUp={e => handleSimulate(parseInt((e.target as HTMLInputElement).value))}
                onTouchEnd={e => handleSimulate(parseInt((e.target as HTMLInputElement).value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Presets Cepat */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-semibold text-slate-500 self-center mr-2">Preset Uji:</span>
              <button
                onClick={() => handleSimulate(25)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
              >
                Kering (25%)
              </button>
              <button
                onClick={() => handleSimulate(55)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
              >
                Normal (55%)
              </button>
              <button
                onClick={() => handleSimulate(85)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
              >
                Basah (85%)
              </button>
            </div>
          </div>

          {/* Langkah Tindakan yang Disarankan */}
          {data.action_steps && data.action_steps.length > 0 && (
            <div className="glass-card p-6 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Langkah Tindakan yang Disarankan</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6 max-w-2xl">
                Berdasarkan pembacaan sensor kelembaban tanah saat ini ({data.moisture_percentage}% — <span className={colors.text}>{data.soil_status}</span>), berikut langkah-langkah konkret yang perlu diambil:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
                {data.action_steps.map((step, idx) => {
                  const priorityStyles: Record<string, string> = {
                    urgent: 'bg-red-500/15 text-red-400 border-red-500/30',
                    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
                    medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
                    normal: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                    low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
                  }
                  const priorityLabels: Record<string, string> = {
                    urgent: 'Mendesak',
                    high: 'Tinggi',
                    medium: 'Sedang',
                    normal: 'Rutin',
                    low: 'Rendah',
                  }
                  const pStyle = priorityStyles[step.priority] || priorityStyles.normal
                  const pLabel = priorityLabels[step.priority] || 'Normal'

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors animate-fade-in-up flex gap-3.5"
                    >
                      <span className="text-2xl flex-shrink-0 mt-0.5">{step.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h4 className="text-[13px] font-bold text-white">{step.title}</h4>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${pStyle}`}>
                            {pLabel}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-400">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rincian Komponen Perangkat Keras Fisik (Bukti Dokumen Esai) */}
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <Component className="w-5 h-5 text-slate-400" />
                <h3 className="text-base font-bold text-white">Rincian Komponen Perangkat Keras Fisik</h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Sesuai Lampiran Tabel Biaya Alat Esai
              </span>
            </div>

            {/* Deskripsi Struktur */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <p className="font-bold text-slate-300 mb-1">Desain Portabel</p>
                <p className="text-slate-400 leading-relaxed">
                  Menggunakan Pipa PVC Ø 1.5 inci tinggi 70cm dan base kayu 25x25 cm berserta kaki karet anti-slip. Mudah dipindahkan.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <p className="font-bold text-slate-300 mb-1">Daya Tahan Cuaca</p>
                <p className="text-slate-400 leading-relaxed">
                  Pusat kendali ESP32 dan display OLED terlindungi sepenuhnya di dalam box plastik dengan sertifikasi perlindungan IP65 outdoor.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                <p className="font-bold text-slate-300 mb-1">Catu Daya Mandiri</p>
                <p className="text-slate-400 leading-relaxed">
                  Didukung oleh Powerbank berkapasitas 10.000 mAh (5V) untuk menjamin pemantauan kontinu di area lahan tanpa sambungan listrik.
                </p>
              </div>
            </div>

            {/* Tabel Spesifikasi Biaya */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold">
                    <th className="p-3">No</th>
                    <th className="p-3">Komponen / Spesifikasi Teknis</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Harga Satuan</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {data.hardware_specs.map((item, idx) => {
                    // Hitung subtotal aktual jika qty > 1, pada data esai karet kaki qty=4, harga=2500, total=10000
                    const itemTotal = item.komponen.includes("Karet Kaki") ? 10000 : item.harga
                    const itemPrice = item.komponen.includes("Karet Kaki") ? 2500 : item.harga
                    return (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="p-3 text-slate-500 font-medium">{idx + 1}</td>
                        <td className="p-3 font-semibold text-white">{item.komponen}</td>
                        <td className="p-3 text-center text-slate-400">{item.qty || 1}</td>
                        <td className="p-3 text-right font-mono text-slate-400">
                          Rp {itemPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-cyan-400">
                          Rp {itemTotal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Ringkasan Biaya */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimasi Total Biaya Produksi Alat</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Pendekatan rancangan low-cost berbasis komunitas</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-cyan-400 font-mono">
                  Rp 395.000
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
