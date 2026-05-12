from fastapi import APIRouter
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/iot", tags=["iot"])

# In-memory simulator state untuk keperluan presentasi/perlombaan
iot_state = {
    "moisture_percentage": 45,
    "plant_type": "Cabai",
    "last_updated": datetime.utcnow().isoformat(),
}

# Rincian spesifikasi perangkat keras (berdasarkan esai Nextion.docx)
HARDWARE_SPECS = [
    {"komponen": "Sensor Soil Moisture Analog", "qty": 1, "harga": 20000},
    {"komponen": "Mikrokontroler ESP32 WiFi", "qty": 1, "harga": 70000},
    {"komponen": "Modul Display LCD OLED 0.96\"", "qty": 1, "harga": 30000},
    {"komponen": "Powerbank 5V 10.000 mAh", "qty": 1, "harga": 100000},
    {"komponen": "Box Plastik Enclosure IP65 (120x120 mm)", "qty": 1, "harga": 40000},
    {"komponen": "Struktur Pipa PVC Ø 1.5 inch (Tinggi 70cm)", "qty": 1, "harga": 20000},
    {"komponen": "Base Papan Kayu Portabel (25x25 cm)", "qty": 1, "harga": 25000},
    {"komponen": "Karet Kaki Anti-Slip", "qty": 4, "harga": 10000},
    {"komponen": "Kabel & Konektor (Probe 60mm, Kabel 1m)", "qty": 1, "harga": 20000},
    {"komponen": "Klem Pipa & Aksesoris", "qty": 1, "harga": 10000},
    {"komponen": "Jasa Perakitan & Tenaga", "qty": 1, "harga": 50000},
]

class SimulateRequest(BaseModel):
    moisture: int = Field(..., ge=0, le=100)
    plant_type: Optional[str] = None

