// Garde-fou : ne jamais laisser une mesure absurde (NaN, capteur débranché...) entrer dans le système.
import { LIMITS } from '../config'

export function sanitize(raw) {
  const out = {}
  for (const k of ['t', 'h', 'c']) {
    const v = Number(raw?.[k])
    out[k] = raw?.[k] != null && Number.isFinite(v) && v >= LIMITS[k][0] && v <= LIMITS[k][1] ? v : null
  }
  return out
}
export const isUsable = (s) => s.t !== null && s.h !== null && s.c !== null
