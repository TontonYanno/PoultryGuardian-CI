// Prédiction par régression linéaire sur les dernières valeurs du risque + mesure de l'erreur (MAE).
import { clamp } from './risk'
import { CFG } from '../config'

export function forecast(values, horizon = CFG.horizon) {
  const p = values.slice(-15)
  if (p.length < 5) return null
  const n = p.length, mx = (n - 1) / 2, my = p.reduce((a, b) => a + b) / n
  let num = 0, den = 0
  p.forEach((y, i) => { num += (i - mx) * (y - my); den += (i - mx) ** 2 })
  const slope = num / den, last = p[n - 1]
  return {
    value: clamp(last + slope * horizon, 0, 100),
    stepsToHigh: slope > 0.02 && last < CFG.high ? (CFG.high - last) / slope : null,
  }
}

// Garde en mémoire les prédictions et les compare à la réalité quand l'échéance arrive.
export function createEvaluator() {
  let pending = [], errors = [], step = 0
  return {
    tick(actual, predicted) {
      step++
      pending.filter((p) => p.at <= step).forEach((p) => errors.push(Math.abs(actual - p.v)))
      pending = pending.filter((p) => p.at > step)
      errors = errors.slice(-60)
      if (predicted != null) pending.push({ at: step + CFG.horizon, v: predicted })
    },
    mae: () => (errors.length ? errors.reduce((a, b) => a + b) / errors.length : null),
  }
}
