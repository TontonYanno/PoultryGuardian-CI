// Fausse enceinte pour la démo : même interface que le client Ubidots (readSensors / readHistory / sendCommand).
const noise = () => Math.random() - 0.5

export function createSimulator() {
  const m = { amb: 30, t: 29, h: 65, c: 800 }
  const act = { fan: 0, mist: 0, heater: 0 }
  let fault = false
  const store = []

  const physics = () => {
    m.t += 0.04 * (m.amb - m.t) - act.fan * 0.09 * (m.t - 25) - act.mist * 0.05 * (m.t - 25) + act.heater * 0.35 + noise() * 0.12
    m.h += 0.05 * (60 - m.h) + act.mist * 1.6 - act.fan * 0.06 * (m.h - 60) + noise() * 0.5
    m.c += 22 - act.fan * 0.1 * (m.c - 420) + noise() * 12
    m.h = Math.min(100, Math.max(0, m.h))
    m.c = Math.min(9000, m.c)
  }
  // Historique initial : 6 h de points toutes les minutes
  const now = Date.now()
  for (let i = 360; i > 0; i--) {
    m.amb = 30 + 4 * Math.sin(i / 40); for (let k = 0; k < 30; k++) physics()
    store.push({ ts: now - i * 60000, t: m.t, h: m.h, c: m.c })
  }
  m.amb = 30

  return {
    kind: 'sim',
    async readSensors() {
      physics()
      const ts = Date.now()
      if (ts - store[store.length - 1].ts > 10000) store.push({ ts, t: m.t, h: m.h, c: m.c })
      return { sensors: fault ? { t: null, h: null, c: null, ts } : { t: m.t, h: m.h, c: m.c, ts }, actuators: { ...act } }
    },
    async readHistory(variable, { from, to }) {
      const key = { temperature: 't', humidity: 'h', co2: 'c' }[variable]
      return store.filter((p) => p.ts >= from && p.ts <= to).map((p) => ({ ts: p.ts, v: p[key] }))
    },
    async sendCommand(name, value) { act[name] = value },
    // Banc de test (uniquement en simulation)
    setAmbient: (v) => { m.amb = v },
    getAmbient: () => m.amb,
    toggleFault: () => (fault = !fault),
  }
}
