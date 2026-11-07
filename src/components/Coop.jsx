// Illustration animée de l'enceinte : ventilateur qui tourne, gouttes, flammes, halo de couleur.
export default function Coop({ act, t, color }) {
  return (
    <svg viewBox="0 0 300 190" className="w-full">
      <defs><radialGradient id="gl"><stop offset="0" stopColor={color} stopOpacity=".45" /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="150" cy="110" rx="140" ry="80" fill="url(#gl)" style={{ transition: 'all .6s' }} />
      <polygon points="40,70 150,15 260,70" fill="var(--svg-roof)" stroke="var(--svg-stroke)" />
      <rect x="55" y="70" width="190" height="90" rx="6" fill="var(--svg-wall)" stroke="var(--svg-stroke)" />
      <rect x="30" y="160" width="240" height="8" rx="4" fill="var(--svg-roof)" />
      <text x="110" y="148" fontSize="44">🐔</text><text x="150" y="148" fontSize="30">🐔</text>
      <g transform="translate(212 100)"><circle r="22" fill="var(--svg-hole)" stroke="var(--svg-stroke)" />
        <g className={act.fan ? 'spin' : ''}>{[0, 90, 180, 270].map((a) => <ellipse key={a} cx="0" cy="-11" rx="5" ry="10" fill={act.fan ? '#6ec1ff' : 'var(--svg-stroke)'} transform={`rotate(${a})`} />)}</g></g>
      {act.mist ? [75, 100, 125, 150, 175].map((x, i) => <circle key={x} className="drop" cx={x} cy="80" r="3" fill="#6ec1ff" style={{ animationDelay: `${i * 0.22}s` }} />) : null}
      {act.heater ? [80, 105, 130].map((x, i) => <text key={x} className="pulse" x={x} y="138" fontSize="16" style={{ animationDelay: `${i * 0.3}s` }}>🔥</text>) : null}
      <text x="150" y="40" textAnchor="middle" fontSize="12" fill="var(--ink)" fontWeight="600">{Number.isFinite(t) ? t.toFixed(1) + ' °C' : '—'}</text>
    </svg>
  )
}
