// Client de l'API REST Ubidots. Timeout + une nouvelle tentative + erreurs explicites.
import { CFG, VARS } from '../config'

const BASE = 'https://industrial.api.ubidots.com/api/v1.6'

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status }
}

async function http(token, pathOrUrl, { method = 'GET', body, retry = 1 } = {}) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : BASE + pathOrUrl
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), CFG.timeoutMs)
  try {
    const res = await fetch(url, {
      method, signal: ctl.signal,
      headers: { 'X-Auth-Token': token, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 401 || res.status === 403) throw new ApiError('Token Ubidots refusé', res.status)
    if (res.status === 404) throw new ApiError('Device ou variable introuvable', 404)
    if (!res.ok) throw new ApiError(`Erreur Ubidots ${res.status}`, res.status)
    return await res.json()
  } catch (e) {
    if (e instanceof ApiError && e.status < 500) throw e // inutile de réessayer une erreur de configuration
    if (retry > 0) return http(token, pathOrUrl, { method, body, retry: retry - 1 })
    throw e instanceof ApiError ? e : new ApiError(e.name === 'AbortError' ? 'Délai dépassé' : 'Réseau indisponible', 0)
  } finally { clearTimeout(timer) }
}

export function createUbidotsApi({ token, device }) {
  const dev = `/devices/${encodeURIComponent(device)}`
  const last = async (variable) => {
    const { results } = await http(token, `${dev}/${variable}/values/?page_size=1`)
    return results?.[0] ? { value: results[0].value, ts: results[0].timestamp } : null
  }
  return {
    kind: 'ubidots',

    // Dernières valeurs des capteurs + état réel des actionneurs (l'ESP32 doit les republier)
    async readSensors() {
      const names = [...Object.entries(VARS.sensors), ...VARS.actuators.map((a) => [a, a])]
      const res = await Promise.allSettled(names.map(([, v]) => last(v)))
      if (res.every((r) => r.status === 'rejected')) throw res[0].reason
      const sensors = { ts: 0 }, actuators = {}
      names.forEach(([key], i) => {
        const r = res[i].status === 'fulfilled' ? res[i].value : null
        if (VARS.actuators.includes(key)) actuators[key] = r ? Number(r.value) : null
        else { sensors[key] = r ? r.value : null; sensors.ts = Math.max(sensors.ts, r?.ts || 0) }
      })
      return { sensors, actuators }
    },

    // Historique d'une variable sur [from, to] (pagination suivie, max 5 pages)
    async readHistory(variable, { from, to }) {
      let url = `${dev}/${variable}/values/?page_size=500&start=${from}&end=${to}`
      const out = []
      for (let i = 0; i < 5 && url; i++) {
        const page = await http(token, url)
        page.results.forEach((r) => out.push({ ts: r.timestamp, v: r.value }))
        url = page.next
      }
      return out.reverse()
    },

    // Commande à distance : l'ESP32 lit la variable et active le relais
    async sendCommand(name, value) {
      await http(token, `${dev}/`, { method: 'POST', body: { [name]: value } })
    },
  }
}
