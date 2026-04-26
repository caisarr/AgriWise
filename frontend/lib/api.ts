import { getSessionId, setSessionId } from './session'

const BASE = process.env.NEXT_PUBLIC_API_URL

export interface RecommendPayload {
  planting_date: string
  elevation_m:   number
  province?:     string
  land_area_m2?: number
  budget_idr?:   number
  lat?:          number
  lon?:          number
  city?:         string
  soil_type?:    string
  water_source?: string
  experience?:   string
}

export async function fetchRecommendations(payload: RecommendPayload) {
  const sessionId = getSessionId()
  const res = await fetch(`${BASE}/api/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId ? { 'x-session-id': sessionId } : {}),
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Gagal mengambil rekomendasi')
  const data = await res.json()
  if (data.session_id) setSessionId(data.session_id)
  return data
}

export async function fetchHistory(limit = 10) {
  const sessionId = getSessionId()
  if (!sessionId) return { history: [] }
  const res = await fetch(`${BASE}/api/history?limit=${limit}`, {
    headers: { 'x-session-id': sessionId },
  })
  return res.json()
}

export async function fetchPriceHistory(cropName: string, days = 30) {
  const res = await fetch(`${BASE}/api/prices/${cropName}?days=${days}`)
  return res.json()
}

export async function sendChat(messages: { role: string; content: string }[], context = '') {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  })
  return res.json()
}
export async function diagnosePlant(imageBase64: string) {
  const res = await fetch(`${BASE}/api/diagnosis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: imageBase64 }),
  })
  if (!res.ok) throw new Error('Diagnosis gagal')
  return res.json()
}

export async function generateCalendar(cropName: string) {
  const res = await fetch(`${BASE}/api/calendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crop_name: cropName }),
  })
  if (!res.ok) throw new Error('Pembuatan kalender gagal')
  return res.json()
}
