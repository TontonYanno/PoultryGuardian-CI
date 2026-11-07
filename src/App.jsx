import { useState } from 'react'
import { useSettings } from './hooks/useSettings'
import { useCoop } from './hooks/useCoop'
import { useTheme } from './hooks/useTheme'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Settings from './pages/Settings'

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📟', label: 'Tableau de bord' },
  { id: 'history', icon: '📈', label: 'Historique' },
  { id: 'settings', icon: '⚙️', label: 'Réglages' },
]

export default function App() {
  const [settings, update] = useSettings()
  const coop = useCoop(settings) // vit à la racine : la régulation continue quelle que soit la page affichée
  useTheme(settings.theme)
  const nextTheme = { auto: 'light', light: 'dark', dark: 'auto' }
  const themeLabel = { auto: '🌗 Auto', light: '☀️ Clair', dark: '🌙 Sombre' }
  const [page, setPage] = useState('dashboard')

  const selectPage = (id) => {
    setPage(id)
    const drawer = document.getElementById('my-drawer-4')
    if (drawer) drawer.checked = false
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <nav className="navbar app-navbar sticky top-0 z-20 w-full">
          <label htmlFor="my-drawer-4" aria-label="Ouvrir le menu" className="btn btn-square btn-ghost drawer-button lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </label>
          <div className="px-3 font-semibold">PoultryGuardian<span className="text-amber-500">-CI</span></div>
          <div className="ml-auto">
            <button onClick={() => update({ theme: nextTheme[settings.theme] })} className="px-3 py-2 rounded-xl text-sm border border-line hover:bg-surface" title="Changer de thème">{themeLabel[settings.theme]}</button>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-4 md:p-6 pb-28 lg:pb-8">
          <header className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 grid place-items-center text-2xl">🐔</div>
            <div><h1 className="text-xl font-bold leading-tight">PoultryGuardian<span className="text-amber-400">-CI</span></h1><p className="text-xs text-mute">Poulailler connecté · supervision à distance</p></div>
          </header>
          {page === 'dashboard' && <Dashboard coop={coop} />}
          {page === 'history' && <History coop={coop} />}
          {page === 'settings' && <Settings settings={settings} update={update} />}
        </main>
      </div>

      <div className="drawer-side z-30">
        <label htmlFor="my-drawer-4" aria-label="Fermer le menu" className="drawer-overlay"></label>
        <aside className="app-sidebar flex min-h-full w-72 flex-col p-4">
          <div className="flex items-center gap-3 px-2 py-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 grid place-items-center text-xl">🐔</div>
            <div><p className="font-bold">PoultryGuardian<span className="text-amber-500">-CI</span></p><p className="text-xs text-mute">Supervision du poulailler</p></div>
          </div>
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-mute">Navigation</p>
          <ul className="menu w-full gap-1 p-0">
            {NAV_ITEMS.map(({ id, icon, label }) => (
              <li key={id}><button type="button" onClick={() => selectPage(id)} className={`sidebar-link ${page === id ? 'sidebar-link-active' : ''}`} aria-current={page === id ? 'page' : undefined}>
                <span className="text-lg" aria-hidden="true">{icon}</span><span>{label}</span>
              </button></li>
            ))}
          </ul>
          <div className="mt-auto rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-semibold">Suivi en direct</p><p className="mt-1 text-xs text-mute">Les données de votre élevage sont actualisées automatiquement.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