def get_agronomic_advice(ptype: str, m: int):
    if ptype == "Padi Sawah":
        if m < 40:
            rec = "Peringatan Kritis! Tanah sawah mengering di bawah batas minimal (40%). Berisiko menghentikan pembentukan malai dan memicu retakan tanah liat yang merusak perakaran."
            steps = [
                {"icon": "🌊", "title": "Penggenangan Segera", "detail": "Alirkan air ke petak sawah hingga mencapai ketinggian 3-5 cm dari permukaan tanah untuk mengembalikan turgor tanaman.", "priority": "urgent"},
                {"icon": "🌱", "title": "Pengecekan Retak Tanah", "detail": "Periksa retakan tanah. Jika retakan terlalu dalam, tambahkan pupuk organik cair untuk membantu pemulihan bulu akar yang putus.", "priority": "high"},
                {"icon": "🌾", "title": "Babat Gulma Pesaing", "detail": "Kondisi kering memicu gulma tumbuh cepat. Lakukan penyiangan mekanis sebelum gulma mendominasi penyerapan nutrisi.", "priority": "medium"},
                {"icon": "💧", "title": "Terapkan Pengairan Berselang", "detail": "Setelah tergenang, jadwalkan sistem AWD (Alternate Wetting and Drying) secara disiplin untuk menghemat air.", "priority": "medium"}
            ]
        elif m <= 70:
            rec = "Kondisi kelembaban ideal untuk fase pengeringan berkala (Intermittent Irrigation). Membantu aerasi tanah, memperkuat batang padi agar tidak mudah rebah, dan menekan emisi gas metana."
            steps = [
                {"icon": "✅", "title": "Pertahankan Pengeringan Berkala", "detail": "Biarkan air surut alami hingga kelembaban mendekati 45% sebelum digenang kembali. Sangat baik untuk memacu pertumbuhan akar dalam.", "priority": "normal"},
                {"icon": "🛡️", "title": "Antisipasi Wereng & Penggerek", "detail": "Kondisi tajuk yang agak kering memudahkan pemantauan hama wereng coklat di pangkal batang padi.", "priority": "normal"},
                {"icon": "🌿", "title": "Aplikasi Pupuk Susulan", "detail": "Waktu yang tepat untuk aplikasi pupuk nitrogen (Urea) susulan pada saat tanah dalam kondisi macak-macak.", "priority": "normal"}
            ]
        else:
            rec = "Sawah dalam kondisi tergenang optimal (>70%). Ideal untuk fase pertumbuhan vegetatif awal dan penekanan gulma air."
            steps = [
                {"icon": "📏", "title": "Kontrol Pintu Air", "detail": "Pastikan tinggi genangan tidak melebihi 5 cm agar anakan padi tetap mendapatkan sinar matahari dan sirkulasi udara yang cukup.", "priority": "normal"},
                {"icon": "🐟", "title": "Pemanfaatan Mina Padi", "detail": "Jika menerapkan sistem mina padi, pastikan sirkulasi air tetap berputar perlahan untuk suplai oksigen ikan.", "priority": "low"},
                {"icon": "🔍", "title": "Periksa Saluran Pembuangan", "detail": "Bersihkan saringan pada pintu pembuangan agar genangan air saat hujan lebat cepat terkendali.", "priority": "low"}
            ]
    elif ptype == "Tomat":
        if m < 40:
            rec = "Penyiraman Sangat Mendesak! Kekurangan air drastis pada Tomat memicu gangguan penyerapan kalsium yang menyebabkan ujung buah membusuk (Blossom End Rot)."
            steps = [
                {"icon": "💧", "title": "Siram Area Perakaran", "detail": "Berikan air merata di pangkal batang (1.5 - 2 liter/tanaman) di pagi hari. Hindari membasahi daun untuk mencegah spora jamur.", "priority": "urgent"},
                {"icon": "🍅", "title": "Semprot Kalsium Foliar", "detail": "Untuk mencegah kerontokan bunga dan busuk pantat buah, aplikasikan pupuk kalsium cair melalui daun pada sore hari.", "priority": "high"},
                {"icon": "🌿", "title": "Pertebal Mulsa Jerami", "detail": "Tambahkan penutup tanah di bawah kanopi untuk menjaga kestabilan suhu tanah di siang hari yang terik.", "priority": "medium"}
            ]
        elif m <= 70:
            rec = "Kelembaban tanah sangat stabil. Menjamin pembesaran buah Tomat yang seragam, berbobot tinggi, dan mencegah risiko pecah buah (fruit cracking)."
            steps = [
                {"icon": "✅", "title": "Jaga Konsistensi Pengairan", "detail": "Fluktuasi air yang ekstrem memicu pecah buah. Pertahankan ritme kelembaban di rentang 50-65% ini.", "priority": "normal"},
                {"icon": "✂️", "title": "Pruning Tunas Air", "detail": "Lakukan pemangkasan tunas air dan daun bawah yang tua untuk mengoptimalkan distribusi hara ke tandan buah.", "priority": "normal"},
                {"icon": "🧪", "title": "Kocorkan Pupuk Kalium", "detail": "Fase kelembaban ini sangat mendukung penyerapan pupuk K (KCL/KNO3) untuk meningkatkan tingkat kemanisan (Brix) buah.", "priority": "normal"}
            ]
        else:
            rec = "Tanah terlalu basah! Akar Tomat sangat sensitif terhadap genangan yang memicu serangan penyakit layu bakteri dan hawar daun (Phytophthora infestans)."
            steps = [
                {"icon": "🚫", "title": "Stop Irigasi Total", "detail": "Hentikan suplai air ke bedengan. Biarkan sinar matahari dan angin mengeringkan area perakaran.", "priority": "urgent"},
                {"icon": "🪓", "title": "Perdalam Parit Drainase", "detail": "Kuras endapan lumpur di parit antar bedengan agar air sisa hujan dapat segera tuntas mengalir keluar.", "priority": "urgent"},
                {"icon": "🍄", "title": "Aplikasi Fungisida Preventif", "detail": "Segera semprotkan fungisida berbahan aktif tembaga atau agen hayati Trichoderma untuk menekan patogen tular tanah.", "priority": "high"}
            ]
    elif ptype == "Bawang Merah":
        if m < 40:
            rec = "Kritis! Perakaran Bawang Merah sangat dangkal. Tanah yang kering menghambat pembelahan sel umbi secara langsung, membuat umbi kerdil dan daun pucat."
            steps = [
                {"icon": "🚿", "title": "Penyiraman Sistem Gembor", "detail": "Siram daun dan bedengan menggunakan gembor atau sprikler halus di pagi hari untuk membilas embun dan melembabkan tanah atas.", "priority": "urgent"},
                {"icon": "🧅", "title": "Cek Tingkat Kepadatan Tanah", "detail": "Jika tanah terlalu keras akibat kering, gemburkan perlahan di sela-sela tanaman tanpa merusak umbi yang sedang membesar.", "priority": "high"},
                {"icon": "☀️", "title": "Waspada Ulat Grayak", "detail": "Cuaca panas dan kering memicu peletakan telur ulat grayak (Spodoptera exigua). Periksa ujung daun secara teliti.", "priority": "medium"}
            ]
        elif m <= 70:
            rec = "Kondisi kelembaban paling ideal untuk pembentukan dan pembesaran umbi Bawang Merah yang padat, merah merona, dan berdaya simpan tinggi."
            steps = [
                {"icon": "✅", "title": "Lanjutkan Perawatan Standar", "detail": "Kelembaban di area perakaran dangkal terjaga sempurna. Penyiraman cukup dilakukan satu kali sehari jika tidak ada hujan.", "priority": "normal"},
                {"icon": "⚖️", "title": "Aplikasi ZPT / Paklobutrazol", "detail": "Jika memasuki fase akhir vegetatif, aplikasi ZPT pada kelembaban ini efektif mengalihkan energi untuk pembesaran umbi.", "priority": "normal"},
                {"icon": "🧹", "title": "Sanitasi Sisa Daun Kering", "detail": "Bersihkan gulma dan daun bawah yang mengering agar sirkulasi udara di permukaan bedengan tetap lancar.", "priority": "low"}
            ]
        else:
            rec = "Bahaya Jenuh Air! Umbi Bawang Merah sangat rentan mengalami busuk leher batang dan serangan jamur Fusarium (penyakit inul/moler) jika tergenang."
            steps = [
                {"icon": "🛑", "title": "Kuras Genangan Parit", "detail": "Pastikan parit drainase benar-benar kering. Bawang merah tidak menoleransi genangan air di area perakaran lebih dari 12 jam.", "priority": "urgent"},
                {"icon": "🌬️", "title": "Taburkan Kapur Dolomit", "detail": "Taburkan sedikit dolomit di permukaan bedengan untuk menaikkan pH tanah yang anjlok akibat genangan air berlebih.", "priority": "high"},
                {"icon": "🔬", "title": "Penyemprotan Bakterisida", "detail": "Lakukan penyemprotan bakterisida dan fungisida sistemik untuk memproteksi luka mikro pada pangkal umbi.", "priority": "high"}
            ]
    elif ptype == "Jagung":
        if m < 40:
            rec = "Tanah sangat kering! Jika terjadi pada fase berbunga (tasseling) atau pengisian biji, kekeringan akan menyebabkan tongkol kopong atau biji tidak beraturan."
            steps = [
                {"icon": "🌊", "title": "Penggenangan Alur (Furrow)", "detail": "Alirkan air secara melimpah pada alur antar barisan tanaman Jagung hingga meresap ke zona perakaran dalam.", "priority": "urgent"},
                {"icon": "🌽", "title": "Amankan Fase Pengisian Biji", "detail": "Pastikan suplai air cukup selama 2 minggu ke depan agar pengisian pati pada biji jagung maksimal hingga ujung tongkol.", "priority": "high"},
                {"icon": "🍂", "title": "Pangkas Daun Bawah", "detail": "Kurangi daun terbawah yang sudah tua untuk meminimalisir laju transpirasi saat suhu udara sangat panas.", "priority": "low"}
            ]
        elif m <= 70:
            rec = "Kelembaban tanah sangat mendukung aktivitas metabolisme Jagung. Memacu pertumbuhan batang yang kokoh, daun hijau gelap, dan penyerapan nitrogen optimal."
            steps = [
                {"icon": "✅", "title": "Kondisi Pertumbuhan Prima", "detail": "Kelembaban tanah mencukupi hingga kedalaman 30 cm. Tidak diperlukan intervensi pengairan dalam 3-5 hari ke depan.", "priority": "normal"},
                {"icon": "🌱", "title": "Pembumbunan (Earthing Up)", "detail": "Manfaatkan kelembaban tanah yang pas ini untuk melakukan pembumbunan sekaligus menutup pupuk susulan di sekitar perakaran.", "priority": "normal"},
                {"icon": "🐛", "title": "Scouting Penggerek Batang", "detail": "Periksa pucuk daun muda dari ancaman ulat FAW (Fall Armyworm) yang kerap menyerang di fase pertumbuhan aktif.", "priority": "normal"}
            ]
        else:
            rec = "Drainase Terhambat! Genangan air berlebih mencuci unsur hara penting (leaching) dan membuat perakaran Jagung kekurangan oksigen, ditandai dengan daun menguning."
            steps = [
                {"icon": "🚫", "title": "Tunda Pemupukan Nitrogen", "detail": "Jangan sebar pupuk Urea saat tanah jenuh air, karena akan langsung tercuci hilang sebelum diserap akar.", "priority": "urgent"},
                {"icon": "🪓", "title": "Sodok Saluran Pembuangan", "detail": "Buka ujung parit bedengan agar genangan air segera surut. Jagung membutuhkan tanah yang kaya oksigen untuk bernafas.", "priority": "urgent"},
                {"icon": "💨", "title": "Semprot Pupuk Daun Mikro", "detail": "Bantu pemulihan klorosis sementara dengan penyemprotan pupuk daun berkandungan magnesium dan sulfur.", "priority": "medium"}
            ]
    else:
        # Default / Cabai
        if m < 40:
            rec = f"Lakukan penyiraman segera. Tanaman {ptype} sangat rentan mengalami kerontokan bunga dan buah jika kelembaban tanah anjlok di bawah ambang kritis (40%)."
            steps = [
                {"icon": "💧", "title": "Penyiraman Segera", "detail": f"Siram lahan secara merata di pangkal batang {ptype} dengan volume 2-3 liter per tanaman. Gunakan irigasi tetes jika tersedia.", "priority": "urgent"},
                {"icon": "🌿", "title": "Mulching / Penutupan Tanah", "detail": "Tutup permukaan tanah dengan mulsa organik (jerami/sekam) setebal 5 cm untuk meredam laju penguapan air di siang hari.", "priority": "high"},
                {"icon": "🕐", "title": "Jadwal Pengairan Tepat Waktu", "detail": "Fokuskan penyiraman pada pagi (06.00-08.00) atau sore hari agar penyerapan air oleh bulu akar berlangsung efektif.", "priority": "high"},
                {"icon": "🌶️", "title": "Cek Tanda Kerontokan Bunga", "detail": f"Periksa apakah ada bunga {ptype} yang menguning dan gugur. Jika ya, berikan semprotan nutrisi mikro dan kalsium setelah disiram.", "priority": "medium"},
                {"icon": "⛅", "title": "Naungan Sementara", "detail": "Jika sengatan matahari sangat terik, pasang peneduh portabel/paranet untuk mengurangi stres termal pada daun muda.", "priority": "medium"}
            ]
        elif m <= 70:
            rec = f"Kondisi kelembaban tanah sangat optimal untuk penyerapan nutrisi. Mendukung penuh fase pembungaan dan pembuahan {ptype} dengan produktivitas maksimal."
            steps = [
                {"icon": "✅", "title": "Pertahankan Kondisi Saat Ini", "detail": f"Kelembaban berada di zona ideal (40-70%). Lanjutkan jadwal perawatan rutin {ptype} tanpa perubahan pengairan.", "priority": "normal"},
                {"icon": "🌱", "title": "Pemupukan Masa Generatif", "detail": "Kondisi tanah sangat mendukung penyerapan hara. Aplikasikan pupuk NPK seimbang atau tinggi kalium sesuai jadwal Kalender Tanam.", "priority": "normal"},
                {"icon": "🔍", "title": "Monitor Hama Kutu-kutuan", "detail": f"Periksa bagian bawah daun {ptype} dari ancaman kutu putih, thrips, atau aphid yang aktif menyerap cairan tanaman.", "priority": "normal"},
                {"icon": "📊", "title": "Pencatatan Data Mikro", "detail": "Simpan riwayat kelembaban ini sebagai acuan standar kelembaban optimal untuk siklus penanaman di musim mendatang.", "priority": "low"}
            ]
        else:
            rec = f"Tanah dalam kondisi jenuh air (>70%). Genangan berlebih pada {ptype} memicu berkembangnya patogen jamur tular tanah seperti layu Fusarium dan busuk akar."
            steps = [
                {"icon": "🚫", "title": "Hentikan Irigasi Total", "detail": f"Tunda seluruh jadwal penyiraman. Tanaman {ptype} membutuhkan jeda kering agar pori-pori tanah kembali terisi udara.", "priority": "urgent"},
                {"icon": "🔧", "title": "Perbaiki Sistem Drainase", "detail": "Pastikan saluran air antar bedengan lancar dan tidak tersumbat. Buat parit kecil pembuangan jika terdeteksi genangan lokal.", "priority": "urgent"},
                {"icon": "🍃", "title": "Aerasi Area Perakaran", "detail": "Tusuk-tusuk tanah di sekitar luar tajuk menggunakan garpu tanah untuk membantu penguapan air berlebih dari dalam tanah.", "priority": "high"},
                {"icon": "⚠️", "title": "Tunda Aplikasi Pupuk Akar", "detail": "Jangan berikan pupuk tabur/kocor saat tanah basah kuyup karena rentan tercuci (leaching) dan merusak ekosistem tanah.", "priority": "high"},
                {"icon": "🍄", "title": "Proteksi Jamur Patogen", "detail": f"Segera semprotkan fungisida organik atau kimiawi sistemik pada pangkal batang {ptype} untuk mencegah infeksi busuk batang.", "priority": "medium"}
            ]

    return rec, steps

