import { CFG, ACTUATOR_LABELS } from '../config'
import { level, clamp } from '../domain/risk'
import { num, fmtDateTime } from '../lib/format'
import Gauge from '../components/Gauge'
import Coop from '../components/Coop'
import Tile from '../components/Tile'
import Btn from '../components/Btn'
import LineChart from '../components/LineChart'

const STATUS = {
  ok: ['bg-emerald-400', 'Connecté'], loading: ['bg-slate-400', 'Connexion…'],
  stale: ['bg-amber-400', 'Données périmées'], invalid: ['bg-red-500', 'Capteur invalide'], offline: ['bg-red-500', 'Hors ligne'],
}

export default function Dashboard({ coop }) {
  const { snap, api, mode, estop, events, toggle, emergency, changeMode } = coop
  const { sensors: s, actuators: act, risk, status, forecast: fc, hist } = snap
  const l = level(risk)
  const [dot, statusLabel] = STATUS[status]
  const pollMs = CFG.pollMs[api.kind === 'sim' ? 'sim' : 'ubidots']
  const alert = estop ? '⛔ Arrêt d’urgence actif'
    : status === 'offline' ? `📡 Connexion perdue : ${snap.error}`
    : status === 'stale' ? '⚠ Données périmées : l’enceinte ne répond plus'
    : status === 'invalid' ? '⚠ Mesures invalides : mode sécurité'
    : risk >= CFG.high ? '🔥 Risque thermique élevé'
    : s.t <= CFG.coldOn ? '❄ Température basse' : ''

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-3 flex items-center gap-2 text-xs text-body">
        <span className={`w-2 h-2 rounded-full pulse ${dot}`} />{statusLabel} · {api.kind === 'sim' ? 'simulation' : 'Ubidots'}
        {s.ts ? <span className="text-mute2">· dernière mesure {fmtDateTime(s.ts)}</span> : null}
      </div>
      {alert && <div className="md:col-span-3 rounded-2xl px-4 py-3 font-semibold text-center border border-red-400/60 bg-red-500/15">{alert}</div>}

      <div className="panel p-5">
        <div className="text-[11px] tracking-widest uppercase text-mute mb-1">Indice de risque</div>
        <Gauge r={risk} l={{ n: l.name, c: l.color }} />
        <div className="grid grid-cols-3 text-center mt-2 text-xs text-mute">
          <div><b className="block text-lg text-ink">{fc ? Math.round(fc.value) : '—'}</b>prévu +{CFG.horizon}</div>
          <div><b className="block text-lg text-ink">{fc?.stepsToHigh != null ? Math.round(fc.stepsToHigh) : '—'}</b>mesures avant seuil</div>
          <div><b className="block text-lg text-ink">{snap.mae != null ? snap.mae.toFixed(1) : '—'}</b>MAE</div>
        </div>
      </div>
      <div className="panel p-3">
        <div className="text-[11px] tracking-widest uppercase text-mute px-2 pt-2">Enceinte</div>
        <Coop act={act} t={s.t} color={l.color} />
      </div>
      <div className="grid gap-3 content-start">
        <Tile icon="🌡" label="Température" v={num(s.t)} unit="°C" pct={clamp((s.t - 20) / 25) || 0} color="#ff8a4d" />
        <Tile icon="💧" label="Humidité" v={num(s.h, 0)} unit="%" pct={clamp(s.h / 100) || 0} color="#4dc3ff" />
        <Tile icon="🫧" label="CO₂" v={num(s.c, 0)} unit="ppm" pct={clamp((s.c - 400) / 3000) || 0} color="#b58cff" />
      </div>

      <div className="panel p-5 md:col-span-2">
        <div className="text-[11px] tracking-widest uppercase text-mute mb-1">Risque en direct et prévision</div>
        <LineChart series={hist.map((p) => ({ ts: p.ts, v: p.r }))} color={l.color} yMin={0} yMax={100}
          thresholds={[{ v: CFG.med, c: '#ffb020' }, { v: CFG.high, c: '#ff4d4d' }]}
          forecast={fc ? { value: fc.value, deltaMs: CFG.horizon * pollMs } : null} />
      </div>

      <div className="panel p-5">
        <div className="text-[11px] tracking-widest uppercase text-mute mb-3">Commandes à distance</div>
        <div className="flex flex-wrap gap-2 mb-3">
          <Btn on={mode === 'auto'} onClick={() => changeMode('auto')}>Auto</Btn>
          <Btn on={mode === 'manual'} onClick={() => changeMode('manual')}>Manuel</Btn>
          <Btn danger onClick={emergency}>{estop ? 'Reprendre' : 'Arrêt d’urgence'}</Btn>
        </div>
        <div className="grid gap-2">
          {Object.entries(ACTUATOR_LABELS).map(([k, a]) => (
            <Btn key={k} on={!!act[k]} disabled={mode !== 'manual' || estop} onClick={() => toggle(k)} className="text-left disabled:opacity-60">
              {a.icon} {a.action} <span className="float-right text-xs">{a.name} {act[k] ? 'ON' : 'OFF'}</span>
            </Btn>
          ))}
        </div>
        <p className="text-xs text-mute2 mt-2">{mode === 'auto' ? 'Régulation automatique active.' : 'Mode manuel : touchez une action.'}</p>
        {api.kind === 'sim' && (
          <div className="mt-4 pt-3 border-t border-line">
            <div className="text-[11px] tracking-widest uppercase text-mute mb-2">Banc de test</div>
            <div className="flex flex-wrap gap-2">
              {[12, 30, 42].map((a) => <Btn key={a} on={api.getAmbient() === a} onClick={() => api.setAmbient(a)}>{a} °C</Btn>)}
              <Btn onClick={() => api.toggleFault()}>Défaut capteur</Btn>
            </div>
          </div>
        )}
      </div>

      <div className="panel p-5 md:col-span-3">
        <div className="text-[11px] tracking-widest uppercase text-mute mb-2">Dernières décisions</div>
        <div className="font-mono text-xs text-body space-y-1">
          {events.slice(0, 6).map((e, i) => <div key={i}><span className="text-mute2">{fmtDateTime(e.ts)}</span> {e.text}{e.reason ? <span className="text-mute2"> · {e.reason}</span> : null}</div>)}
          {!events.length && <span className="text-mute2">Aucune action pour l’instant.</span>}
        </div>
      </div>
    </div>
  )
}
