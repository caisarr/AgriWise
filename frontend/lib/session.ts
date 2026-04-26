const KEY = 'agriwise_session_id'

export const getSessionId = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(KEY) : null

export const setSessionId = (id: string): void =>
  localStorage.setItem(KEY, id)
