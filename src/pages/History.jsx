import { useState } from 'react'
import { RANGES, METRICS } from '../config'
import { useHistory } from '../hooks/useHistory'
import { fmtDateTime } from '../lib/format'
import LineChart from '../components/LineChart'
import Btn from '../components/Btn'

function exportCsv(metric, series, events) {
  const m = METRICS[metric]
  const rows = [`horodatage,${m.variable}_${m.unit}`, ...series.map((p) => `${new Date(p.ts).toISOString()},${p.v}`)]
  const ev = ['', 'horodatage,type,action,raison', ...events.map((e) => `${new Date(e.ts).toISOString()},${e.type},"${e.text}","${e.reason || ''}"`)]
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([[...rows, ...ev].join('\n')], { type: 'text/csv' }))
  a.download = `poultryguardian_${m.variable}.csv`
  a.click()
}

export default function History({ coop }) {
  const [metric, setMetric] = useState('t')
  const [range, setRange] = useState(RANGES[1])
  const m = METRICS[metric]
  const { loading, error, series } = useHistory(coop.api, m.variable, range.ms)
  const vs = series.map((p) => p.v)
  const stats = vs.length ? { Min: Math.min(...vs), Moyenne: vs.reduce((a, b) => a + b) / vs.length, Max: Math.max(...vs) } : null
  const since = Date.now() - range.ms
  const events = coop.events.filter((e) => e.ts >= since)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(METRICS).map(([k, v]) => <Btn key={k} on={metric === k} onClick={() => setMetric(k)}>{v.label}</Btn>)}
        <span className="flex-1" />
        {RANGES.map((r) => <Btn key={r.k} on={range.k === r.k} onClick={() => setRange(r)}>{r.label}</Btn>)}
      </div>

      <div className="panel p-5">
        <div className="text-[11px] tracking-widest uppercase text-mute mb-2">{m.label} · {range.label}</div>
        {loading ? <div className="h-52 grid place-items-center text-mute2 pulse">Chargement…</div>
          : error ? <div className="h-52 grid place-items-center text-danger text-sm">Impossible de charger l’historique : {error}</div>
          : <LineChart series={series} color={m.color} unit={m.unit} height={220} />}
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(stats).map(([l, v]) => (
            <div key={l} className="panel p-4 text-center"><div className="text-xs text-mute">{l}</div>
              <div className="text-2xl font-bold" style={{ color: m.color }}>{v.toFixed(m.unit === 'ppm' ? 0 : 1)}<span className="text-sm text-mute ml-1">{m.unit}</span></div></div>
          ))}
        </div>
      )}

      <div className="panel p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] tracking-widest uppercase text-mute">Actions sur la période ({events.length})</div>
          <div className="flex gap-2"><Btn onClick={() => exportCsv(metric, series, events)}>⬇ CSV</Btn><Btn onClick={coop.clearEvents}>Vider</Btn></div>
        </div>
        <div className="max-h-72 overflow-auto text-sm divide-y divide-line">
          {events.map((e, i) => (
            <div key={i} className="py-2 flex gap-3">
              <span className="text-mute2 text-xs w-24 shrink-0 pt-0.5">{fmtDateTime(e.ts)}</span>
              <span className={e.type === 'error' ? 'text-danger' : ''}>{e.text}{e.reason ? <span className="text-mute2"> · {e.reason}</span> : null}</span>
            </div>
          ))}
          {!events.length && <div className="py-4 text-mute2">Aucune action enregistrée sur cette période.</div>}
        </div>
      </div>
    </div>
  )
}
