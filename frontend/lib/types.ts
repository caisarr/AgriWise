export type Season = string

export interface CropRecommendation {
  crop_name:                    string
  crop_slug:                    string
  local_name:                   string
  reason:                       string
  planting_season:              string
  harvest_duration_days:        number
  avg_price_per_kg:             number
  price_trend:                  'naik' | 'stabil' | 'turun'
  estimated_yield_per_100m2_kg: number
  difficulty_level:             'mudah' | 'sedang' | 'sulit'
  tips:                         string
  db_price_per_kg?:             number
  price_source?:                string
  price_updated?:               string
}

export interface RecommendResult {
  session_id:        string
  recommendation_id: string
  recommendations:   CropRecommendation[]
  season_summary:    string
  weather:           WeatherData
  duration_ms:       number
}

export interface WeatherData {
  temperature?: number
  humidity?:    number
  rainfall?:    number
  description?: string
}

export interface HistoryItem {
  id:             string
  created_at:     string
  season:         Season
  elevation_m:    number
  province:       string | null
  season_summary: string | null
  ai_response:    CropRecommendation[]
}

export interface CropPrice {
  crop_name:    string
  crop_label:   string
  price_per_kg: number
  price_min:    number | null
  price_max:    number | null
  recorded_at:  string
}
