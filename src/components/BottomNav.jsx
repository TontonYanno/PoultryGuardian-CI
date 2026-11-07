const TABS = [['dashboard', '📟', 'Tableau'], ['history', '📈', 'Historique'], ['settings', '⚙️', 'Réglages']]

export default function BottomNav({ page, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-10 bg-nav backdrop-blur border-t border-line" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-3">
        {TABS.map(([k, icon, label]) => (
          <button key={k} onClick={() => onChange(k)} className={`py-3 text-xs flex flex-col items-center gap-0.5 ${page === k ? 'text-amber-500' : 'text-mute'}`}>
            <span className="text-lg">{icon}</span>{label}
          </button>
        ))}
      </div>
    </nav>
  )
}
