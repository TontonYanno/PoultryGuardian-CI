// Charge l'historique d'une variable sur une période (Ubidots ou simulateur).
import { useEffect, useState } from 'react'

const MAX_POINTS = 240
const downsample = (a) => { const k = Math.ceil(a.length / MAX_POINTS); return k > 1 ? a.filter((_, i) => i % k === 0) : a }

export function useHistory(api, variable, rangeMs) {
  const [state, setState] = useState({ loading: true, error: null, series: [] })
  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    const to = Date.now()
    api.readHistory(variable, { from: to - rangeMs, to })
      .then((raw) => !cancelled && setState({ loading: false, error: null, series: downsample(raw.filter((p) => Number.isFinite(Number(p.v))).map((p) => ({ ts: p.ts, v: Number(p.v) }))) }))
      .catch((e) => !cancelled && setState({ loading: false, error: e.message, series: [] }))
    return () => { cancelled = true }
  }, [api, variable, rangeMs])
  return state
}
