import { useState } from 'react'

const KEY = 'pg_settings'
const DEFAULTS = { source: 'sim', token: '', device: 'poultry-guardian', theme: 'auto' }

export function useSettings() {
  const [settings, set] = useState(() => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return DEFAULTS }
  })
  const update = (patch) => set((s) => {
    const n = { ...s, ...patch }
    try { localStorage.setItem(KEY, JSON.stringify(n)) } catch { /* ignore */ }
    return n
  })
  return [settings, update]
}
