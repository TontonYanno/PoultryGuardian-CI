export default function Gauge({r,l}){
  const L=251.3;
  return(<svg viewBox="0 0 200 125" className="w-full max-w-[320px] mx-auto">
    <path d="M20 105A80 80 0 0 1 180 105" fill="none" stroke="var(--track)" strokeWidth="14" strokeLinecap="round"/>
    <path d="M20 105A80 80 0 0 1 180 105" fill="none" stroke={l.c} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${r/100*L} ${L}`} style={{transition:'all .6s',filter:`drop-shadow(0 0 8px ${l.c})`}}/>
    <text x="100" y="88" textAnchor="middle" fontSize="42" fontWeight="700" fill="var(--ink)">{Math.round(r)}</text>
    <text x="100" y="108" textAnchor="middle" fontSize="11" letterSpacing="3" fill={l.c} fontWeight="700">{l.n}</text>
  </svg>);
}
