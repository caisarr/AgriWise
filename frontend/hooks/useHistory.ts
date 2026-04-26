'use client'
import { useEffect, useState } from 'react'
import { fetchHistory } from '@/lib/api'
import type { HistoryItem } from '@/lib/types'

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory(10)
      .then(data => { setHistory(data.history || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return { history, loading }
}
