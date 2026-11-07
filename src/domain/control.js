// Règles de décision (hystérésis + anticipation). Renvoie les changements à appliquer.
// Fonction pure : facile à tester et à expliquer.
import { CFG } from '../config'

export function decide({ t, risk, predicted }, act) {
  const next = { ...act }, reasons = {}
  const q = Math.max(risk, predicted ?? 0) // on réagit au pire entre maintenant et la prévision

  // Refroidir
  if (!act.fan && q >= CFG.fanOn) { next.fan = 1; reasons.fan = `risque ${risk | 0}, prévu ${q | 0}` }
  else if (act.fan && risk <= CFG.fanOff) { next.fan = 0; reasons.fan = `risque redescendu à ${risk | 0}` }
  if (!act.mist && q >= CFG.mistOn) { next.mist = 1; reasons.mist = `risque ${risk | 0}, prévu ${q | 0}` }
  else if (act.mist && risk <= CFG.mistOff) { next.mist = 0; reasons.mist = `risque redescendu à ${risk | 0}` }

  // Chauffer (température basse)
  if (!act.heater && t <= CFG.coldOn) { next.heater = 1; reasons.heater = `${t.toFixed(1)} °C : trop froid` }
  else if (act.heater && t >= CFG.coldOff) { next.heater = 0; reasons.heater = `${t.toFixed(1)} °C : température rétablie` }

  // Sécurité : on ne chauffe jamais en même temps qu'on refroidit
  if (next.heater && (next.fan || next.mist)) { next.heater = 0; reasons.heater = 'refroidissement prioritaire' }

  return Object.keys(next).filter((k) => next[k] !== act[k]).map((k) => ({ name: k, value: next[k], reason: reasons[k] }))
}