@router.get("/status")
def get_iot_status(plant_type: Optional[str] = None):
    if plant_type:
        iot_state["plant_type"] = plant_type

    m = iot_state["moisture_percentage"]
    p_type = iot_state["plant_type"]
    
    # Penentuan status umum dan warna
    if m < 40:
        status = "Kering"
        color_code = "red"
    elif m <= 70:
        status = "Normal"
        color_code = "emerald"
    else:
        status = "Basah"
        color_code = "blue"

    recommendation, action_steps = get_agronomic_advice(p_type, m)

    return {
        "status": "success",
        "data": {
            "moisture_percentage": m,
            "soil_status": status,
            "plant_type": p_type,
            "recommendation": recommendation,
            "color_code": color_code,
            "last_updated": iot_state["last_updated"],
            "device_info": {
                "name": "AgriWise Soil Moisture Node v1.0",
                "microcontroller": "ESP32 Wi-Fi Enabled",
                "sensor_type": "Capacitive / Analog Soil Moisture Probe",
                "total_cost_idr": 395000,
                "portability": "Portable Base Structure (Non-permanent installation)",
                "protection_class": "IP65 Weatherproof Box",
            },
            "hardware_specs": HARDWARE_SPECS,
            "action_steps": action_steps,
        }
    }

@router.post("/simulate")
def simulate_iot_data(req: SimulateRequest):
    iot_state["moisture_percentage"] = req.moisture
    if req.plant_type:
        iot_state["plant_type"] = req.plant_type
    iot_state["last_updated"] = datetime.utcnow().isoformat()
    return {
        "status": "success", 
        "simulated_moisture": req.moisture,
        "plant_type": iot_state["plant_type"]
    }
