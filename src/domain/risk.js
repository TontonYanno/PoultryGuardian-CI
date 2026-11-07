// Indice de risque thermique 0-100 : pondération de la chaleur, de l'humidité et du CO₂.
import { CFG } from '../config'

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))

export const risk = (t, h, c) =>
  100 * (0.5 * clamp((t - 28) / 8) + 0.25 * clamp((h - 60) / 30) + 0.25 * clamp((c - 1000) / 2000))

export const level = (r) =>
  r >= CFG.high ? { name: 'ÉLEVÉ', color: '#ff4d4d' }
  : r >= CFG.med ? { name: 'MOYEN', color: '#ffb020' }
  : { name: 'FAIBLE', color: '#2ee59d' }
