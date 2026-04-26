'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CropPrice } from '@/lib/types'

export function useLivePrices(cropSlugs: string[]) {
  const [prices, setPrices]   = useState<Record<string, CropPrice>>({})
  const [loading, setLoading] = useState(true)

  // Fetch awal
  useEffect(() => {
    if (!cropSlugs.length) { setLoading(false); return }

    supabase
      .from('crop_prices')
      .select('crop_name, crop_label, price_per_kg, price_min, price_max, recorded_at')
      .eq('is_latest', true)
      .in('crop_name', cropSlugs)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, CropPrice> = {}
          data.forEach(p => { map[p.crop_name] = p })
          setPrices(map)
        }
        setLoading(false)
      })
  }, [cropSlugs.join(',')])

  // Realtime subscription
  useEffect(() => {
    if (!cropSlugs.length) return

    const channel = supabase
      .channel(`live_prices_${Math.random()}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'crop_prices',
        filter: 'is_latest=eq.true',
      }, (payload) => {
        const updated = payload.new as CropPrice
        if (cropSlugs.includes(updated.crop_name)) {
          setPrices(prev => ({ ...prev, [updated.crop_name]: updated }))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [cropSlugs.join(',')])

  return { prices, loading }
}
