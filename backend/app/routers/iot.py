from fastapi import APIRouter
from pydantic import BaseModel, Field
from datetime import datetime

router = APIRouter(prefix="/api/iot", tags=["iot"])

# In-memory simulator state untuk keperluan presentasi/perlombaan
iot_state = {
    "moisture_percentage": 45,
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

@router.get("/status")
def get_iot_status():
    m = iot_state["moisture_percentage"]
    
    # Penentuan status berdasarkan ambang batas agronomis
    if m < 40:
        status = "Kering"
        recommendation = "Lakukan penyiraman segera. Kelembaban tanah di bawah ambang batas kritis (40%), berisiko memicu stres air dan layu permanen pada tanaman."
        color_code = "red"
        action_steps = [
            {"icon": "💧", "title": "Penyiraman Segera", "detail": "Siram lahan secara merata dengan volume 2-3 liter per m². Gunakan metode tetes (drip) jika tersedia untuk efisiensi air maksimal.", "priority": "urgent"},
            {"icon": "🌿", "title": "Mulching / Penutupan Tanah", "detail": "Tutup permukaan tanah dengan mulsa organik (jerami, sekam padi) setebal 5-10 cm untuk mengurangi evaporasi dan menjaga kelembaban.", "priority": "high"},
            {"icon": "🕐", "title": "Jadwal Penyiraman Berkala", "detail": "Atur penyiraman di pagi hari (06.00-08.00) dan sore hari (16.00-18.00) agar penyerapan optimal dan menghindari penguapan di jam panas.", "priority": "high"},
            {"icon": "🧪", "title": "Periksa Kondisi Akar", "detail": "Cek apakah tanaman mulai menunjukkan gejala layu, daun menguning, atau pengerutan. Jika ya, berikan larutan pupuk cair encer untuk membantu pemulihan.", "priority": "medium"},
            {"icon": "⛅", "title": "Pasang Peneduh Sementara", "detail": "Jika cuaca panas terik, pasang paranet dengan naungan 50-60% untuk mengurangi paparan sinar matahari langsung dan tekanan evapotranspirasi.", "priority": "medium"},
        ]
    elif m <= 70:
        status = "Normal"
        recommendation = "Kondisi kelembaban tanah sangat optimal untuk penyerapan nutrisi. Kelembaban terjaga dengan baik, tidak diperlukan penyiraman tambahan saat ini."
        color_code = "emerald"
        action_steps = [
            {"icon": "✅", "title": "Pertahankan Kondisi Saat Ini", "detail": "Kelembaban berada di zona ideal (40-70%). Lanjutkan jadwal perawatan rutin tanpa perubahan signifikan pada pola pengairan.", "priority": "normal"},
            {"icon": "🌱", "title": "Pemupukan Optimal", "detail": "Kondisi kelembaban ini sangat ideal untuk pemupukan. Aplikasikan pupuk sesuai jadwal Kalender Tanam agar penyerapan nutrisi oleh akar maksimal.", "priority": "normal"},
            {"icon": "🔍", "title": "Monitor Hama & Penyakit", "detail": "Kelembaban optimal juga menjadi lingkungan yang nyaman bagi hama. Lakukan pengecekan visual rutin pada daun bawah dan batang tanaman.", "priority": "normal"},
            {"icon": "📊", "title": "Catat Data untuk Analisis", "detail": "Dokumentasikan kondisi kelembaban harian untuk membangun pola data jangka panjang. Gunakan catatan ini untuk optimasi jadwal irigasi di musim berikutnya.", "priority": "low"},
        ]
    else:
        status = "Basah"
        recommendation = "Tanah dalam kondisi jenuh air (>70%). Tunda penyiraman dan pastikan sistem drainase berfungsi lancar agar perakaran tanaman tidak mengalami pembusukan akibat kondisi anaerob."
        color_code = "blue"
        action_steps = [
            {"icon": "🚫", "title": "Hentikan Penyiraman", "detail": "Jangan tambah air ke lahan. Tunda seluruh jadwal penyiraman hingga kelembaban kembali turun ke zona normal (di bawah 70%).", "priority": "urgent"},
            {"icon": "🔧", "title": "Periksa Sistem Drainase", "detail": "Pastikan saluran drainase tidak tersumbat oleh sampah atau sedimen. Buat parit kecil di sekeliling bedengan jika diperlukan agar air tergenang bisa mengalir keluar.", "priority": "urgent"},
            {"icon": "🍃", "title": "Aerasi Tanah", "detail": "Buat lubang-lubang kecil di sekitar zona perakaran menggunakan garpu tanah untuk memperbaiki sirkulasi udara dan mencegah kondisi anaerob yang menyebabkan busuk akar.", "priority": "high"},
            {"icon": "⚠️", "title": "Tunda Pemupukan", "detail": "Jangan melakukan pemupukan saat tanah jenuh air. Pupuk akan larut terbawa air dan tidak terserap optimal, menyebabkan pemborosan biaya dan risiko pencemaran.", "priority": "high"},
            {"icon": "🍄", "title": "Waspadai Jamur & Penyakit", "detail": "Kelembaban tinggi mempercepat pertumbuhan jamur patogen. Periksa pangkal batang dan akar. Jika ditemukan bercak atau lendir, aplikasikan fungisida nabati segera.", "priority": "medium"},
        ]

    return {
        "status": "success",
        "data": {
            "moisture_percentage": m,
            "soil_status": status,
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
    iot_state["last_updated"] = datetime.utcnow().isoformat()
    return {"status": "success", "simulated_moisture": req.moisture}
