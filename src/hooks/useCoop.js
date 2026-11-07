// Chef d'orchestre : interroge la source, valide, calcule risque + prévision,
// applique la régulation automatique et expose des commandes manuelles.
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { CFG, ACTUATOR_LABELS } from '../config'
import { createApi } from '../services'
import { eventLog } from '../services/eventLog'
import { risk as calcRisk } from '../domain/risk'
import { sanitize, isUsable } from '../domain/validate'
import { forecast, createEvaluator } from '../domain/forecast'
import { decide } from '../domain/control'

export function useCoop(settings) {
  const api = useMemo(() => createApi(settings), [settings.source, settings.token, settings.device]) // eslint-disable-line react-hooks/exhaustive-deps
  const [mode, setMode] = useState('auto')
  const [estop, setEstop] = useState(false)
  const [snap, setSnap] = useState({ status: 'loading', error: null, sensors: {}, actuators: { fan: 0, mist: 0, heater: 0 }, risk: 0, hist: [], forecast: null, mae: null })
  const [events, setEvents] = useState(eventLog.list())

  const live = useRef({ mode, estop, act: { fan: 0, mist: 0, heater: 0 }, hist: [], evalr: createEvaluator(), busy: false })
  live.current.mode = mode
  live.current.estop = estop

  const log = useCallback((e) => setEvents(eventLog.add(e)), [])

  // Envoie une commande à l'enceinte puis journalise le résultat
  const command = useCallback(async (name, value, reason) => {
    const label = ACTUATOR_LABELS[name].name
    try {
      await api.sendCommand(name, value)
      live.current.act = { ...live.current.act, [name]: value }
      setSnap((s) => ({ ...s, actuators: { ...live.current.act } }))
      log({ type: 'action', name, value, text: `${label} ${value ? 'ON' : 'OFF'}`, reason })
    } catch (e) {
      log({ type: 'error', text: `Échec commande ${label} : ${e.message}` })
    }
  }, [api, log])

  useEffect(() => {
    live.current.act = { fan: 0, mist: 0, heater: 0 }
    live.current.hist = []
    live.current.evalr = createEvaluator()
    let stop = false

    async function poll() {
      const L = live.current
      if (L.busy) return
      L.busy = true
      try {
        const { sensors, actuators } = await api.readSensors()
        Object.keys(actuators).forEach((k) => { if (actuators[k] !== null) L.act[k] = actuators[k] }) // vérité terrain
        const clean = sanitize(sensors)
        const usable = isUsable(clean)
        const status = !usable ? 'invalid' : Date.now() - sensors.ts > CFG.staleMs ? 'stale' : 'ok'
        let r = L.hist.length ? L.hist[L.hist.length - 1].r : 0
        let fc = null

        if (status === 'ok') {
          r = calcRisk(clean.t, clean.h, clean.c)
          L.hist = [...L.hist, { ts: Date.now(), ...clean, r }].slice(-90)
          fc = forecast(L.hist.map((p) => p.r))
          L.evalr.tick(r, fc?.value)
        }
        if (stop) return

        // --- Régulation ---
        if (L.estop) {
          for (const k of Object.keys(L.act)) if (L.act[k]) await command(k, 0, 'arrêt d’urgence')
        } else if (status === 'invalid' || status === 'stale') {
          if (L.mode === 'auto' && !L.act.fan) await command('fan', 1, 'sécurité : données capteurs indisponibles')
        } else if (L.mode === 'auto') {
          for (const c of decide({ t: clean.t, risk: r, predicted: fc?.value }, L.act)) await command(c.name, c.value, c.reason)
        }

        setSnap({ status, error: null, sensors: { ...clean, ts: sensors.ts }, actuators: { ...L.act }, risk: r, hist: L.hist, forecast: fc, mae: L.evalr.mae() })
      } catch (e) {
        setSnap((s) => ({ ...s, status: 'offline', error: e.message }))
      } finally { L.busy = false }
    }

    poll()
    const id = setInterval(poll, CFG.pollMs[api.kind === 'sim' ? 'sim' : 'ubidots'])
    return () => { stop = true; clearInterval(id) }
  }, [api, command])

  // Commande manuelle (autorisée seulement en mode manuel, hors arrêt d'urgence)
  const toggle = (name) => { if (mode === 'manual' && !estop) command(name, live.current.act[name] ? 0 : 1, 'commande manuelle') }
  const emergency = () => { const v = !estop; setEstop(v); log({ type: 'system', text: v ? 'ARRÊT D’URGENCE' : 'Reprise après arrêt d’urgence' }) }
  const changeMode = (m) => { setMode(m); log({ type: 'system', text: `Mode ${m === 'auto' ? 'automatique' : 'manuel'}` }) }
  const clearEvents = () => setEvents(eventLog.clear())

  return { api, snap, mode, estop, events, toggle, emergency, changeMode, clearEvents }
}
