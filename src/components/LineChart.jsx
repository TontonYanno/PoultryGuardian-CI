// Graphique SVG générique : courbe + aire, seuils horizontaux, point de prévision optionnel.
import { fmtTime } from '../lib/format'

export default function LineChart({ series, color = '#ffb020', unit = '', thresholds = [], forecast = null, yMin, yMax, height = 200 }) {
  if (series.length < 2) return <div className="grid place-items-center text-sm text-mute2" style={{ height }}>Pas assez de données</div>
  const W = 640, H = height, padL = 8, padB = 18
  const x0 = series[0].ts, x1 = series[series.length - 1].ts + (forecast?.deltaMs || 0)
  const vs = series.map((p) => p.v)
  let lo = yMin ?? Math.min(...vs), hi = yMax ?? Math.max(...vs)
  if (hi - lo < 1) { hi += 0.5; lo -= 0.5 }
  const X = (ts) => padL + ((ts - x0) / (x1 - x0 || 1)) * (W - padL * 2)
  const Y = (v) => H - padB - ((v - lo) / (hi - lo)) * (H - padB - 8)
  const pts = series.map((p) => `${X(p.ts)},${Y(p.v)}`).join(' ')
  const lastP = series[series.length - 1]
  const gid = 'a' + color.slice(1)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {thresholds.map(({ v, c }) => <line key={v} x1="0" x2={W} y1={Y(v)} y2={Y(v)} stroke={c} strokeDasharray="4 5" opacity=".5" />)}
      <polygon points={`${X(series[0].ts)},${H - padB} ${pts} ${X(lastP.ts)},${H - padB}`} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {forecast && <><line x1={X(lastP.ts)} y1={Y(lastP.v)} x2={X(x1)} y2={Y(forecast.value)} stroke="var(--ink)" strokeWidth="2" strokeDasharray="5 4" /><circle cx={X(x1)} cy={Y(forecast.value)} r="4" fill="var(--ink)" className="pulse" /></>}
      <text x="10" y="14" fontSize="11" fill="var(--mute)">{hi.toFixed(1)} {unit}</text>
      <text x="10" y={H - padB - 4} fontSize="11" fill="var(--mute)">{lo.toFixed(1)} {unit}</text>
      <text x="10" y={H - 3} fontSize="11" fill="var(--mute)">{fmtTime(x0)}</text>
      <text x={W - 10} y={H - 3} fontSize="11" fill="var(--mute)" textAnchor="end">{fmtTime(lastP.ts)}</text>
    </svg>
  )
}
